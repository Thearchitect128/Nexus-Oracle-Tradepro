import { describe, it, expect } from "vitest";
import {
  BLOCK_SIZE,
  PROBE_FREQUENCY,
  generateProbeBlock,
  validateProbeBlock,
  buildProbeTickEvent
} from "./probe";

describe("Probe specification", () => {
  it("generates the expected block length and frequency", () => {
    const frame = 0;
    const block = generateProbeBlock(frame);

    expect(block.length).toBe(BLOCK_SIZE);
    expect(block[0]).toBeCloseTo(0, 8);
    expect(block[1]).toBeGreaterThan(block[0]);
  });

  it("validates a correct probe block as OK", () => {
    const frame = 1;
    const region = "Americas";
    const layer = "L0_SOURCE";
    const block = generateProbeBlock(frame);

    const result = validateProbeBlock(block, frame, region, layer);
    expect(result.failure_code).toBe("OK");
    expect(result.drift).toBe(false);
    expect(result.fft_peak).toBeCloseTo(PROBE_FREQUENCY, 1);
    expect(result.hash).toBe(result.expectedHash);

    const event = buildProbeTickEvent(result);
    expect(event.frame).toBe(frame);
    expect(event.layer).toBe(layer);
    expect(event.failure_code).toBe("OK");
  });

  it("detects dropped packet lengths", () => {
    const frame = 0;
    const region = "Europe";
    const layer = "L1_NORMALIZE";
    const shortBlock = generateProbeBlock(frame).subarray(0, BLOCK_SIZE - 10);

    const result = validateProbeBlock(shortBlock as any, frame, region, layer);
    expect(result.failure_code).toBe("E3_DROP");
    expect(result.drift).toBe(true);
  });
});
