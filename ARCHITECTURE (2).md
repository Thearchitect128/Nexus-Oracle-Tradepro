TRUST BOUNDARY MOVED TO SERVER
==============================

⸻

BEFORE (Client-Only)

client computes → client signs → client verifies

Result: Internal consistency only
Guarantees: Determinism, tamper detection
Cannot prove: Origin, external authenticity

⸻

AFTER (Server-Authoritative)

client sends input → server computes → server signs → client verifies

Result: Server-backed computation
Guarantees: Determinism, tamper detection, origin
Proof: Server-held private key signature

⸻

ARCHITECTURE

server/
  keys.ts           # Holds Ed25519 private key (non-extractable)
  canonical.ts      # Deterministic payload serialization
  math.ts           # Integer-based compound interest
  crypto.ts         # SHA-256 hash, Ed25519 sign
  index.ts          # Express server: /health, /public-key, /sign

client/
  api.ts            # HTTP client (requestSigned, getServerPublicKey)
  signing-verification.ts  # Verify server signatures + hashes
  VerificationPanel.tsx    # React UI using server endpoint

⸻

FLOW

1. Client renders inputs (principal, rate, years)
2. User clicks "Calculate & Request Signature"
3. Client POST /sign with inputs
4. Server:
   - Validates ranges
   - Recomputes in cents (no float)
   - Canonicalizes payload
   - Hashes canonical form
   - Signs canonical form with Ed25519
   - Exports public key
5. Client receives {data, hash, signature, publicKey}
6. Client verifies:
   - Re-derives hash from data
   - Re-derives public key from signature
   - Confirms hash == server hash
   - Confirms signature valid
7. UI shows green ✓ if both checks pass

⸻

KEY SECURITY PROPERTIES

✓ Private key never leaves server (non-extractable)
✓ Client cannot forge signatures (has only public key)
✓ Signature proves server computation
✓ Hash covers all data fields
✓ Canonical serialization prevents environment drift
✓ Server validates input ranges
✓ Integer math prevents float drift
✓ Deep tamper detection works

✗ Server could be compromised (out of scope)
✗ Network MITM (use HTTPS in production)
✗ Client tampering detected but not prevented

⸻

DEPLOYMENT CHECKLIST

Server:
  [ ] Use HTTPS in production
  [ ] Rate limit /sign endpoint
  [ ] Add request logging
  [ ] Validate input ranges (done)
  [ ] Use environment variables for secrets
  [ ] Add health check monitoring
  [ ] Pin public key on client (optional)

Client:
  [ ] Pin server public key at build time
  [ ] Add HTTPS certificate pinning
  [ ] Handle server timeout gracefully
  [ ] Show server status clearly (done)

⸻

NEXT STEPS

"export"   → downloadable signed JSON proof
"verifier" → standalone app to validate proofs
