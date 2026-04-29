import { createPublicKey, createPrivateKey, sign, verify } from "crypto";
import { SignatureVerificationError } from "./errors";

/**
 * Ed25519 signing (deterministic, fail-hard)
 * Throws: SignatureVerificationError
 */
export function signData(
  data: string,
  privateKeyPem: string
): string {
  if (typeof data !== "string") {
    throw new SignatureVerificationError("Data must be a string");
  }

  if (typeof privateKeyPem !== "string" || privateKeyPem.trim().length === 0) {
    throw new SignatureVerificationError("Private key must be a non-empty string");
  }

  try {
    const privateKey = createPrivateKey({
      key: privateKeyPem,
      format: "pem"
    });

    const signature = sign(null, Buffer.from(data), privateKey);
    return signature.toString("hex");
  } catch (error) {
    throw new SignatureVerificationError(
      `Failed to sign data: ${(error as Error).message}`,
      { data_length: data.length }
    );
  }
}

/**
 * Ed25519 verification (strict: valid or invalid, no soft errors)
 * Throws: SignatureVerificationError
 */
export function verifySignature(
  data: string,
  signature: string,
  publicKeyPem: string
): boolean {
  if (typeof data !== "string") {
    throw new SignatureVerificationError("Data must be a string");
  }

  if (typeof signature !== "string" || !signature.match(/^[a-f0-9]*$/)) {
    throw new SignatureVerificationError(
      "Signature must be a hex string"
    );
  }

  if (typeof publicKeyPem !== "string" || publicKeyPem.trim().length === 0) {
    throw new SignatureVerificationError("Public key must be a non-empty string");
  }

  try {
    const publicKey = createPublicKey({
      key: publicKeyPem,
      format: "pem"
    });

    return verify(
      null,
      Buffer.from(data),
      publicKey,
      Buffer.from(signature, "hex")
    );
  } catch (error) {
    throw new SignatureVerificationError(
      `Signature verification failed: ${(error as Error).message}`,
      { data_length: data.length, signature_length: signature.length }
    );
  }
}

/**
 * ECDSA P-256 signing (used in existing standaloneVerifier pattern)
 * Throws: SignatureVerificationError
 */
export async function signDataECDSA(
  data: string,
  privateKeyPem: string
): Promise<string> {
  if (typeof data !== "string") {
    throw new SignatureVerificationError("Data must be a string");
  }

  if (typeof privateKeyPem !== "string" || privateKeyPem.trim().length === 0) {
    throw new SignatureVerificationError("Private key must be a non-empty string");
  }

  try {
    const privateKey = createPrivateKey({
      key: privateKeyPem,
      format: "pem"
    });

    const signature = sign("sha256", Buffer.from(data), privateKey);
    return signature.toString("hex");
  } catch (error) {
    throw new SignatureVerificationError(
      `ECDSA signing failed: ${(error as Error).message}`,
      { data_length: data.length }
    );
  }
}

/**
 * ECDSA P-256 verification
 * Throws: SignatureVerificationError
 */
export async function verifySignatureECDSA(
  data: string,
  signature: string,
  publicKeyPem: string
): Promise<boolean> {
  if (typeof data !== "string") {
    throw new SignatureVerificationError("Data must be a string");
  }

  if (typeof signature !== "string" || !signature.match(/^[a-f0-9]*$/)) {
    throw new SignatureVerificationError("Signature must be a hex string");
  }

  if (typeof publicKeyPem !== "string" || publicKeyPem.trim().length === 0) {
    throw new SignatureVerificationError("Public key must be a non-empty string");
  }

  try {
    const publicKey = createPublicKey({
      key: publicKeyPem,
      format: "pem"
    });

    return verify(
      "sha256",
      Buffer.from(data),
      publicKey,
      Buffer.from(signature, "hex")
    );
  } catch (error) {
    throw new SignatureVerificationError(
      `ECDSA verification failed: ${(error as Error).message}`,
      { data_length: data.length, signature_length: signature.length }
    );
  }
}
