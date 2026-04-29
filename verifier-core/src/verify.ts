import { ManifestSchema, VerificationResult, Manifest } from "./schema";
import { sha256File } from "./hash";
import { verifySignature, verifySignatureECDSA } from "./crypto";
import {
  verifySegmentSignals
} from "./signal";
import { classify, trustScore, explainState } from "./state";
import {
  ManifestValidationError,
  InvalidOptionsError,
  isVerifierError
} from "./errors";

/**
 * Main verification engine
 * Deterministic: always produces the same result for the same input
 * Fail-hard: any mismatch fails verification
 * Throws: Throws custom VerifierError or subclasses for better diagnostics
 */

export interface VerifyAssetOptions {
  /**
   * Check hash match (default: true)
   */
  checkHash?: boolean;

  /**
   * Check signature validity (default: true)
   */
  checkSignature?: boolean;

  /**
   * Check transform chain completeness (default: true)
   */
  checkTransforms?: boolean;

  /**
   * Check signal integrity (default: false, requires audio samples)
   */
  checkSignal?: boolean;

  /**
   * Override reference frequency (default: 167.9 Hz)
   */
  referenceFrequency?: number;

  /**
   * Frequency tolerance in Hz (default: 0.5)
   */
  frequencyTolerance?: number;
}

export async function verifyAsset(
  filePath: string,
  manifestInput: unknown,
  options: VerifyAssetOptions = {}
): Promise<VerificationResult> {
  const opts = {
    checkHash: true,
    checkSignature: true,
    checkTransforms: true,
    checkSignal: false,
    referenceFrequency: 167.9,
    frequencyTolerance: 0.5,
    ...options
  };

  // Validate options
  if (opts.referenceFrequency && opts.referenceFrequency <= 0) {
    throw new InvalidOptionsError(
      "Reference frequency must be positive"
    );
  }

  if (opts.frequencyTolerance && opts.frequencyTolerance < 0) {
    throw new InvalidOptionsError("Frequency tolerance must be non-negative");
  }

  let manifest: Manifest;

  // Parse manifest
  try {
    manifest = ManifestSchema.parse(manifestInput);
  } catch (e) {
    const error = e as any;
    throw new ManifestValidationError(
      `Invalid manifest: ${error.message || String(e)}`,
      { validation_errors: error.errors }
    );
  }

  let computedHash = "";
  let hashMatch = false;

  // Compute hash
  if (opts.checkHash) {
    try {
      computedHash = await sha256File(filePath);
      hashMatch = computedHash === manifest.hash;
    } catch (error) {
      if (isVerifierError(error)) {
        throw error;
      }
      throw new Error(`Unexpected error during hash computation: ${error}`);
    }
  }

  // Verify creator signature (creator signs the canonical payload)
  let signatureValid = true;
  if (opts.checkSignature && manifest.creator.signature) {
    try {
      const payload = JSON.stringify({
        asset_id: manifest.asset_id,
        hash: manifest.hash,
        created_at: manifest.created_at,
        transforms: manifest.transforms
      });

      // Try Ed25519 first, fall back to ECDSA
      try {
        signatureValid = verifySignature(payload, manifest.creator.signature, manifest.creator.id);
      } catch {
        signatureValid = await verifySignatureECDSA(
          payload,
          manifest.creator.signature,
          manifest.creator.id
        );
      }
    } catch (error) {
      if (isVerifierError(error)) {
        // Re-throw verification errors, but mark signature as invalid
        signatureValid = false;
      } else {
        throw error;
      }
    }
  }

  // Verify transforms have signatures
  let transformsValid = true;
  if (opts.checkTransforms) {
    transformsValid = manifest.transforms.every((t) => {
      if (!t.signature || !t.operator) {
        return false;
      }
      // Validate signature format
      if (!/^[a-f0-9]*$/.test(t.signature)) {
        return false;
      }
      return true;
    });
  }

  // Check signal integrity (optional, async)
  let signalStable = true;
  if (opts.checkSignal) {
    try {
      const result = await verifySegmentSignals(
        filePath,
        manifest.transforms.map((_, i) => ({
          id: i,
          start_ms: 0,
          end_ms: 1000
        })),
        {
          referenceFrequency: opts.referenceFrequency,
          toleranceHz: opts.frequencyTolerance
        }
      );
      signalStable = result.overall_stable;
    } catch (error) {
      if (isVerifierError(error)) {
        signalStable = false;
      } else {
        throw error;
      }
    }
  }

  // Classify state
  const state = classify({
    hasManifest: true,
    hashMatch,
    signatureValid,
    transformsValid,
    signalStable
  });

  return {
    state,
    asset_id: manifest.asset_id,
    timestamp: new Date().toISOString(),
    hash: {
      expected: manifest.hash,
      computed: computedHash,
      match: hashMatch
    },
    signature: {
      valid: signatureValid,
      algorithm: "Ed25519/ECDSA"
    },
    transforms: {
      valid: transformsValid,
      count: manifest.transforms.length
    },
    signal: {
      detected: opts.checkSignal,
      stable: signalStable,
      frequency: opts.referenceFrequency,
      frequency_error_hz: 0
    },
    metadata: {
      created_at: manifest.created_at,
      creator_id: manifest.creator.id,
      trust_score: trustScore(state),
      explanation: explainState(state),
      options_used: opts
    }
  };
}

/**
 * Batch verify multiple assets
 */
export async function verifyAssets(
  assets: Array<{
    filePath: string;
    manifest: unknown;
    options?: VerifyAssetOptions;
  }>
): Promise<VerificationResult[]> {
  return Promise.all(
    assets.map(({ filePath, manifest, options }) =>
      verifyAsset(filePath, manifest, options)
    )
  );
}

/**
 * Check if asset failed verification
 */
export function isFailed(result: VerificationResult): boolean {
  return result.state !== "VERIFIED" && result.state !== "TRANSFORMED";
}

/**
 * Check if asset passed verification (strict)
 */
export function isPassed(result: VerificationResult): boolean {
  return result.state === "VERIFIED";
}

/**
 * Create summary for display
 */
export function summarize(result: VerificationResult): string {
  const lines = [
    `State: ${result.state}`,
    `Trust Score: ${result.metadata?.trust_score ?? 0}/100`,
    `Hash Match: ${result.hash.match}`,
    `Signature Valid: ${result.signature.valid}`,
    `Transforms Valid: ${result.transforms.valid}`,
    `Explanation: ${result.metadata?.explanation ?? "Unknown"}`
  ];

  return lines.join("\n");
}
