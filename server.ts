import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { canonicalize, type CanonicalPayload } from "./src/canonical"

type ServerCrypto = {
  privateKey: CryptoKey
  publicKeyBase64: string
}

let serverCrypto: ServerCrypto | null = null

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64")
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

async function sha256(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input))
  return toHex(new Uint8Array(digest))
}

async function initServerCrypto(): Promise<ServerCrypto> {
  if (serverCrypto) {
    return serverCrypto
  }

  const pair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  )

  const publicKeyDer = await crypto.subtle.exportKey("spki", pair.publicKey)

  serverCrypto = {
    privateKey: pair.privateKey,
    publicKeyBase64: bytesToBase64(new Uint8Array(publicKeyDer))
  }

  return serverCrypto
}

async function signCanonicalPayload(payload: CanonicalPayload): Promise<{
  hash: string
  signature: string
  publicKey: string
}> {
  const cryptoCtx = await initServerCrypto()
  const canonical = canonicalize(payload)
  const hash = await sha256(canonical)
  const signatureBuffer = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoCtx.privateKey,
    new TextEncoder().encode(canonical)
  )

  return {
    hash,
    signature: bytesToBase64(new Uint8Array(signatureBuffer)),
    publicKey: cryptoCtx.publicKeyBase64
  }
}

function parseCanonicalPayload(input: unknown): CanonicalPayload {
  if (!input || typeof input !== "object") {
    throw new Error("payload must be an object")
  }

  const value = input as Record<string, unknown>
  const payload: CanonicalPayload = {
    principal: Number(value.principal),
    rate: Number(value.rate),
    years: Number(value.years),
    final: Number(value.final),
    gain: Number(value.gain)
  }

  if (Object.values(payload).some(v => !Number.isFinite(v))) {
    throw new Error("payload fields must be finite numbers")
  }

  return payload
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  let body = ""
  for await (const chunk of req) {
    body += chunk
  }
  return JSON.parse(body)
}

async function handleSignProof(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await readJson(req)
    const payload = parseCanonicalPayload(body)
    const signed = await signCanonicalPayload(payload)

    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(signed))
  } catch (error) {
    res.statusCode = 400
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : "invalid request" }))
  }
}

export async function startServer(port = 3001): Promise<void> {
  await initServerCrypto()

  const server = createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/api/sign-proof") {
      await handleSignProof(req, res)
      return
    }

    res.statusCode = 404
    res.end("Not Found")
  })

  server.listen(port)
}
