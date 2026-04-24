import React, { useCallback, useEffect, useState } from "react"
import { calculateVerified, formatUSD, type VerifiedResult } from "./money"
import { calculateSigned, verifyIntegrity, generateSigningKeyPair, type SignedResult, type KeyPair } from "./signing"
import { loadOrCreateKeyPair } from "./keystore"

export default function VerificationPanel() {
  const [principal, setPrincipal] = useState(167.89)
  const [rate, setRate] = useState(0.05)
  const [years, setYears] = useState(10)
  const [result, setResult] = useState<SignedResult | null>(null)
  const [verification, setVerification] = useState<{
    hashValid: boolean
    signatureValid: boolean
    trustworthy: boolean
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null)

  useEffect(() => {
    loadOrCreateKeyPair().then(setKeyPair)
  }, [])

  const handleCalculate = useCallback(async () => {
    if (!keyPair) return

    setLoading(true)

    try {
      const signed = await calculateSigned({ principal, rate, years }, keyPair)
      setResult(signed)
      const verified = await verifyIntegrity(signed)
      setVerification(verified)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [principal, rate, years, keyPair])

  const handleTamperTest = useCallback(() => {
    if (!result) return

    const tampered = { ...result, final: result.final + 1 }
    setResult(tampered as SignedResult)
    verifyIntegrity(tampered as SignedResult).then(setVerification)
  }, [result])

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "40px auto",
        padding: 24,
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#0f172a",
        color: "#e2e8f0",
        borderRadius: 12,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
      }}
    >
      <h2 style={{ margin: "0 0 20px 0", fontSize: 20, fontWeight: 600, color: "#f8fafc" }}>
        Verified Compound Interest
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 13,
            color: "#94a3b8",
            fontWeight: 500
          }}
        >
          Principal ($)
          <input
            type="number"
            step="0.01"
            value={principal}
            onChange={e => setPrincipal(parseFloat(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #334155",
              background: "#1e293b",
              color: "#f1f5f9",
              fontSize: 14
            }}
          />
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 13,
            color: "#94a3b8",
            fontWeight: 500
          }}
        >
          Rate (decimal)
          <input
            type="number"
            step="0.01"
            value={rate}
            onChange={e => setRate(parseFloat(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #334155",
              background: "#1e293b",
              color: "#f1f5f9",
              fontSize: 14
            }}
          />
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 13,
            color: "#94a3b8",
            fontWeight: 500
          }}
        >
          Years
          <input
            type="number"
            value={years}
            onChange={e => setYears(parseInt(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #334155",
              background: "#1e293b",
              color: "#f1f5f9",
              fontSize: 14
            }}
          />
        </label>
      </div>

      <button
        onClick={handleCalculate}
        disabled={loading || !keyPair}
        style={{
          width: "100%",
          padding: "12px",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: 6,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 16
        }}
      >
        {loading ? "Calculating..." : "Calculate & Sign"}
      </button>

      {result && (
        <div style={{ background: "#1e293b", padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid #334155"
            }}
          >
            <span>Principal:</span>
            <strong>{formatUSD(result.principal)}</strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid #334155"
            }}
          >
            <span>Final Amount:</span>
            <strong style={{ color: "#34d399", fontSize: 16 }}>{formatUSD(result.final)}</strong>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid #334155"
            }}
          >
            <span>Gain:</span>
            <strong>{formatUSD(result.gain)}</strong>
          </div>

          <div style={{ height: 1, background: "#334155", margin: "12px 0" }} />

          {verification && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 6,
                color: "white",
                fontWeight: 600,
                fontSize: 13,
                marginBottom: 12,
                background: verification.trustworthy ? "#10b981" : "#ef4444"
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "50%",
                  fontSize: 12
                }}
              >
                {verification.trustworthy ? "✓" : "✗"}
              </span>
              <span>
                {verification.trustworthy
                  ? "Authentic — Hash & Signature Verified"
                  : "Tampered — Verification Failed"}
              </span>
            </div>
          )}

          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                color: "#64748b",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: 0.5
              }}
            >
              SHA-256 Hash:
            </label>
            <code
              style={{
                display: "block",
                fontSize: 11,
                fontFamily: "monospace",
                color: "#94a3b8",
                wordBreak: "break-all",
                background: "#0f172a",
                padding: 8,
                borderRadius: 4,
                marginBottom: 4
              }}
            >
              {result.hash}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(result.hash)}
              style={{
                padding: "4px 10px",
                fontSize: 11,
                background: "#334155",
                color: "#e2e8f0",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Copy
            </button>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                color: "#64748b",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: 0.5
              }}
            >
              Public Key Fingerprint:
            </label>
            <code
              style={{
                display: "block",
                fontSize: 11,
                fontFamily: "monospace",
                color: "#94a3b8",
                wordBreak: "break-all",
                background: "#0f172a",
                padding: 8,
                borderRadius: 4
              }}
            >
              {result.publicKey.slice(0, 32)}...
            </code>
          </div>

          <button
            onClick={handleTamperTest}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: 8,
              background: "#7f1d1d",
              color: "#fca5a5",
              border: "1px solid #991b1b",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12
            }}
          >
            Simulate Tampering
          </button>
        </div>
      )}

      <div style={{ background: "#1e293b", padding: 16, borderRadius: 8, fontSize: 13 }}>
        <h4 style={{ margin: "0 0 8px 0" }}>Guarantees Locked by Tests:</h4>
        <ul style={{ margin: "8px 0 0 0", paddingLeft: 18, color: "#94a3b8", lineHeight: 1.8 }}>
          <li>✓ No float drift (integer cents math)</li>
          <li>✓ Deterministic output for same inputs</li>
          <li>✓ Hash covers all calculation fields</li>
          <li>✓ Ed25519 signature on hash</li>
          <li>✓ Result is immutable (frozen)</li>
          <li>✓ Schema validation rejects bad input</li>
          <li>✓ Persistent identity across sessions</li>
        </ul>
      </div>
    </div>
  )
}
