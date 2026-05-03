// Public API exports

export { ManifestSchema, TransformSchema, CreatorSchema } from "./schema";
export type {
  Manifest,
  Transform,
  Creator,
  VerificationRequest,
  VerificationState,
  VerificationResult,
  Segment
} from "./schema";

export { sha256File, sha256Buffer, sha256String, segmentHash } from "./hash";

export { signData, verifySignature, signDataECDSA, verifySignatureECDSA } from "./crypto";

export {
  detectDominantFrequency,
  isSignalStable,
  verifySegmentSignals,
  mockSignalDetection
} from "./signal";

export {
  PROBE_ID,
  PROBE_FREQUENCY,
  SAMPLE_RATE,
  BLOCK_SIZE,
  SYNC_MS,
  CYCLES_PER_BLOCK,
  FREQUENCY_TOLERANCE_HZ,
  generateProbeBlock,
  validateProbeBlock,
  buildProbeTickEvent
} from "./probe";
export type { ProbeValidationResult, ProbeFailureCode, ProbeTickEvent } from "./probe";

export { classify, trustScore, explainState } from "./state";
export type { ClassificationInput } from "./state";

export {
  verifyAsset,
  verifyAssets,
  isFailed,
  isPassed,
  summarize
} from "./verify";
export type { VerifyAssetOptions } from "./verify";

export {
  classifyMarketFeed,
  MarketFeedSchema,
  MarketVerifyRequestSchema
} from "./market";
export type { MarketFeed, MarketClassification, MarketVerifyRequest } from "./market";

export {
  VerifierError,
  ManifestValidationError,
  FileAccessError,
  HashComputationError,
  SignatureVerificationError,
  SignalAnalysisError,
  InvalidOptionsError,
  isVerifierError,
  getErrorMessage,
  getErrorCode
} from "./errors";

