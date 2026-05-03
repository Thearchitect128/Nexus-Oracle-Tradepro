import { canonicalize } from "./canonical"
import { sha256 } from "./crypto"
import type { BoundProof } from "./proof"

function base64ToBytes(base64: string): Uint8Array {
  const bin = atob(base64)
  const out = new Uint8Array(bin.length)

  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i)
  }

  return out
}

export async function importPublicKey(base64: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey("spki", base64ToBytes(base64), { name: "ECDSA", namedCurve: "P-256" }, true, ["verify"])
}

export async function verifySignature(canonical: string, signature: string, publicKeyBase64: string): Promise<boolean> {
  const publicKey = await importPublicKey(publicKeyBase64)
  const encoded = new TextEncoder().encode(canonical)
  return await crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    publicKey,
    base64ToBytes(signature),
    encoded
  )
}

export async function verifyProof(proof: BoundProof): Promise<{
  hashValid: boolean
  signatureValid: boolean
  trustworthy: boolean
}> {
  const canonical = canonicalize(proof.data)
  const hashValid = (await sha256(canonical)) === proof.verification.hash
  const signatureValid = await verifySignature(canonical, proof.verification.signature, proof.verification.publicKey)

  return {
    hashValid,
    signatureValid,
    trustworthy: hashValid && signatureValid
  }
}
