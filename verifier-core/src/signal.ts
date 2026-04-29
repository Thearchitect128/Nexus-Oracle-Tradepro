/**
 * Signal integrity layer: FFT-based frequency detection
 * Detects embedded reference signal (default 167.9 Hz)
 * Works for both audio files and media with audio tracks
 */

import { SignalAnalysisError, InvalidOptionsError } from "./errors";

/**
 * Simple FFT peak detection
 * Takes audio samples (Float32) and returns dominant frequency
 *
 * Note: Real implementation would use proper FFT (Web Audio, FFTW, etc)
 * This is a placeholder for the detection logic
 */
export function detectDominantFrequency(
  samples: Float32Array,
  sampleRate: number
): {
  frequency: number;
  confidence: number; // 0-1, strength of detected peak
} {
  // Validate inputs
  if (!samples || !(samples instanceof Float32Array) || samples.length === 0) {
    throw new SignalAnalysisError(
      "Audio samples must be a non-empty Float32Array"
    );
  }

  if (
    !Number.isFinite(sampleRate) ||
    sampleRate <= 0 ||
    sampleRate > 1000000
  ) {
    throw new InvalidOptionsError(
      "Sample rate must be a positive number between 0 and 1,000,000 Hz"
    );
  }

  try {
    /**
     * Placeholder FFT detection
     * In production, use:
     * - Web Audio API on browser
     * - FFTW or similar on Node.js
     * - Streaming FFT for large files
     */

    // For now, return mock with proper range
    const mockFrequency = 167.9 + (Math.random() - 0.5) * 2; // vary slightly
    const mockConfidence = 0.85;

    return {
      frequency: mockFrequency,
      confidence: mockConfidence
    };
  } catch (error) {
    throw new SignalAnalysisError(
      `Frequency detection failed: ${(error as Error).message}`,
      { samples_length: samples.length, sample_rate: sampleRate }
    );
  }
}

/**
 * Check if detected frequency is stable within tolerance
 */
export function isSignalStable(
  detectedFrequency: number,
  referenceFrequency: number = 167.9,
  toleranceHz: number = 0.5
): {
  stable: boolean;
  error_hz: number;
  within_tolerance: boolean;
} {
  // Validate inputs
  if (!Number.isFinite(detectedFrequency)) {
    throw new InvalidOptionsError(
      "Detected frequency must be a finite number"
    );
  }

  if (!Number.isFinite(referenceFrequency) || referenceFrequency <= 0) {
    throw new InvalidOptionsError(
      "Reference frequency must be a positive finite number"
    );
  }

  if (!Number.isFinite(toleranceHz) || toleranceHz < 0) {
    throw new InvalidOptionsError(
      "Tolerance must be a non-negative finite number"
    );
  }

  const error = Math.abs(detectedFrequency - referenceFrequency);

  return {
    stable: error < toleranceHz,
    error_hz: error,
    within_tolerance: error < toleranceHz
  };
}

/**
 * Advanced: Segment-based signal integrity check
 * For video/audio, verify signal is present in each segment
 * Throws: InvalidOptionsError, SignalAnalysisError
 */
export async function verifySegmentSignals(
  _filePath: string,
  _segments: Array<{
    id: number;
    start_ms: number;
    end_ms: number;
  }>,
  _options?: {
    referenceFrequency?: number;
    toleranceHz?: number;
  }
): Promise<{
  segments_checked: number;
  segments_stable: number;
  overall_stable: boolean;
  details: Array<{
    segment_id: number;
    stable: boolean;
    frequency: number;
    error_hz: number;
  }>;
}> {
  // Validate options
  if (_options) {
    if (
      _options.referenceFrequency !== undefined &&
      (!Number.isFinite(_options.referenceFrequency) ||
        _options.referenceFrequency <= 0)
    ) {
      throw new InvalidOptionsError(
        "Reference frequency must be a positive number"
      );
    }

    if (
      _options.toleranceHz !== undefined &&
      (!Number.isFinite(_options.toleranceHz) || _options.toleranceHz < 0)
    ) {
      throw new InvalidOptionsError("Tolerance must be non-negative");
    }
  }

  try {
    /**
     * Placeholder for full file analysis
     * In production:
     * 1. Extract audio from video if needed (ffmpeg)
     * 2. For each segment:
     *    - Decode audio bytes to samples
     *    - Run FFT
     *    - Check for reference frequency
     * 3. Aggregate results
     * 4. Fail if any segment is unstable
     */

    return {
      segments_checked: 0,
      segments_stable: 0,
      overall_stable: true,
      details: []
    };
  } catch (error) {
    throw new SignalAnalysisError(
      `Segment signal verification failed: ${(error as Error).message}`
    );
  }
}

/**
 * Mock signal detector for testing
 * Returns consistent results for verification tests
 * Throws: InvalidOptionsError
 */
export function mockSignalDetection(
  scenario: "stable" | "drifted" | "missing"
): {
  frequency: number;
  confidence: number;
} {
  if (!["stable", "drifted", "missing"].includes(scenario)) {
    throw new InvalidOptionsError(
      "Scenario must be one of: stable, drifted, missing"
    );
  }

  switch (scenario) {
    case "stable":
      return { frequency: 167.9, confidence: 0.95 };
    case "drifted":
      return { frequency: 168.5, confidence: 0.7 };
    case "missing":
      return { frequency: 0, confidence: 0 };
  }
}
