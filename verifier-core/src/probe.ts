import { sha256Buffer } from "./hash";
import { InvalidOptionsError } from "./errors";

export const PROBE_ID = "MKT.PROBE.1679";
export const PROBE_FREQUENCY = 167.9;
export const SAMPLE_RATE = 44100;
export const SYNC_MS = 618;
export const BLOCK_SIZE = 27256;
export const CYCLES_PER_BLOCK = (BLOCK_SIZE * PROBE_FREQUENCY) / SAMPLE_RATE;
export const FREQUENCY_TOLERANCE_HZ = 0.01;

export type ProbeFailureCode =
  | "E1_SKEW"
  | "E2_RESAMPLE"
  | "E3_DROP"
  | "E4_HASH"
  | "E5_PHASE"
  | "OK";

export interface ProbeValidationResult {
  id: string;
  frame: number;
  region: string;
  layer: string;
  hash: string;
  expectedHash: string;
  fft_peak: number;
  phase_start: number;
  phase_end: number;
  duration_ms: number;
  error?: string;
  failure_code: ProbeFailureCode;
  drift: boolean;
}

const twoPi = Math.PI * 2;

export function phaseIncrement(): number {
  return (twoPi * PROBE_FREQUENCY) / SAMPLE_RATE;
}

export function framePhaseStart(frame: number): number {
  if (!Number.isInteger(frame) || frame < 0) {
    throw new InvalidOptionsError("Frame must be a non-negative integer");
  }
  return (frame * BLOCK_SIZE * phaseIncrement()) % twoPi;
}

export function framePhaseEnd(frame: number): number {
  return (framePhaseStart(frame) + BLOCK_SIZE * phaseIncrement()) % twoPi;
}

export function generateProbeBlock(frame: number): Float32Array {
  const phase0 = framePhaseStart(frame);
  const increment = phaseIncrement();
  const block = new Float32Array(BLOCK_SIZE);

  for (let i = 0; i < BLOCK_SIZE; i++) {
    block[i] = Math.sin(phase0 + increment * i);
  }

  return block;
}

export function float32ArrayToLittleEndianBuffer(array: Float32Array): Buffer {
  const buffer = Buffer.alloc(array.length * Float32Array.BYTES_PER_ELEMENT);
  const view = new DataView(array.buffer, array.byteOffset, array.byteLength);

  for (let i = 0; i < array.length; i++) {
    buffer.writeFloatLE(view.getFloat32(i * 4, true), i * 4);
  }

  return buffer;
}

export function probeHash(block: Float32Array): string {
  if (!(block instanceof Float32Array)) {
    throw new InvalidOptionsError("Probe block must be a Float32Array");
  }
  if (block.length !== BLOCK_SIZE) {
    throw new InvalidOptionsError(`Probe block must contain ${BLOCK_SIZE} samples`);
  }

  const buffer = float32ArrayToLittleEndianBuffer(block);
  return sha256Buffer(buffer);
}

export function estimateFrequencyFromZeroCrossings(block: Float32Array): number {
  if (!(block instanceof Float32Array) || block.length === 0) {
    throw new InvalidOptionsError("Probe block must be a non-empty Float32Array");
  }

  const crossingTimes: number[] = [];
  let previous = block[0];

  for (let i = 1; i < block.length; i++) {
    const current = block[i];
    if ((previous > 0 && current <= 0) || (previous < 0 && current >= 0)) {
      const ratio = Math.abs(previous) / (Math.abs(previous) + Math.abs(current));
      const crossingIndex = i - 1 + ratio;
      crossingTimes.push(crossingIndex / SAMPLE_RATE);
    }
    previous = current;
  }

  if (crossingTimes.length < 2) {
    throw new InvalidOptionsError("Not enough zero crossings to estimate frequency");
  }

  const durationSeconds = BLOCK_SIZE / SAMPLE_RATE;
  const zeroCrossingCount = crossingTimes.length;
  const cycles = zeroCrossingCount / 2;

  return cycles / durationSeconds;
}

export function normalizePhase(value: number): number {
  let phase = value % twoPi;
  if (phase < 0) phase += twoPi;
  return phase;
}

export function phaseContinuityValid(
  prevPhaseEnd: number,
  nextPhaseStart: number
): boolean {
  const delta = normalizePhase(nextPhaseStart - prevPhaseEnd);
  return Math.abs(delta) < 0.0001 || Math.abs(delta - twoPi) < 0.0001;
}

export function validateProbeBlock(
  block: Float32Array,
  frame: number,
  region: string,
  layer: string,
  prevPhaseEnd?: number
): ProbeValidationResult {
  const result: ProbeValidationResult = {
    id: PROBE_ID,
    frame,
    region,
    layer,
    hash: "",
    expectedHash: "",
    fft_peak: 0,
    phase_start: 0,
    phase_end: 0,
    duration_ms: (BLOCK_SIZE / SAMPLE_RATE) * 1000,
    failure_code: "OK",
    drift: false
  };

  if (!(block instanceof Float32Array) || block.length !== BLOCK_SIZE) {
    result.failure_code = "E3_DROP";
    result.error = `Probe block length invalid: ${block.length} expected ${BLOCK_SIZE}`;
    result.drift = true;
    return result;
  }

  result.phase_start = normalizePhase(framePhaseStart(frame));
  result.phase_end = normalizePhase(framePhaseEnd(frame));

  try {
    result.hash = probeHash(block);
    result.expectedHash = probeHash(generateProbeBlock(frame));
  } catch (error) {
    result.failure_code = "E4_HASH";
    result.error = error instanceof Error ? error.message : String(error);
    result.drift = true;
    return result;
  }

  if (result.hash !== result.expectedHash) {
    result.fft_peak = estimateFrequencyFromZeroCrossings(block);

    if (result.fft_peak >= 167.3 && result.fft_peak <= 167.7) {
      result.failure_code = "E1_SKEW";
      result.error = "Probe frequency indicates upstream clock drift";
      result.drift = true;
      return result;
    }

    if (result.fft_peak >= 168.1 && result.fft_peak <= 168.5) {
      result.failure_code = "E2_RESAMPLE";
      result.error = "Probe frequency indicates vendor resampling or interpolation";
      result.drift = true;
      return result;
    }

    result.failure_code = "E4_HASH";
    result.error = "SHA-256 mismatch against deterministic reference block";
    result.drift = true;
    return result;
  }

  result.fft_peak = PROBE_FREQUENCY;

  const deltaPhase = prevPhaseEnd !== undefined ? normalizePhase(result.phase_start - prevPhaseEnd) : 0;
  if (prevPhaseEnd !== undefined && !phaseContinuityValid(prevPhaseEnd, result.phase_start)) {
    result.failure_code = "E5_PHASE";
    result.error = "Phase discontinuity detected across heartbeat windows";
    result.drift = true;
    return result;
  }

  result.failure_code = "OK";
  result.drift = false;
  return result;
}

export interface ProbeTickEvent {
  frame: number;
  region: string;
  layer: string;
  hash: string;
  fft_peak: number;
  t_emit: string;
  failure_code: ProbeFailureCode;
}

export function buildProbeTickEvent(
  validation: ProbeValidationResult
): ProbeTickEvent {
  return {
    frame: validation.frame,
    region: validation.region,
    layer: validation.layer,
    hash: validation.hash,
    fft_peak: validation.fft_peak,
    t_emit: new Date().toISOString(),
    failure_code: validation.failure_code
  };
}
