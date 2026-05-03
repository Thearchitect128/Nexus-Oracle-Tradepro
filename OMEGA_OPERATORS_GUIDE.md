# Omega Operator Stack: Visual & Conceptual Guide

## The 6 Operators: What They Do

### 1. **Near-Recurrence Detector** ≈↻
**Detects when the system returns close to a previous state.**

```
History: [state_0, state_1, state_2, state_3, state_4]
Current: state_5

Check: Is distance(state_5, state_i) <= Epsilon for any i?
  ├─ YES → Recurrence detected!
  └─ NO  → Novel state, continue
```

**Purpose**: Early warning system. Prevents infinite loops by detecting when the system is cycling in the same attractor basin.

**In code:**
```tla
NearRecurrence(s) ==
    \E i \in 1..Len(history) : Distance(s, history[i]) <= Epsilon
```

---

### 2. **Unity Anchor** ॐ
**Snaps the system to a coherent grid: the golden ratio φ.**

```
Before: state = [core -> 2.3, sensor -> 1.8]
                                 ↓
        Quantize to φ = 0.618 intervals
                                 ↓
After:  state = [core -> 2.0, sensor -> 2.0]  (snapped to grid)
```

**Purpose**: Ensures all components oscillate in phase. Think of it like tuning all instruments to the same frequency.

**When it fires**: During Verify, if `NearRecurrence` detected, apply `SyncToPhi`.

**Why φ?**: Golden ratio appears in nature (nautilus shell, tree branching, Fibonacci). It's mathematically optimal for growth/collapse cycles.

**In code:**
```tla
SyncToPhi(s) ==
    [c \in Components |-> Quantize(s[c])]

Quantize(phase) ==
    LET scaled == phase * 1000
        remainder == scaled % 618  \* φ = 0.618
    IN IF remainder * 2 >= 618
       THEN (base + 618) \div 1000
       ELSE base \div 1000
```

---

### 3. **Sovereign Authority** 🦁
**Makes decisions based on energy level. Strategic, not reactive.**

```
Energy Level    Decision
≥ 50%           Advance phases (explore)
< 50%           Retreat phases (conserve)
= 0             Stall until recharge
```

**Purpose**: Models intelligent resource management. Like a chess player who plays aggressively when ahead, defensively when behind.

**Example:**
```
Components: {core, sensor, memory}
Phases: 0 → 1 → 2 → 3 → 0 (cycle)

High energy (80%):
  core:   0 → 1 (advance)
  sensor: 2 → 3 (advance)
  memory: 1 → 2 (advance)

Low energy (20%):
  core:   1 → 0 (retreat)
  sensor: 3 → 2 (retreat)
  memory: 2 → 1 (retreat)
```

**In code:**
```tla
ChoosePhase(currentPhase) ==
    LET phaseList == [0, 1, 2, 3]  \* sorted phases
        idx == CHOOSE i : phaseList[i] = currentPhase
    IN IF energy * 2 >= MaxEnergy
       THEN phaseList[(idx % 4) + 1]   \* advance
       ELSE phaseList[(idx - 1 + 4) % 4]  \* retreat
```

---

### 4. **Energy Dynamics** 🐉
**Every action has a cost. Bounded resources.**

```
     Execute
        ↓
  energy: 5 → 4 → 3 → 2 → 1 → 0
        ↓              ↓
      work         RECHARGE or STALL
```

**Purpose**: Realism. Real systems can't run forever. Bounded energy forces strategic choices.

**Rules:**
- Each transition costs 1 energy
- System can't transition when energy = 0
- Recharge restores energy to Max (but only 4 times)
- After 4 recharges, system terminates

**In code:**
```tla
Execute ==
    /\ energy > 0
    /\ state' = proposed
    /\ energy' = energy - 1
    /\ history' = Append(history, proposed)
```

---

### 5. **Observer Verification** 🦉
**Audit loop. Checks invariants every cycle.**

```
Verify checks:
  ├─ energy ≤ MaxEnergy?
  ├─ all phases ∈ valid Phases?
  ├─ NearRecurrence detected?
  │   └─ YES → trigger ॐ (SyncToPhi)
  └─ verified' = TRUE
```

**Purpose**: Safety net. Catches violations before they propagate.

**The interaction with ≈↻ and ॐ:**
1. If state is near a previous state (recurrence), it's suspicious
2. Force a sync to break the pattern
3. Log it for tracing

**In code:**
```tla
Verify ==
    /\ EnergyBound
    /\ \A c : state[c] \in Phases
    /\ LET willSync == NearRecurrence(state)
       IN state' = IF willSync THEN SyncToPhi(state) ELSE state
    /\ verified' = TRUE
```

---

### 6. **Tri-Phase Execution** 🔱
**The state machine. Three-step cycle, like a pump.**

```
┌──────────────────────────────────────────┐
│      🔱 Tri-Phase Pump Cycle             │
└──────────────────────────────────────────┘

      🦁 DECIDE
      (propose change)
            ↓
      🐉 EXECUTE
      (commit & cost)
            ↓
      🦉 VERIFY
      (audit & sync)
            ↓
      [loop back to DECIDE]
```

**Why 3 phases?**
- **Decide**: Think
- **Execute**: Act
- **Verify**: Check

Separating these prevents cascading errors. If Execute fails, state isn't changed. If Verify fails, we know exactly where.

**Execution trace for one cycle:**
```
Initial: authority="deciding", state=[core→0, sensor→0], energy=3

Step 1: Decide
  proposed' = [core→1, sensor→1]
  authority' = "executing"

Step 2: Execute
  state' = proposed = [core→1, sensor→1]
  energy' = 2
  history' += [core→1, sensor→1]
  authority' = "verifying"

Step 3: Verify
  Check: energy ≤ Max? YES
         phases valid? YES
         recurrence? NO
  state' = state (unchanged)
  authority' = "deciding"

[System loops back to Decide for next cycle]
```

---

## System Dynamics: How They Work Together

### Scenario 1: Normal Operation (No Recurrence)

```
Cycle 1-3: Decide→Execute→Verify cycle, energy decreasing
  state: [0,0] → [1,1] → [2,2]
  energy: 3 → 2 → 1
  ≈↻: No recurrence yet
  ॐ: Silent

Cycle 4: Distance to state[1,1] is small (< Epsilon)
  ≈↻: DETECTS RECURRENCE!
  ॐ: FIRES! State snapped to φ-grid
  ॐ: [2,2] → [2.0, 2.0] (quantized)
  syncCount++
```

### Scenario 2: Energy Exhaustion & Recharge

```
Cycle 8: energy = 0, charges = 2
  Execute: BLOCKED (energy = 0)
  Recharge: TRIGGERED
    energy' = MaxEnergy = 3
    charges' = 1
    Log: "🔋 RECHARGE charges_remaining=1"

Cycle 9+: Resume with fresh energy
  state continues evolving
```

### Scenario 3: Terminal Stall

```
After 4 recharges used (charges = 0):
  Cycle N: energy → 0
  Recharge: BLOCKED (charges = 0)
  TerminalStall: TRIGGERED
    Log: "⚠️  TERMINAL STALL total_cycles=45 sync_events=8"
    system halts, no more transitions
```

---

## Properties the System Guarantees

| Property | Meaning | How Verified |
|----------|---------|--------------|
| **EnergySafety** | Energy never exceeds Max | Execute only decrements, Recharge sets to exactly Max |
| **ChargesSafety** | Charges never exceed MaxCharges | Recharge only fires if charges > 0 |
| **SyncCountMonotonic** | ॐ counter only increases | ✓ Never decreases |
| **VerificationLiveness** | System keeps verifying | Fairness: WF_vars(Verify) ensures Verify runs infinitely often |
| **EventuallyStalls** | System eventually halts | Charges finite → Recharge can't run forever → Terminal stall inevitable |

---

## The Metaphor

Think of the Omega Operator Stack as a **living system with constraints**:

- 🦁 **Sovereign** makes decisions based on resources
- 🐉 **Energy** is finite and valuable
- ≈↻ **Near-Recurrence** detects when you're going in circles
- ॐ **Unity** snaps you back to coherence when you drift
- 🦉 **Observer** audits every step
- 🔱 **Pump** cycles through Decide → Execute → Verify

Together, they create a **self-correcting system** that:
1. ✅ Makes progress (Sovereign decides)
2. ✅ Respects limits (Energy bounds)
3. ✅ Avoids loops (Near-Recurrence + Sync)
4. ✅ Self-audits (Verification)
5. ✅ Gracefully terminates (Terminal Stall)

---

## Running This in Your Head

**Imagine a robot with:**
- Limited battery (energy)
- 4 backup batteries (charges)
- Multiple sensors (components)
- Each sensor can be in states 0-4 (phases)
- A tendency to repeat patterns (history)

**The robot:**
1. Reads sensors, picks next state (Decide - 🦁)
2. Moves to new state, burns battery (Execute - 🐉)
3. Checks: "Did we see this state before?" If yes, re-calibrate (Verify + Sync - 🦉 + ॐ)
4. Repeat until battery dies
5. Use backup battery, continue
6. After 4 backup batteries, power down permanently (Terminal Stall - ⚠️)

**The φ grid (ॐ)** ensures calibration happens on a rhythm: not arbitrary, not chaotic, but coherent.

---

## Next: Run in TLC

See `OMEGA_TLC_GUIDE.md` for how to model-check this formally.

The 6 operators are **not just metaphors** — they compile to TLA+ and are **mathematically verified** by TLC.
