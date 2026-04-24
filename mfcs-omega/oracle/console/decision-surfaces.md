# Decision Surfaces

Decision surfaces are the operator-visible panels that explain why the oracle
produced its current result.

## Required Surfaces

- Envelope status: inside/outside, margin, and support gap
- Facet status: active facet, label, and minimum bound
- Law status: `phi-A`, irreversibility, and attractor membership
- Mirror status: current version, invariants, and recent trace evidence
- Override status: whether a manual intervention is pending, approved, or
  rejected

## Design Rule

Every decision surface must answer one operator question directly:

- What state am I in?
- Why is it safe or unsafe?
- What evidence supports this view?
- What happens if I intervene?
