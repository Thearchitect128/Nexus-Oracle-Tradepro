import { describe, expect, it } from "vitest";
import {
  AppendOnlyAuditLog,
  COMPOUND_DERIVATION,
  computeCompoundInterest,
  hashInputs,
  validateClaim,
} from "../src/core/financialVerification.js";

describe("financial verification contract", () => {
  it("computes the default 167.89 vector and validates invariant", () => {
    const record = computeCompoundInterest(167.89, 0.05, 10);

    expect(record.final.value).toBeCloseTo(273.47511888966477, 10);
    expect(record.gain.value).toBeCloseTo(105.58511888966476, 10);
    expect(record.final.verified).toBe(true);
    expect(validateClaim(record)).toEqual({ ok: true, reasons: [] });
  });

  it("uses deterministic hashes for [167.89, 0.05, 10]", () => {
    const hashA = hashInputs([167.89, 0.05, 10]);
    const hashB = hashInputs([167.89, 0.05, 10]);

    expect(hashA).toBe(hashB);
  });

  it("sanitizes malformed numeric inputs instead of throwing", () => {
    const record = computeCompoundInterest("Laz+nxCarLW", 0.05, 10);

    expect(record.principal.value).toBe(0);
    expect(validateClaim(record).ok).toBe(true);
  });

  it("rejects missing provenance / wrong derivation claims", () => {
    const record = computeCompoundInterest(167.89, 0.05, 10);
    record.final.provenance.derivation = "principal + rate + time";
    record.final.provenance.hash = "invalid";

    const validation = validateClaim(record);
    expect(validation.ok).toBe(false);
    expect(validation.reasons).toContain("Hash mismatch for final claim provenance inputs.");
    expect(validation.reasons).toContain("Final claim derivation mismatch.");
  });

  it("persists append-only audit logs and exports JSON", () => {
    const backing = new Map<string, string>();
    const storage = {
      getItem: (key: string) => backing.get(key) ?? null,
      setItem: (key: string, value: string) => {
        backing.set(key, value);
      },
    };

    const log = new AppendOnlyAuditLog({ storage, maxEntries: 2 });
    log.append(computeCompoundInterest(100, 0.05, 1));
    log.append(computeCompoundInterest(200, 0.05, 1));
    log.append(computeCompoundInterest(300, 0.05, 1));

    const entries = log.all();
    expect(entries).toHaveLength(2);
    expect(entries[0].final.provenance.derivation).toBe(COMPOUND_DERIVATION);
    expect(JSON.parse(log.exportJson())).toHaveLength(2);
  });
});
