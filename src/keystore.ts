import { exportPublicKey, generateSigningKeyPair, importPublicKey, type KeyPair } from "./signing"

const STORAGE_KEY = "vf_ed25519_keypair"

interface StoredKeyPair {
  publicKey: string // base64 SPKI
  privateKey: string // base64 PKCS8
}

async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("pkcs8", key)
  const bytes = new Uint8Array(exported)
  return btoa(String.fromCharCode(...bytes))
}

async function importPrivateKey(base64: string): Promise<CryptoKey> {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return await crypto.subtle.importKey("pkcs8", bytes, { name: "Ed25519" }, true, ["sign"])
}

export async function loadOrCreateKeyPair(): Promise<KeyPair> {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored) {
    try {
      const parsed: StoredKeyPair = JSON.parse(stored)
      const [publicKey, privateKey] = await Promise.all([
        importPublicKey(parsed.publicKey),
        importPrivateKey(parsed.privateKey)
      ])

      return { publicKey, privateKey }
    } catch {
      // corrupted storage, fall through to generate new
    }
  }

  const keyPair = await generateSigningKeyPair()
  const [publicKeyB64, privateKeyB64] = await Promise.all([
    exportPublicKey(keyPair.publicKey),
    exportPrivateKey(keyPair.privateKey)
  ])

  const toStore: StoredKeyPair = {
    publicKey: publicKeyB64,
    privateKey: privateKeyB64
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  return keyPair
}
