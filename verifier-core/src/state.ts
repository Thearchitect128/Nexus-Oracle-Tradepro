import { VerificationState } from "./schema";

/**
 * State machine: deterministic classification
 * No soft paths, no interpretation
 * Either it's true or it's not
 */

export interface ClassificationInput {
  hasManifest: boolean;
  hashMatch: boolean;
  signatureValid: boolean;
  transformsValid: boolean;
  signalStable?: boolean;
}

/**
 * Classify asset state based on verification checks
 * This is the heart of the system: deterministic, fail-hard
 */
export function classify(input: ClassificationInput): VerificationState {
  // No manifest = cannot verify
  if (!input.hasManifest) {
    return "UNKNOWN";
  }

  // Invalid signature = broken
  if (!input.signatureValid) {
    return "BROKEN";
  }

  // Hash matches + transforms valid + signal stable (if checked) = verified
  const signalOk = input.signalStable !== false;
  if (input.hashMatch && input.transformsValid && signalOk) {
    return "VERIFIED";
  }

  // Hash changed but transforms explain it = transformed
  if (!input.hashMatch && input.transformsValid) {
    return "TRANSFORMED";
  }

  // Any other state with valid signature but mismatch = broken
  return "BROKEN";
}

/**
 * Compute trust score (0-100)
 * VERIFIED = 100
 * TRANSFORMED = 60 (hash changed but provenance intact)
 * BROKEN = 0
 * UNKNOWN = 0
 */
export function trustScore(state: VerificationState): number {
  switch (state) {
    case "VERIFIED":
      return 100;
    case "TRANSFORMED":
      return 60;
    case "BROKEN":
    case "UNKNOWN":
    default:
      return 0;
  }
}

/**
 * Explain the verification state in human terms
 */
export function explainState(state: VerificationState): string {
  switch (state) {
    case "VERIFIED":
      return "Authenticity confirmed. Hash and signature valid. Transforms apply correctly.";
    case "TRANSFORMED":
      return "Hash changed but provenance intact. Edits are documented and signed.";
    case "BROKEN":
      return "Authenticity failed. Signature invalid or transform chain broken.";
    case "UNKNOWN":
      return "No provenance data. Cannot verify authenticity.";
  }
}
