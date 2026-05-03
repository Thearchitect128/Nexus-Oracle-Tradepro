import React, { useCallback, useState } from "react"
import { formatUSD } from "./money"
import { calculateBound, exportProof, type BoundProof } from "./proof"
import { verifyStandaloneProof, type StandaloneVerificationResult } from "./standaloneVerifier"

export default function VerificationPanel() {
  const [principal, setPrincipal] = useState(167.89)
  const [rate, setRate] = useState(0.05)
  const [years, setYears] = useState(10)
  const [proof, setProof] = useState<BoundProof | null>(null)
  const [verification, setVerification] = useState<StandaloneVerificationResult | null>(null)
  const [externalProofText, setExternalProofText] = useState("")
  const [externalVerification, setExternalVerification] = useState<StandaloneVerificationResult | null>(null)
  const [externalError, setExternalError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCalculateAndBind = useCallback(async () => {
    setLoading(true)
    try {
      const nextProof = await calculateBound({ principal, rate, years })
      setProof(nextProof)
      setVerification(await verifyStandaloneProof(nextProof))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [principal, rate, years])

  const handleTamperTest = useCallback(async () => {
    if (!proof) return

    const tampered: BoundProof = {
      ...proof,
      data: {
        ...proof.data,
        final: proof.data.final + 1
      }
    }

    setProof(tampered)
    setVerification(await verifyStandaloneProof(tampered))
  }, [proof])

  const handleVerifyExternal = useCallback(async () => {
    try {
      const parsed = JSON.parse(externalProofText) as BoundProof
      const result = await verifyStandaloneProof(parsed)
      setExternalVerification(result)
      setExternalError(null)
    } catch (err) {
      setExternalVerification(null)
      setExternalError(err instanceof Error ? err.message : "Could not parse or verify proof JSON")
    }
  }, [externalProofText])

  return (
    <div
      style={{
        maxWidth: 620,
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
        SABR-HOLD Bound Proof
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
          Principal ($)
          <input
            type="number"
            step="0.01"
            value={principal}
            onChange={e => setPrincipal(parseFloat(e.target.value))}
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9", fontSize: 14 }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
          Rate (decimal)
          <input
            type="number"
            step="0.01"
            value={rate}
            onChange={e => setRate(parseFloat(e.target.value))}
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9", fontSize: 14 }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
          Years
          <input
            type="number"
            value={years}
            onChange={e => setYears(parseInt(e.target.value, 10))}
            style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #334155", background: "#1e293b", color: "#f1f5f9", fontSize: 14 }}
          />
        </label>
      </div>

      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr", marginBottom: 16 }}>
        <button
          onClick={handleCalculateAndBind}
          disabled={loading}
          style={{
            padding: "12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {loading ? "Calculating..." : "Calculate & Bind"}
        </button>
        <button
          onClick={() => proof && exportProof(proof)}
          disabled={!proof}
          style={{
            padding: "12px",
            background: "#0ea5e9",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Export Proof
        </button>
      </div>

      {proof && (
        <div style={{ background: "#1e293b", padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #334155" }}>
            <span>Principal:</span>
            <strong>{formatUSD(proof.data.principal)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #334155" }}>
            <span>Final Amount:</span>
            <strong style={{ color: "#34d399", fontSize: 16 }}>{formatUSD(proof.data.final)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #334155" }}>
            <span>Gain:</span>
            <strong>{formatUSD(proof.data.gain)}</strong>
          </div>

          {verification && (
            <>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  color: "white",
                  fontWeight: 600,
                  fontSize: 13,
                  marginTop: 12,
                  background: verification.trustworthy ? "#10b981" : "#ef4444"
                }}
              >
                {verification.trustworthy ? "Integrity: VALID • Binding: CORRECT" : "Integrity: INVALID • Tamper detected"}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: "#93c5fd", wordBreak: "break-all" }}>
                canonical={verification.canonical}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#93c5fd" }}>
                recomputedHash={verification.recomputedHash}
              </div>
            </>
          )}

          <div style={{ marginTop: 12 }}>
            <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 4 }}>Signed Hash</label>
            <code style={{ display: "block", fontSize: 11, fontFamily: "monospace", color: "#94a3b8", wordBreak: "break-all", background: "#0f172a", padding: 8, borderRadius: 4 }}>
              {proof.verification.hash}
            </code>
          </div>

          <button
            onClick={handleTamperTest}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: 12,
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

      <div style={{ background: "#111827", padding: 16, borderRadius: 8 }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>Standalone Verification Target</h3>
        <p style={{ margin: "0 0 10px 0", fontSize: 12, color: "#9ca3af" }}>
          Paste an exported proof JSON to run canonical reconstruction, hash recompute, and signature verification independently.
        </p>
        <textarea
          value={externalProofText}
          onChange={e => setExternalProofText(e.target.value)}
          placeholder='{"timestamp":"...","data":{...},"verification":{...}}'
          style={{ width: "100%", minHeight: 120, background: "#0f172a", color: "#e5e7eb", border: "1px solid #374151", borderRadius: 6, padding: 8, fontFamily: "monospace", fontSize: 12 }}
        />
        <button
          onClick={handleVerifyExternal}
          style={{ marginTop: 8, padding: "8px 12px", background: "#1d4ed8", color: "white", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}
        >
          Verify Pasted Proof
        </button>

        {externalError && <div style={{ marginTop: 8, color: "#fca5a5", fontSize: 12 }}>{externalError}</div>}

        {externalVerification && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#cbd5e1" }}>
            hashValid={String(externalVerification.hashValid)} • signatureValid={String(externalVerification.signatureValid)} • trustworthy={String(externalVerification.trustworthy)}
          </div>
        )}
      </div>
    </div>
  )
}
