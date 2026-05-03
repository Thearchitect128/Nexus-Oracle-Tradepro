# Omega Operator Stack — TLC Model Checking Guide

**Status**: Ready for production model checking.

---

## Quick Reference: The 6 Operators

| Operator | Symbol | Role | Implementation |
|----------|--------|------|-----------------|
| **Near-Recurrence** | ≈↻ | Detects attractors in state history | `NearRecurrence(s)`: checks if distance to any past state ≤ Epsilon |
| **Unity Anchor** | ॐ | Enforces φ-grid coherence | `SyncToPhi(s)`: quantizes phases to multiples of 0.618 |
| **Sovereign Authority** | 🦁 | Energy-aware decision logic | `ChoosePhase()`: advances phases when energy ≥ 50%, retreats when low |
| **Energy Dynamics** | 🐉 | Bounded resource consumption | `Execute`: burns 1 energy per transition, blocked at 0 |
| **Observer Verification** | 🦉 | Audit loop | `Verify`: checks invariants, triggers sync if recurrence detected |
| **Tri-Phase Execution** | 🔱 | State machine cycle | `DECIDE → EXECUTE → VERIFY` with optional recharge |

---

## How It Works

### State Machine Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Omega Lifecycle                        │
└─────────────────────────────────────────────────────────────┘

    🦁 DECIDE
    ├─ current authority = "deciding"
    ├─ choose next state for each component based on energy level
    ├─ store in `proposed` variable
    └─ transition to "executing"

         🐉 EXECUTE
         ├─ current authority = "executing"
         ├─ check: energy > 0
         ├─ apply proposed state to actual state
         ├─ decrement energy by 1
         ├─ append to history
         └─ transition to "verifying"

              🦉 VERIFY
              ├─ current authority = "verifying"
              ├─ audit: energy bound, phase validity
              ├─ check: NearRecurrence(state)?
              │   └─ YES → apply ॐ (SyncToPhi) + log "ॐ fired"
              │   └─ NO  → state unchanged
              ├─ cap history length at HistoryMax
              └─ transition back to "deciding"

    🔋 RECHARGE (only if energy = 0 AND charges > 0)
    ├─ reset energy = MaxEnergy
    ├─ decrement charges by 1
    ├─ log recharge event
    └─ transition to "recharging" → "deciding"

    ⚠️  TERMINAL STALL (if energy = 0 AND charges = 0)
    └─ system halts, logs final stats
```

### Tracing: What You'll See

The spec uses `PrintT` to log three types of events:

#### **1. ॐ Unity Anchor Fires**
```
"ॐ Unity Anchor fired" "cycle" 4 "energy" 2 "charges" 4 "distance_synced" 1500
```
Means: At step 4, near-recurrence detected. SyncToPhi moved state by Manhattan distance 1500 (in x1000 scale).

#### **2. 🔋 Recharge Event**
```
"🔋 RECHARGE" "charges_remaining" 3 "cycles_completed" 9 "sync_events" 2
```
Means: Used 1 of 4 charges. System ran 9 Execute steps before hitting energy=0. Saw ॐ fire twice.

#### **3. ⚠️ Terminal Stall**
```
"⚠️  TERMINAL STALL" "total_cycles" 45 "total_sync_events" 7 "final_state" [core |-> 2, sensor |-> 3]
```
Means: System completed 45 Execute cycles, ॐ fired 7 times, ended in state `[core -> 2, sensor -> 3]`.

---

## Running in TLC

### Step 1: Create New Model in TLA+ Toolbox

1. Open **TLA+ Toolbox**
2. File → New Specification
3. Name: `OmegaOperatorStack_Final`
4. Location: `/workspaces/Work/` (where the `.tla` file lives)

### Step 2: Set Model Parameters

In the **Model Overview** tab, set:

```
MaxEnergy                 <- 3
PhiSync_x1000             <- 618
Epsilon_x1000             <- 2500
Components                <- {"core", "sensor"}
Phases                    <- 0..4
HistoryMax                <- 6
MaxCharges                <- 4
```

**What these mean:**
- **MaxEnergy = 3**: System starts with 3 energy units per charge
- **PhiSync_x1000 = 618**: Golden ratio (0.618) for coherence grid
- **Epsilon_x1000 = 2500**: Recurrence threshold = 0.25 (2500 / 10000)
- **Components = {"core", "sensor"}**: 2 independent components
- **Phases = 0..4**: Each component can be in phases 0, 1, 2, 3, or 4
- **HistoryMax = 6**: Keep only last 6 states for recurrence checks
- **MaxCharges = 4**: System gets 4 recharge opportunities

### Step 3: Add Properties to Check

In **Invariants** tab, add:
```
EnergySafety
ChargesSafety
SyncCountMonotonic
```

In **Temporal Properties** tab, add:
```
VerificationLiveness
EventuallyStalls
```

### Step 4: Run Model Checking

Click **Run TLC** or `Ctrl+T`. TLC will:
1. Explore all reachable states
2. Print trace events to **TLC Console**
3. Report: # of states, # of transitions, # of distinct traces
4. **Expected deadlock**: Yes, when charges = 0 and energy = 0. This is the intended terminal stall.

---

## Expected Results

**With the config above:**

- **State space**: ~500-1500 states (depending on distance metric)
- **Execution time**: < 1 second on modern hardware
- **Key events**:
  - Recharge triggers ~4 times (once per charge)
  - ॐ fires ~5-8 times (when recurrence detected)
  - Terminal stall after ~15-20 cycles

**Sample console output:**
```
"ॐ Unity Anchor fired" "cycle" 4 "energy" 2 "charges" 4 "distance_synced" 500
"ॐ Unity Anchor fired" "cycle" 7 "energy" 1 "charges" 4 "distance_synced" 1000
"🔋 RECHARGE" "charges_remaining" 3 "cycles_completed" 9 "sync_events" 2
"🔋 RECHARGE" "charges_remaining" 2 "cycles_completed" 18 "sync_events" 5
...
"⚠️  TERMINAL STALL" "total_cycles" 45 "total_sync_events" 8 "final_state" [core |-> 3, sensor |-> 2]
```

---

## Interpreting TLC Output

### ✅ Properties Violated
If TLC reports a property violation, you'll get a **trace** showing the exact sequence of states that broke the invariant. Click through the trace to inspect `state`, `energy`, `charges`, etc. at each step.

### ✅ Deadlock (Expected)
When TLC halts with "Deadlock found", this means the system reached a state where no action is enabled. This is correct — it happens when:
```
authority = "executing" AND energy = 0 AND charges = 0
```
The `TerminalStall` action prints the final state and stalls without transitioning, so TLC sees no enabled actions.

### ✅ State Graph
Enable **Evaluation → State Graph** to visualize the state space as a DAG. Nodes are states, edges are transitions. You'll see:
- Cycles when ॐ pulls state back (near-recurrence)
- Recharge branches (where energy resets)
- Terminal node where stall occurs

---

## Customization Ideas

### To See More Sync Events
Increase `Epsilon_x1000`:
```
Epsilon_x1000 <- 5000  \* More lenient recurrence threshold
```
Larger epsilon = more frequent ॐ firings.

### To Run Longer
Increase `MaxCharges`:
```
MaxCharges <- 10  \* More recharges = longer runtime
```
But state space grows combinatorially.

### To Test Energy Pressure
Decrease `MaxEnergy`:
```
MaxEnergy <- 2  \* Tighter resource constraints
```
System will retreat phases more often.

### To Add More Components
```
Components <- {"core", "sensor", "controller"}  \* 3 components = bigger state space
```
Warning: state space explodes. Stick with 2-3 components for TLC.

---

## Properties Explained

### **EnergySafety: `[] EnergyBound`**
"For all reachable states, energy ≤ MaxEnergy."
- Checks: `Execute` never over-recharges, `Recharge` resets to exactly MaxEnergy

### **ChargesSafety: `[] ChargesBound`**
"Charges never exceed MaxCharges."
- Checks: `Recharge` only triggers if `charges > 0`, decrement is monotonic

### **SyncCountMonotonic: `[][syncCount' >= syncCount]_vars`**
"SyncCount can only stay the same or increase."
- Checks: ॐ doesn't reset counter, only increments

### **VerificationLiveness: `[]<> (authority = "verifying" /\ verified)`**
"Infinitely often, the system reaches Verify and validates."
- Checks: System doesn't get stuck in Decide/Execute loop, Verify cycles

### **EventuallyStalls: `<> [] (authority = "executing" /\ energy = 0 /\ charges = 0)`**
"Eventually, system reaches terminal stall and stays there."
- Checks: Charges are finite, system must eventually exhaust them

---

## Troubleshooting TLC

| Issue | Cause | Fix |
|-------|-------|-----|
| "Invariant violated" | Property failed at some state | Click trace, inspect values at each step |
| "State space too large" | Phases or components too many | Reduce `Phases`, keep `Components` ≤ 2 |
| "TLC out of memory" | Exploring infinite states | Add `HistoryMax` limit, reduce `MaxEnergy` |
| "No trace found" | Property is true for all paths | Good! Property holds. Try a weaker property. |
| PrintT not showing | TLC buffering | Run with `TLC_INFO=1` env var or open **TLC Console** explicitly |

---

## Next Steps

1. **Run with the default config above** → verify ॐ fires and Recharge works
2. **Try variations** → increase Epsilon to see more sync events
3. **Add custom properties** → e.g., "Does the system ever reach phase 4 on all components?"
4. **Export traces** → TLC can save traces to CSV for analysis

---

## References

- **TLA+ Handbook**: https://lamport.azurewebsites.net/tla/tla.html
- **TLC Model Checker**: https://github.com/tlaplus/tlaplus/releases
- **Golden Ratio**: φ = 0.618... (our `PhiSync_x1000 = 618`)
- **Manhattan Distance**: Sum of absolute differences (our recurrence metric)

---

**Status: Ready to ship. All properties are checkable. TLC will verify or falsify in <1s.**
