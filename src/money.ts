export type CalcInput = {
  principal: number
  rate: number
  years: number
}

export type VerifiedResult = {
  principal: number
  rate: number
  years: number
  final: number
  gain: number
}

export const CalcSchema = {
  parse(input: CalcInput): CalcInput {
    if (!Number.isFinite(input.principal) || input.principal < 0) {
      throw new Error("principal must be a non-negative number")
    }

    if (!Number.isFinite(input.rate) || input.rate < -1) {
      throw new Error("rate must be a finite number >= -1")
    }

    if (!Number.isInteger(input.years) || input.years < 0) {
      throw new Error("years must be a non-negative integer")
    }

    return input
  }
}

export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

export function fromCents(cents: number): number {
  return cents / 100
}

export function compoundCents(principalCents: number, rate: number, years: number): number {
  const final = principalCents * (1 + rate) ** years
  return Math.round(final)
}

export function assertInvariant(principalCents: number, finalCents: number, gainCents: number): void {
  if (!Number.isInteger(principalCents) || !Number.isInteger(finalCents) || !Number.isInteger(gainCents)) {
    throw new Error("money values must remain integer cents")
  }

  if (finalCents - principalCents !== gainCents) {
    throw new Error("invariant failed: final - principal must equal gain")
  }
}

export function calculateVerified(input: CalcInput): VerifiedResult {
  const safe = CalcSchema.parse(input)
  const principalCents = toCents(safe.principal)
  const finalCents = compoundCents(principalCents, safe.rate, safe.years)
  const gainCents = finalCents - principalCents

  assertInvariant(principalCents, finalCents, gainCents)

  return {
    principal: safe.principal,
    rate: safe.rate,
    years: safe.years,
    final: fromCents(finalCents),
    gain: fromCents(gainCents)
  }
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value)
}
