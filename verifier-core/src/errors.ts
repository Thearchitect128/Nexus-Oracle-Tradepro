/**
 * Custom error types for verifier-core
 * Enables precise error handling and debugging
 */

/**
 * Base error for all verifier-core operations
 */
export class VerifierError extends Error {
  constructor(
    public code: string,
    message: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "VerifierError";
    Object.setPrototypeOf(this, VerifierError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context
    };
  }
}

/**
 * Thrown when manifest validation fails
 */
export class ManifestValidationError extends VerifierError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("MANIFEST_INVALID", message, context);
    this.name = "ManifestValidationError";
    Object.setPrototypeOf(this, ManifestValidationError.prototype);
  }
}

/**
 * Thrown when file cannot be accessed or read
 */
export class FileAccessError extends VerifierError {
  constructor(
    public filePath: string,
    message: string,
    public originalError?: Error
  ) {
    super("FILE_ACCESS_FAILED", message, { filePath });
    this.name = "FileAccessError";
    Object.setPrototypeOf(this, FileAccessError.prototype);
  }
}

/**
 * Thrown when hash computation fails
 */
export class HashComputationError extends VerifierError {
  constructor(
    public filePath: string,
    message: string,
    public originalError?: Error
  ) {
    super("HASH_COMPUTATION_FAILED", message, { filePath });
    this.name = "HashComputationError";
    Object.setPrototypeOf(this, HashComputationError.prototype);
  }
}

/**
 * Thrown when signature verification fails due to crypto error
 */
export class SignatureVerificationError extends VerifierError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("SIGNATURE_VERIFICATION_FAILED", message, context);
    this.name = "SignatureVerificationError";
    Object.setPrototypeOf(this, SignatureVerificationError.prototype);
  }
}

/**
 * Thrown when signal detection/analysis fails
 */
export class SignalAnalysisError extends VerifierError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("SIGNAL_ANALYSIS_FAILED", message, context);
    this.name = "SignalAnalysisError";
    Object.setPrototypeOf(this, SignalAnalysisError.prototype);
  }
}

/**
 * Thrown when options are invalid
 */
export class InvalidOptionsError extends VerifierError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("INVALID_OPTIONS", message, context);
    this.name = "InvalidOptionsError";
    Object.setPrototypeOf(this, InvalidOptionsError.prototype);
  }
}

/**
 * Type guard: check if error is a VerifierError
 */
export function isVerifierError(error: unknown): error is VerifierError {
  return error instanceof VerifierError;
}

/**
 * Extract user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof VerifierError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Get error code from any error
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof VerifierError) {
    return error.code;
  }
  if (error instanceof Error) {
    return error.name;
  }
  return "UNKNOWN_ERROR";
}
