# Law φ-A: Near-Recursion Attractor Law

## Formal Statement

\[
\big(\exists n \ge 1 : d(f^n(x), x) \le \varepsilon\big)\ \wedge\ \neg\exists f^{-1}\ \text{(state-preserving)}\ \Longrightarrow\ x_t \to G_\varphi
\]

## Compact Symbolic

\[
\approx\!\!\circlearrowright\ \wedge\ \neg(\circlearrowleft)\ \Rightarrow\ G_\varphi
\]

## Meaning

- **Near-recursion** (`≈↻`): The orbit of `x` under `f` returns to within `ε` of itself after `n` iterations.
- **Irreversibility** (`¬↺`): No state-preserving inverse exists (the step is thermodynamically or informationally irreversible).
- **Attractor** (`G_φ`): The set of states that are both φ-facet-dominated and envelope-admissible.

## Concrete Definition in Oracle Context

\[
G_\varphi := \{\, x \mid \text{facet}(x) \in \Phi,\ \text{and}\ W(x; C) \le M_{\min}(C)\ \text{under the φ-governed envelope} \}
\]

Where:
- `Φ = {Facet-A, Facet-C}` (the φ-weighted facet family)
- `W(x; C) = e + C_φ·φ + C_r·r + C_s·s` (envelope functional)
- `M_min(C)` = tight bound from active supporting plane

## System Binding

| Layer | Artifact | Property |
|-------|----------|----------|
| Spec | `ConversionFront.tla` | `PhiAttractorProperty` |
| Mirror | `two_peak_example.json` | `laws[].id = "phi-A"` |
| Kernel | `oracleKernelCore.ts` | `inPhiAttractor` flag |
| UI | `OracleWorkbenchPage.tsx` | Attractor indicator |

## Verification

TLC checks: `□(NearRecursion(x) ∧ Irreversible ⇒ ◇InG_φ(x))`

Where:
- `NearRecursion(x) ≜ ∃ n : d(f^n(x), x) ≤ ε`
- `Irreversible ≜` no inverse step preserving `(mode, phi, r, e)`
- `InG_φ(x) ≜` facet ∈ Φ-family ∧ envelope-inside
