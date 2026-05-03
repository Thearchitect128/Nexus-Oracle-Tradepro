import { webcrypto as crypto } from "node:crypto"

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const buf = await crypto.subtle.digest("SHA-256", data)
  return Buffer.from(new Uint8Array(buf)).toString("hex")
}

export async function signEd25519(payload: string, privateKey: CryptoKey): Promise<string> {
  const data = new TextEncoder().encode(payload)
  const sig = await crypto.subtle.sign("Ed25519", privateKey, data)
  return Buffer.from(new Uint8Array(sig)).toString("base64")
}
