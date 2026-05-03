import express from "express"
import { getKeyPair, exportPublicKeyB64 } from "./keys"
import { canonicalize } from "./canonical"
import { toCents, compoundCents } from "./math"
import { sha256Hex, signEd25519 } from "./crypto"

const app = express()
app.use(express.json())

// Health check
app.get("/health", (_, res) => res.json({ ok: true }))

// Public key endpoint (unauthenticated, but pinned by client)
app.get("/public-key", async (_, res) => {
  try {
    const publicKey = await exportPublicKeyB64()
    res.json({ publicKey })
  } catch (e) {
    res.status(500).json({ error: "failed to export public key" })
  }
})

// SIGN endpoint (authoritative server computation + signing)
app.post("/sign", async (req, res) => {
  try {
    const { principal, rate, years } = req.body

    // Validate input types and ranges
    if (
      typeof principal !== "number" ||
      typeof rate !== "number" ||
      typeof years !== "number"
    ) {
      return res.status(400).json({ error: "invalid input types" })
    }

    // Validate ranges (prevent absurd inputs)
    if (principal < 0 || principal > 1e12) {
      return res.status(400).json({ error: "principal out of range" })
    }
    if (rate < -0.99 || rate > 10) {
      return res.status(400).json({ error: "rate out of range" })
    }
    if (years < 0 || years > 1000) {
      return res.status(400).json({ error: "years out of range" })
    }

    // Recompute on server (never trust client)
    const p = toCents(principal)
    const f = compoundCents(p, rate, years)
    const g = f - p

    const payload = {
      principal,
      rate,
      years,
      final: f / 100,
      gain: g / 100
    }

    // Canonical serialization
    const canonical = canonicalize(payload)

    // Hash canonical form
    const hash = await sha256Hex(canonical)

    // Sign canonical form (not the hash—sign the data)
    const { privateKey } = await getKeyPair()
    const signature = await signEd25519(canonical, privateKey)

    // Export public key
    const publicKey = await exportPublicKeyB64()

    res.json({
      timestamp: new Date().toISOString(),
      data: payload,
      verification: {
        hash,
        signature,
        publicKey
      }
    })
  } catch (e) {
    console.error("Sign error:", e)
    res.status(500).json({ error: "server error" })
  }
})

app.listen(3001, () => {
  console.log("Signing server running on :3001")
})
