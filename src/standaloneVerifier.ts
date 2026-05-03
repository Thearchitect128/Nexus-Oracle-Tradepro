import type { BoundProof } from "./proof"

export type StandaloneVerificationResult = {
  canonical: string
  recomputedHash: string
  hashValid: boolean
  signatureValid: boolean
  trustworthy: boolean
}

function base64ToBytes(base64: string): Uint8Array {
  const bin = atob(base64)
  const out = new Uint8Array(bin.length)

  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i)
  }

  return out
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

export function reconstructCanonicalPayload(proof: BoundProof): string {
  return JSON.stringify({
    principal: proof.data.principal,
    rate: proof.data.rate,
    years: proof.data.years,
    final: proof.data.final,
    gain: proof.data.gain
  })
}

export async function verifyStandaloneProof(proof: BoundProof): Promise<StandaloneVerificationResult> {
  const canonical = reconstructCanonicalPayload(proof)
  const data = new TextEncoder().encode(canonical)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const recomputedHash = toHex(new Uint8Array(hashBuffer))
  const hashValid = recomputedHash === proof.verification.hash

  const publicKey = await crypto.subtle.importKey(
    "spki",
    base64ToBytes(proof.verification.publicKey),
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["verify"]
  )

  const signatureValid = await crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    publicKey,
    base64ToBytes(proof.verification.signature),
    data
  )

  return {
    canonical,
    recomputedHash,
    hashValid,
    signatureValid,
    trustworthy: hashValid && signatureValid
  }
}
