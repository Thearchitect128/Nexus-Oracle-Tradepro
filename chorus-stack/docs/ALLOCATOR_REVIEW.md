# Allocator Review Protocol

Use this one-page loop when reviewing assignment behavior:

1. **Policy**
   - Write intended hard constraints (eligibility) separately from soft preferences (ranking).
2. **Code review**
   - Confirm `canAssign()` only contains hard constraints.
   - Confirm `edgeCost()` only contains soft preferences and returns finite costs for eligible edges.
3. **Graph encoding**
   - Verify ineligible pairs do not produce edges.
   - Verify edge insertion skips non-finite costs (for example, `Infinity`).
4. **Solver behavior**
   - Validate that expected preferences are observable in selected assignments.
5. **Regression checks**
   - Add/keep tests that cover at least one hard rejection and one soft penalty tradeoff.

## Decision boundaries

- Hard constraints are binary and define edge existence.
- Soft preferences are scalar and define edge rank.
- If policy text and graph implementation diverge, implementation is wrong until corrected.
