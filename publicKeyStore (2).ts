const STORAGE_KEY = "vf_server_public_key"

interface StoredPublicKey {
  publicKey: string
  fetchedAt: string
}

function toBase64(bytes: Uint8Array): string {
  let binary = ""
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function loadOrFetchPublicKey(): Promise<string> {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed: StoredPublicKey = JSON.parse(stored)
      return parsed.publicKey
    } catch (err) {
      console.warn("Failed to load cached public key, fetching fresh:", err)
      // fall through to fetch
    }
  }

  // Fetch from server (authoritative)
  const res = await fetch("http://localhost:3001/public-key")
  if (!res.ok) {
    throw new Error("Failed to fetch server public key")
  }

  const { publicKey } = await res.json()

  // Cache it
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      publicKey,
      fetchedAt: new Date().toISOString()
    } as StoredPublicKey)
  )

  return publicKey
}

export async function computeKeyFingerprint(publicKeyB64: string): Promise<string> {
  const bytes = fromBase64(publicKeyB64)
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes)
  const hashArray = new Uint8Array(hashBuffer)
  const hex = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
  // Return first 64 bits (16 hex chars) for display
  return hex.slice(0, 16)
}

export function clearPublicKeyCache(): void {
  localStorage.removeItem(STORAGE_KEY)
}
