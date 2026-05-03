import { createHash } from "node:crypto";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type Provenance = {
  source: string;
  derivation: string;
  measuredAt: string;
  inputs: readonly [number, number, number];
  hash: string;
};

export type NumericClaim = {
  label: "principal" | "final" | "gain";
  value: number;
  provenance: Provenance;
  verified: boolean;
  reasons: string[];
};

export type VerificationRecord = {
  id: string;
  createdAt: string;
  principal: NumericClaim;
  final: NumericClaim;
  gain: NumericClaim;
};

export const COMPOUND_DERIVATION = "principal * (1 + rate)^time";
export const COMPOUND_SOURCE = "engine.compoundInterest";

export function sanitizeNumber(input: unknown): number {
  const numeric = typeof input === "number" ? input : Number(input);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function hashInputs(inputs: readonly [number, number, number]): string {
  const body = JSON.stringify(inputs);
  return createHash("sha256").update(body).digest("base64url");
}

export function computeCompoundInterest(
  principalInput: unknown,
  rateInput = 0.05,
  timeInput = 10,
): VerificationRecord {
  const principal = sanitizeNumber(principalInput);
  const rate = sanitizeNumber(rateInput);
  const time = sanitizeNumber(timeInput);
  const inputs: readonly [number, number, number] = [principal, rate, time];
  const finalValue = principal * (1 + rate) ** time;
  const gainValue = finalValue - principal;

  const provenance: Provenance = {
    source: COMPOUND_SOURCE,
    derivation: COMPOUND_DERIVATION,
    measuredAt: new Date().toISOString(),
    inputs,
    hash: hashInputs(inputs),
  };

  const final = makeClaim("final", finalValue, provenance);
  const gain = makeClaim("gain", gainValue, provenance);
  const principalClaim = makeClaim("principal", principal, provenance);

  const invariantOk = Math.abs(gain.value - (final.value - principalClaim.value)) < 1e-9;
  if (!invariantOk) {
    final.verified = false;
    gain.verified = false;
    final.reasons.push("Invariant failed: gain must equal final - principal.");
    gain.reasons.push("Invariant failed: gain must equal final - principal.");
  }

  return {
    id: `calc-${Date.now()}-${provenance.hash.slice(0, 8)}`,
    createdAt: provenance.measuredAt,
    principal: principalClaim,
    final,
    gain,
  };
}

function makeClaim(label: NumericClaim["label"], value: number, provenance: Provenance): NumericClaim {
  const reasons: string[] = [];
  if (!provenance.source) reasons.push("Missing provenance.source");
  if (!provenance.derivation) reasons.push("Missing provenance.derivation");
  if (!provenance.hash) reasons.push("Missing provenance.hash");
  if (provenance.derivation !== COMPOUND_DERIVATION) reasons.push("Unexpected derivation.");

  return {
    label,
    value,
    provenance,
    verified: reasons.length === 0,
    reasons,
  };
}

export class AppendOnlyAuditLog {
  private readonly storageKey: string;
  private readonly maxEntries: number;
  private readonly storage?: StorageLike;
  private records: VerificationRecord[];

  constructor(opts?: { storage?: StorageLike; storageKey?: string; maxEntries?: number }) {
    this.storage = opts?.storage;
    this.storageKey = opts?.storageKey ?? "financial.verification.audit.v1";
    this.maxEntries = opts?.maxEntries ?? 50;
    this.records = this.load();
  }

  append(record: VerificationRecord): void {
    this.records = [...this.records, record].slice(-this.maxEntries);
    this.persist();
  }

  all(): VerificationRecord[] {
    return [...this.records];
  }

  exportJson(): string {
    return JSON.stringify(this.records, null, 2);
  }

  private load(): VerificationRecord[] {
    if (!this.storage) return [];
    try {
      const raw = this.storage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as VerificationRecord[]) : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (!this.storage) return;
    this.storage.setItem(this.storageKey, JSON.stringify(this.records));
  }
}

export function validateClaim(record: VerificationRecord): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const expectedHash = hashInputs(record.final.provenance.inputs);

  if (expectedHash !== record.final.provenance.hash) {
    reasons.push("Hash mismatch for final claim provenance inputs.");
  }

  if (record.final.provenance.derivation !== COMPOUND_DERIVATION) {
    reasons.push("Final claim derivation mismatch.");
  }

  const expectedGain = record.final.value - record.principal.value;
  if (Math.abs(record.gain.value - expectedGain) > 1e-9) {
    reasons.push("Invariant mismatch: gain !== final - principal.");
  }

  if (!record.final.provenance.source || !record.final.provenance.measuredAt) {
    reasons.push("Incomplete provenance for final claim.");
  }

  return { ok: reasons.length === 0, reasons };
}
