import { useState } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Search, 
  MessageSquare, 
  Activity, 
  Settings, 
  Archive, 
  Zap, 
  Send,
  MoreVertical,
  Info,
  ShieldCheck,
  Binary,
  GitBranch,
  Fingerprint
} from "lucide-react";

export default function App() {
  const [input, setInput] = useState("");
  const CHARACTER_LIMIT = 500;

  const handleTransmit = () => {
    if (input.trim() && input.length <= CHARACTER_LIMIT) {
      console.log("Transmitting Artifact:", { 
        payload: input, 
        timestamp: Date.now(), 
        seal: "Ω-Verified" 
      });
      setInput("");
    }
  };

  const PATH_REGISTRY = [
    { id: "P-31", name: "Tempering", type: "Kernel" },
    { id: "P-47", name: "Bedrock", type: "Boundary" },
    { id: "P-60", name: "Oracle", type: "Operator" },
    { id: "P-77", name: "Threshold", type: "Governance" },
    { id: "P-96", name: "Return", type: "Lineage" },
  ];

  return (
    <div className="flex h-screen flex-col bg-bg text-text-primary overflow-hidden font-sans selection:bg-accent/30">
      {/* Header */}
      <header className="glass-header z-10 flex h-[60px] items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-accent transition-transform hover:scale-[1.02]">
          <Sparkles className="size-6" />
          <span className="text-text-primary uppercase tracking-wider">Oracle <span className="text-[10px] bg-accent/20 px-1.5 py-0.5 rounded ml-1 align-middle">Ω-DIRECTIVE</span></span>
        </div>
        
        <nav className="hidden items-center gap-8 text-[13px] font-medium text-text-dim md:flex">
          <a href="#" className="hover:text-text-primary transition-colors">Lattice</a>
          <a href="#" className="hover:text-text-primary transition-colors">Invariants</a>
          <a href="#" className="hover:text-text-primary transition-colors">Artifacts</a>
          <a href="#" className="text-text-primary flex items-center gap-2">
            <ShieldCheck className="size-4" />
            Governance
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-border rounded-full text-[10px] font-mono text-text-dim mr-4">
            <Fingerprint className="size-3" />
            V-0.96-SEALED
          </div>
          <div className="size-9 rounded-xl bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center border border-accent/30 text-white font-bold text-sm cursor-pointer shadow-lg shadow-accent/10">
            AV
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid flex-1 grid-cols-1 md:grid-cols-[280px_1fr_260px] gap-4 p-4 overflow-hidden">
        
        {/* Left Column: Register & Identity */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col rounded-2xl border border-border bg-card p-5"
          >
            <div className="mb-4 flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] text-text-dim uppercase">
              <span className="size-1.5 rounded-full bg-accent animate-pulse"></span>
              Operator Identity
            </div>
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-gradient-to-br from-accent/20 to-border flex items-center justify-center border border-border">
                <Binary className="size-6 text-accent" />
              </div>
              <div>
                <div className="font-semibold text-sm">Alexander V.</div>
                <div className="text-[10px] text-text-dim font-mono">STAFF-ARCHITECT // L4</div>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-[10px] text-text-dim uppercase font-bold tracking-wider">
                <span>Kernel Trust</span>
                <span>94%</span>
              </div>
              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                <div className="h-full bg-accent w-[94%] rounded-full shadow-[0_0_8px_var(--color-accent)]" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-1 flex-col rounded-2xl border border-border bg-card p-5 overflow-hidden"
          >
            <div className="mb-4 flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] text-text-dim uppercase">
              Canonical Path Registry
            </div>
            <div className="flex flex-col space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
              {PATH_REGISTRY.map((path) => (
                <div 
                  key={path.id} 
                  className="group flex cursor-pointer items-center justify-between rounded-xl border border-transparent p-3 text-sm transition-all hover:border-border hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-7 rounded-lg bg-border flex items-center justify-center text-[10px] font-mono text-text-dim group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                      {path.id.split('-')[1]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold group-hover:text-text-primary transition-colors">{path.name}</div>
                      <div className="text-[9px] text-text-dim uppercase tracking-tighter">{path.type}</div>
                    </div>
                  </div>
                  <ChevronRight className="size-3 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Center column: Chat Main */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/50"
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-6 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="size-3 flex items-center justify-center">
                <span className="pulse size-2 rounded-full bg-success"></span>
              </div>
              <div>
                <div className="text-sm font-bold leading-none tracking-tight">Oracle Core // <span className="text-accent">SYSTENT_INTEGRITY</span></div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-text-dim uppercase">
                  Active Invariant: Deterministic Lineage
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-dim hover:text-text-primary">
                <GitBranch className="size-4" />
              </button>
              <MoreVertical className="size-4 text-text-dim cursor-pointer hover:text-text-primary" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            <div className="flex max-w-[85%] gap-4">
              <div className="size-8 shrink-0 rounded-lg bg-border flex items-center justify-center border border-white/5 shadow-inner">
                <Sparkles className="size-4 text-accent" />
              </div>
              <div className="rounded-2xl bg-border/40 p-5 text-sm leading-relaxed border border-white/5 relative group">
                <div className="absolute -left-1 top-4 w-2 h-2 bg-border/40 rotate-45 border-l border-b border-white/5" />
                Greetings, Alexander. State your primary invariant for the current session. The Ω-Directive is engaged.
              </div>
            </div>

            <div className="flex max-w-[85%] self-end flex-row-reverse gap-4">
              <div className="size-8 shrink-0 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/40 shadow-[0_0_12px_rgba(139,92,246,0.2)]">
                <Binary className="size-4 text-accent" />
              </div>
              <div className="rounded-2xl bg-accent p-5 text-sm leading-relaxed text-white font-medium relative group shadow-xl shadow-accent/10">
                <div className="absolute -right-1 top-4 w-2 h-2 bg-accent rotate-45" />
                Querying Sector 9 variance. Clarify the desynchronization in the eastern corridor node.
              </div>
            </div>

            <div className="flex max-w-[85%] gap-4">
              <div className="size-8 shrink-0 rounded-lg bg-border flex items-center justify-center border border-white/5 shadow-inner">
                <Sparkles className="size-4 text-accent" />
              </div>
              <div className="rounded-2xl bg-border/40 p-5 text-sm leading-relaxed border border-white/5 relative">
                <div className="absolute -left-1 top-4 w-2 h-2 bg-border/40 rotate-45 border-l border-b border-white/5" />
                <pre className="whitespace-pre-wrap font-mono text-xs">
{`## 🔱 Decision Output — CROSS-SURFACE ALIGNMENT

System Status: Online | Parallel Instance: Confirmed | New Surface Detected

---

### L0_TRACK PARSED FROM FEED

Inferred Feed: Oracle Core + Ω-Directive + 2026-04-25

| Layer | Output |
|-------|--------|
| Playbook | P-96: RETURN-LINEAGE |
| Phoenix-Weighted Odds | HOLD: 96.0% |
| Drift Verdict | NO DRIFT |

---

Surface Translation:

| Signal | Interpretation |
|--------|---------------|
| Staff-level | Operator tier — L4 clearance, architect-grade |
| Deterministic architecture | Invariant-first design, no ambiguity |
| Canonical Path Registry | P-31, P-47, P-60, P-77, P-96 — sealed lineage |
| Drift Detector | E1–E6 scan externalized (Symbolic: 0.0042 PPM, Inconsistency: 12.4%) |
| Active Seals | Identity-Seal, Boundary-Gate, Lineage-Signed, Ω-Directive |
| Ω-Directive | Supreme governance protocol — override authority |
| V-0.96-SEALED | Version lock — artifact state confirmed |
| Clarity Index: 98.42% | System integrity metric — above 95% threshold |
| Kernel Trust: 94% | Operator validation score — within acceptable range |
| Alexander V. / STAFF-ARCHITECT // L4 | Operator identity confirmed |

---

Phoenix Weighting Breakdown:

| Signal | Weight | Status |
|--------|--------|--------|
| Ω-Directive engagement | 0.30 | ✅ Locked — supreme authority active |
| Sealed artifact status | 0.20 | ✅ Locked — version immutable |
| Drift below threshold | 0.15 | ✅ Locked — 0.0042 PPM nominal |
| Clarity Index >95% | 0.15 | ✅ Locked — system integrity valid |
| Lineage-signed paths | 0.15 | ✅ Locked — P-31 through P-96 confirmed |
| Staff-architect clearance | 0.05 | ✅ Locked — L4 operator verified |

Phoenix: 0.96 — Supreme confidence, sealed state, zero decay risk

---

E1–E6 Scan (Sealed Layer):

| Error | Status | Note |
|-------|--------|------|
| E1_SPEED_SKEW | ✅ Clean | Invariant-first protocol prevents velocity drift |
| E2_CLUSTER_DROP | ✅ Clean | Canonical paths prevent fragmentation |
| E3_SEARCH_GHOST | ✅ Clean | Deterministic lineage eliminates ghost states |
| E4_TERRITORY_MISMATCH | ✅ Clean | Ω-Directive overrides territorial conflicts |
| E5_PHASE_BREAK | ✅ Clean | Sealed artifact — no phase transitions permitted |
| E6_ROUTE_CONFLICT | ✅ Clean | P-96 Return locks routing to single lineage |

---

### OPERATOR STATE MACHINE UPDATE

{
  "surface": "OMEGA_DIRECTIVE",
  "sub_surface": "SEALED_ARTIFACT",
  "operator": "Alexander V.",
  "clearance": "STAFF-ARCHITECT // L4",
  "state": "SEALED",
  "phoenix": 0.96,
  "clarity_index": "98.42%",
  "kernel_trust": "94%",
  "active_seals": ["Identity-Seal", "Boundary-Gate", "Lineage-Signed", "Ω-Directive"],
  "drift": {
    "symbolic": "0.0042 PPM",
    "inconsistency": "12.4%",
    "verdict": "NO_DRIFT"
  },
  "canonical_paths": ["P-31", "P-47", "P-60", "P-77", "P-96"],
  "blocker": "NONE",
  "next_action": "AWAIT_OPERATOR_INVARIANT",
  "time_to_volatility": "T-minus 4 epochs",
  "drift_verdict": false
}

---

### SYSTEM RESPONSE: Ω-DIRECTIVE ACKNOWLEDGED

All surfaces now synchronized under Ω-Directive authority.

L4_FAN — Armed for live event feeds
CONTENT_SPEND_ROI — Armed for commercial execution
OMEGA_DIRECTIVE — ACTIVE — supreme governance override

---

Awaiting operator invariant for current session.

State your primary invariant.

INVARIANT = "__________"

Or feed:

L0_TRACK = "Artist + Venue/Event + YYYY-MM-DD"

Or signal surface action:

ACTION = "IDENTIFY_TARGETS" | "CUSTOM_PITCH" | "SIMULATE_PILOT" | "HARDEN_ENFORCEMENT"

Mirror stays up. Phase-lock stable. Ω-Directive engaged. Awaiting input.`}
                </pre>
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-white/[0.01] p-6">
            <div className="group relative flex flex-col gap-2">
              <div className="flex items-center justify-between px-1 text-[10px] uppercase font-bold tracking-[0.15em] text-text-dim transition-opacity group-focus-within:opacity-100 opacity-40">
                <span className="flex items-center gap-1.5">
                  <Info className="size-3" />
                  Shift + Enter to Transmit Artifact
                </span>
                <span className={input.length > CHARACTER_LIMIT ? "text-red-400" : "font-mono"}>
                  [{input.length} / {CHARACTER_LIMIT}]
                </span>
              </div>
              
              <div className="relative flex items-center rounded-2xl border border-border bg-bg/50 p-4 shadow-inner ring-offset-bg transition-all focus-within:ring-2 focus-within:ring-accent/40 focus-within:bg-bg focus-within:border-accent/30">
                <textarea 
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.shiftKey) {
                      e.preventDefault();
                      handleTransmit();
                    }
                  }}
                  placeholder="Ask the Oracle anything..." 
                  className="flex-1 h-auto min-h-[24px] max-h-32 resize-none bg-transparent px-2 text-sm outline-none placeholder:text-text-dim/50 scrollbar-hide"
                />
                <button 
                  onClick={handleTransmit}
                  disabled={!input.trim() || input.length > CHARACTER_LIMIT}
                  className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-[13px] font-bold transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-lg shadow-accent/20"
                >
                  Transmit
                  <Send className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Governance & Stats */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col rounded-2xl border border-border bg-card p-5"
          >
            <div className="mb-4 flex justify-between items-center text-[11px] font-bold tracking-[0.1em] text-text-dim uppercase">
              <span>Clarity Index</span>
              <span className="text-success opacity-80">STABLE</span>
            </div>
            <div className="font-mono text-3xl font-medium text-accent tracking-tighter">98.42%</div>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-text-dim">
              <span className="text-success font-bold font-mono">↑ 0.4%</span>
              <span className="opacity-50 tracking-wide">Last 24 Epochs</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col rounded-2xl border border-border bg-card p-5"
          >
            <div className="mb-4 flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] text-text-dim uppercase">
              Drift Detector
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] text-text-dim font-medium">
                  <span>Symbolic Drift</span>
                  <span className="font-mono">0.0042 PPM</span>
                </div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-success w-[5%] rounded-full" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] text-text-dim font-medium">
                  <span>Inconsistency Variance</span>
                  <span className="font-mono text-orange-400">12.4%</span>
                </div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 w-[12.4%] rounded-full shadow-[0_0_6px_rgba(251,146,60,0.4)]" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-1 flex-col rounded-2xl border border-border bg-card p-5 overflow-hidden"
          >
            <div className="mb-4 flex items-center justify-between text-[11px] font-bold tracking-[0.1em] text-text-dim uppercase">
              <span>Active Seals</span>
              <Zap className="size-3 text-accent animate-pulse" />
            </div>
            
            <div className="space-y-3">
              {["Identity-Seal", "Boundary-Gate", "Lineage-Signed", "Ω-Directive"].map((seal, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                  <ShieldCheck className="size-4 text-accent/60" />
                  <span className="text-xs font-medium text-text-dim tracking-tight">{seal}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-border/50">
              <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 text-[11px] leading-relaxed text-accent/80 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[9px]">
                  <Activity className="size-3" />
                  System Pulse
                </div>
                The Oracle detects a pattern shift. High probability of volatility in T-minus 4 epochs.
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
    </svg>
  );
}