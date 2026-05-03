import { describe, expect, it } from "vitest";
import { computeCompoundInterest } from "../src/core/financialVerification.js";
import {
  attachSignature,
  fingerprintPublicKey,
  generateSigningKeyPair,
  verifyRecordSignature,
} from "../src/core/signing.js";

describe("ed25519 signing", () => {
  it("signs and verifies a financial record", () => {
    const keys = generateSigningKeyPair();
    const record = computeCompoundInterest(167.89, 0.05, 10);
    const signed = attachSignature(record, keys.privateKeyPem, keys.publicKeyPem);

    expect(signed.signatureHex).toMatch(/^[a-f0-9]{128}$/);
    expect(
      verifyRecordSignature(signed.record, signed.signatureHex, signed.publicKeyPem),
    ).toBe(true);
  });

  it("detects tampering", () => {
    const keys = generateSigningKeyPair();
    const record = computeCompoundInterest(167.89, 0.05, 10);
    const signed = attachSignature(record, keys.privateKeyPem, keys.publicKeyPem);

    const tampered = {
      ...signed.record,
      final: {
        ...signed.record.final,
        value: signed.record.final.value + 0.01,
      },
    };

    expect(verifyRecordSignature(tampered, signed.signatureHex, signed.publicKeyPem)).toBe(false);
  });

  it("returns stable fingerprint for same public key", () => {
    const keys = generateSigningKeyPair();
    expect(fingerprintPublicKey(keys.publicKeyPem)).toBe(fingerprintPublicKey(keys.publicKeyPem));
  });
});
