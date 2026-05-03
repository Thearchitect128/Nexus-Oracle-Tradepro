import { canonicalize, type CanonicalPayload } from "./canonical"
import { assertInvariant, compoundCents, toCents, type CalcInput } from "./money"

export type BoundProof = {
  timestamp: string
  system: {
    state: "HOLD"
    context: {
      output: 1
      drift: 0
    }
  }
  data: CanonicalPayload
  verification: {
    hash: string
    signature: string
    publicKey: string
  }
}

type SignProofResponse = {
  hash: string
  signature: string
  publicKey: string
}

async function requestServerSignature(payload: CanonicalPayload): Promise<SignProofResponse> {
  const response = await fetch("/api/sign-proof", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`sign-proof request failed: ${response.status}`)
  }

  return (await response.json()) as SignProofResponse
}

export async function calculateBound(input: CalcInput): Promise<BoundProof> {
  const principalCents = toCents(input.principal)
  const finalCents = compoundCents(principalCents, input.rate, input.years)
  const gainCents = finalCents - principalCents

  assertInvariant(principalCents, finalCents, gainCents)

  const payload: CanonicalPayload = {
    principal: input.principal,
    rate: input.rate,
    years: input.years,
    final: finalCents / 100,
    gain: gainCents / 100
  }

  const canonical = canonicalize(payload)
  if (!canonical.length) {
    throw new Error("canonicalization failed")
  }

  const verification = await requestServerSignature(payload)

  return Object.freeze({
    timestamp: new Date().toISOString(),
    system: {
      state: "HOLD",
      context: {
        output: 1,
        drift: 0
      }
    },
    data: payload,
    verification
  })
}

export function exportProof(proof: BoundProof): void {
  const blob = new Blob([JSON.stringify(proof, null, 2)], {
    type: "application/json"
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "sabr-hold-proof.json"
  a.click()
  URL.revokeObjectURL(url)
}
