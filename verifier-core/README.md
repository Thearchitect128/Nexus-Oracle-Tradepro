# Provenance Verifier Core

**Merged cryptographic provenance + signal integrity verification engine**

This is a fail-hard verification core for media assets. It combines:

- **C2PA-style cryptographic provenance** (who + what + history)
- **Signal integrity monitoring** (runtime determinism)
- **Deterministic state machine** (VERIFIED | TRANSFORMED | BROKEN | UNKNOWN)
- **Custom error types** for precise error handling and debugging
- **Comprehensive input validation** with edge case coverage

## Architecture

```
Media Asset
 ├── C2PA Manifest (truth)
 │   ├── Creator signature (Ed25519/ECDSA)
 │   ├── Asset hash (SHA-256)
 │   └── Transform chain (edits + signatures)
 ├── Segment Hashes (localization)
 └── Signal Layer (runtime integrity)
     └── Reference frequency (167.9 Hz) as diagnostic watermark
```

## Core Law

```
TRUTH = signature_valid ∧ hash_matches ∧ transform_chain_complete ∧ signal_stable

Anything else → not truth
```

## States

| State | Meaning | Trust Score |
|-------|---------|------------|
| `VERIFIED` | Provenance valid + signal stable | 100 |
| `TRANSFORMED` | Hash changed but edits documented + signed | 60 |
| `BROKEN` | Signature invalid or chain broken | 0 |
| `UNKNOWN` | No provenance data | 0 |

## Installation

```bash
npm install
```

## Usage

### As a Library

```typescript
import { verifyAsset, summarize } from "provenance-verifier-core";

const result = await verifyAsset(
  "video.mp4",
  {
    asset_id: "550e8400-e29b-41d4-a716-446655440000",
    hash: "a1b2c3...", // SHA-256
    created_at: "2026-04-25T10:00:00Z",
    creator: {
      id: "device-key-id",
      signature: "..." // Ed25519
    },
    transforms: [
      {
        type: "trim",
        timestamp: "2026-04-25T11:00:00Z",
        tool: "Premiere Pro 2026",
        operator: "org-key-1",
        signature: "..."
      }
    ]
  },
  {
    checkHash: true,
    checkSignature: true,
    checkSignal: false // enable for audio/video integrity
  }
);

console.log(summarize(result));
// State: VERIFIED
// Trust Score: 100/100
// Hash Match: true
// Signature Valid: true
// Transforms Valid: true
// ...
```

### CLI

```bash
# Basic verification
npx verify-asset video.mp4 manifest.json

# With signal integrity check
npx verify-asset audio.wav manifest.json --check-signal

# With verbose error details
npx verify-asset video.mp4 manifest.json --verbose

# JSON output for programmatic use  
npx verify-asset video.mp4 manifest.json --json
```

Exit codes:
- `0` = VERIFIED or TRANSFORMED (passed)
- `1` = BROKEN or UNKNOWN (failed)

## Market Feed Verifier API

The market verifier API accepts structured market feed payloads and returns a merged provenance + signal classification.

```bash
npm run dev:api
```

POST `/verify-market`

Request body:

```json
{
  "feed": {
    "timestamp": "2026-04-25T12:00:00Z",
    "provenance": {
      "sources": [
        { "name": "Yahoo Finance", "credibility": "HIGH", "signed": false },
        { "name": "CNBC", "credibility": "HIGH", "signed": false }
      ],
      "cryptographic_verification": false,
      "transform_chain": "UNKNOWN"
    },
    "signal": {
      "tech": "UP",
      "vix": "DOWN",
      "oil": "DOWN",
      "gold": "UP",
      "europe": "WEAK",
      "asia": "NEUTRAL",
      "yields": "DOWN",
      "germany": "DOWN"
    }
  }
}
```

Response example:

```json
{
  "state": "TRANSFORMED_STABLE",
  "regime": "DIVERGENT_MARKETS",
  "risk_mode": "CAUTIOUS_RISK_ON",
  "confidence": 0.78,
  "drift": false,
  "primary_drivers": ["oil", "yields", "geopolitics"],
  "provenance": {
    "state": "TRANSFORMED",
    "credibility": 0.9,
    "verified": false,
    "transform_chain": "UNKNOWN"
  },
  "signal": {
    "stable": true,
    "coherence": 0.875,
    "details": {
      "tech": "UP",
      "vix": "DOWN",
      "oil": "DOWN",
      "gold": "UP",
      "europe": "WEAK",
      "asia": "NEUTRAL",
      "yields": "DOWN",
      "germany": "DOWN"
    }
  }
}
```

## Manifest Schema

```json
{
  "asset_id": "550e8400-e29b-41d4-a716-446655440000",
  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "created_at": "2026-04-25T10:00:00Z",
  "creator": {
    "id": "device-or-org-key-id",
    "signature": "ed25519_hex_signature"
  },
  "transforms": [
    {
      "type": "crop|trim|color|overlay|encode|resample|other",
      "timestamp": "2026-04-25T11:00:00Z",
      "tool": "Adobe Premiere 2026.1",
      "operator": "org-key-1",
      "signature": "ed25519_hex_signature"
    }
  ],
  "metadata": {
    "format": "video/mp4",
    "duration_ms": 60000,
    "sample_rate": 48000
  }
}
```

## Verification Workflow

### 1. Capture (Root of Truth)

Device signs asset:

```typescript
import { signData, sha256File } from "provenance-verifier-core";

const devicePrivateKeyPem = "...";
const assetHash = await sha256File("video.mp4");

const payload = JSON.stringify({
  asset_id: "550e8400-e29b-41d4-a716-446655440000",
  hash: assetHash,
  created_at: new Date().toISOString(),
  transforms: []
});

const signature = signData(payload, devicePrivateKeyPem);

// Store manifest with signature
```

### 2. Ingest (First Lock)

Compute hash, store manifest immutable.

### 3. Edit (Controlled Mutation)

Edits must append, not overwrite:

```json
{
  "type": "trim",
  "timestamp": "2026-04-25T11:00:00Z",
  "tool": "Premiere 2026.1",
  "operator": "org-key",
  "signature": "..."
}
```

### 4. Publish (Binding Layer)

Attach manifest to asset, distribute together.

### 5. Verify (Client-side Truth)

```typescript
const result = await verifyAsset(filePath, manifest);
if (result.state !== "VERIFIED") {
  throw new Error("Verification failed");
}
```

## What This Catches

1. **Fake news videos** → AI-generated or edited clips flagged as UNKNOWN or BROKEN
2. **Selective edits** → Clip is real but trimmed → shows TRANSFORMED with exact edits
3. **Platform manipulation** → Metadata stripped by upload → becomes BROKEN
4. **Source impersonation** → Someone claims "this came from Reuters" → signature check fails

## Testing

```bash
npm run test              # Run all tests (24 passing)
npm run test:watch       # Watch mode
npm run build            # TypeScript → JavaScript
npm run lint             # Type check
```

Test coverage includes:
- Hash computation and validation
- Signal detection and stability
- State classification logic
- Trust scoring
- Error handling and edge cases
- Manifest validation

## Verification Result

## API Reference

### `verifyAsset(filePath, manifest, options?)`

Verify an asset against its manifest.

**Parameters:**

- `filePath` (string): Path to the media asset
- `manifest` (object): C2PA-style manifest with provenance
- `options` (object):
  - `checkHash` (boolean, default: true)
  - `checkSignature` (boolean, default: true)
  - `checkTransforms` (boolean, default: true)
  - `checkSignal` (boolean, default: false)
  - `referenceFrequency` (number, default: 167.9)
  - `frequencyTolerance` (number, default: 0.5)

**Returns:** `VerificationResult`

```typescript
{
  state: "VERIFIED" | "TRANSFORMED" | "BROKEN" | "UNKNOWN",
  asset_id: string,
  timestamp: string,
  hash: { expected, computed, match },
  signature: { valid, algorithm },
  transforms: { valid, count },
  signal: { detected, stable, frequency, frequency_error_hz },
  metadata: { trust_score, explanation, ... }
}
```

### `classify(input)`

Deterministic state classification.

**Parameters:**

```typescript
{
  hasManifest: boolean,
  hashMatch: boolean,
  signatureValid: boolean,
  transformsValid: boolean,
  signalStable?: boolean
}
```

**Returns:** `VerificationState`

### Signal Integrity

**Placeholder functions** (production requires FFT library):

- `detectDominantFrequency(samples, sampleRate)` → dominant frequency
- `isSignalStable(detected, reference, tolerance)` → stable boolean
- `verifySegmentSignals(filePath, segments)` → segment results

## Integration with Lattice / OMEGA

Emit verification results to WebSocket:

```typescript
const result = await verifyAsset(filePath, manifest);

emit("verify.result", {
  event: "verify.result",
  state: result.state,
  drift: !result.hash.match,
  trust_score: result.metadata.trust_score
});
```

## License

MIT
