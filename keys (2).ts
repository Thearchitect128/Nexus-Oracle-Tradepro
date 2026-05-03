import { webcrypto as crypto } from "node:crypto"

let keyPair: CryptoKeyPair | null = null

export async function getKeyPair() {
  if (keyPair) return keyPair
  keyPair = await crypto.subtle.generateKey(
    { name: "Ed25519" },
    false,                // NOT extractable
    ["sign", "verify"]
  )
  return keyPair
}

export async function exportPublicKeyB64() {
  const { publicKey } = await getKeyPair()
  const spki = await crypto.subtle.exportKey("spki", publicKey)
  return Buffer.from(new Uint8Array(spki)).toString("base64")
}
