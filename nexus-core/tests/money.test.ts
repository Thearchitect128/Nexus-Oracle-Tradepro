import { describe, expect, it } from "vitest";
import {
  AppendOnlyAuditLog,
  COMPOUND_DERIVATION,
  COMPOUND_SOURCE,
  computeCompoundInterest,
  hashInputs,
  validateClaim,
} from "../src/core/financialVerification.js";

function assertVerificationRecordShape(record: ReturnType<typeof computeCompoundInterest>): void {
  expect(record).toHaveProperty("id");
  expect(record).toHaveProperty("createdAt");

  for (const claimName of ["principal", "final", "gain"] as const) {
    const claim = record[claimName];
    expect(claim.label).toBe(claimName);
    expect(typeof claim.value).toBe("number");
    expect(typeof claim.verified).toBe("boolean");
    expect(Array.isArray(claim.reasons)).toBe(true);

    expect(claim.provenance.source).toBe(COMPOUND_SOURCE);
    expect(claim.provenance.derivation).toBe(COMPOUND_DERIVATION);
    expect(Array.isArray(claim.provenance.inputs)).toBe(true);
    expect(claim.provenance.inputs).toHaveLength(3);
    expect(typeof claim.provenance.hash).toBe("string");
    expect(claim.provenance.hash.length).toBeGreaterThan(0);
    expect(new Date(claim.provenance.measuredAt).toString()).not.toBe("Invalid Date");
  }
}

describe("money guarantees", () => {
  it("keeps the canonical 167.89 case stable", () => {
    const record = computeCompoundInterest(167.89, 0.05, 10);

    expect(record.final.value).toBeCloseTo(273.47511888966477, 12);
    expect(record.gain.value).toBeCloseTo(105.58511888966476, 12);
    expect(validateClaim(record)).toEqual({ ok: true, reasons: [] });
  });

  it("enforces record schema/shape", () => {
    const record = computeCompoundInterest(167.89, 0.05, 10);
    assertVerificationRecordShape(record);
  });

  it("is deterministic for hashes", () => {
    const expected = "_TqpR1_Oj4UWo0y1Du_LR6-iMAi5mAJXsZUghaP7mTY";
    expect(hashInputs([167.89, 0.05, 10])).toBe(expected);
    expect(hashInputs([167.89, 0.05, 10])).toBe(hashInputs([167.89, 0.05, 10]));
  });

  it("keeps rounding policy explicit (no forced rounding)", () => {
    const record = computeCompoundInterest(0.1, 0.2, 2);
    const precise = 0.1 * (1 + 0.2) ** 2;

    expect(record.final.value).toBe(precise);
    expect(record.final.value).not.toBe(Number(record.final.value.toFixed(2)));
  });

  it("guards append-only log immutability from caller mutation", () => {
    const backing = new Map<string, string>();
    const storage = {
      getItem: (key: string) => backing.get(key) ?? null,
      setItem: (key: string, value: string) => {
        backing.set(key, value);
      },
    };

    const log = new AppendOnlyAuditLog({ storage, maxEntries: 3 });
    log.append(computeCompoundInterest(100, 0.05, 1));

    const snapshot = log.all();
    snapshot.push(computeCompoundInterest(999, 0.05, 1));

    expect(snapshot).toHaveLength(2);
    expect(log.all()).toHaveLength(1);
  });

  it("covers edge cases without silent failure", () => {
    const malformed = computeCompoundInterest("not-a-number", Infinity, "NaN");
    expect(malformed.principal.value).toBe(0);
    expect(malformed.final.value).toBe(0);
    expect(malformed.gain.value).toBe(0);
    expect(validateClaim(malformed)).toEqual({ ok: true, reasons: [] });
  });
});
