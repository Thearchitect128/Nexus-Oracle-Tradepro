# Contributing

## Allocator v3.1 policy contract

1. **Hard constraints decide eligibility.** `canAssign()` returns a boolean. If it returns `false`, no edge exists and no cost is computed.
2. **Soft preferences decide ranking.** `edgeCost()` returns a finite scalar where lower is better. Cost is only evaluated for eligible edges.
3. **Unreachable preference logic is a bug.** If a preference penalty can never trigger because eligibility blocks it, move the check or delete the penalty.
4. **The graph must encode policy.** The solver only sees nodes, edges, capacities, and costs.
5. **Review must verify policy parity.** Pull requests should explicitly compare intended policy against executable graph behavior.
