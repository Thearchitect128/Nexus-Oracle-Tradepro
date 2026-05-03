const STORAGE_KEY = "vf_server_public_key"

export function saveTrustedServerPublicKey(publicKey: string): void {
  localStorage.setItem(STORAGE_KEY, publicKey)
}

export function loadTrustedServerPublicKey(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}
