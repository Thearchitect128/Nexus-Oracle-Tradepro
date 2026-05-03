---- MODULE OmegaOperatorStack_Final ----
(***************************************************************************)
(* Omega Operator Stack Specification - Final with Tracing *)
(* Author: Mohammad Saad Younus *)
(*                                                                         *)
(* Operators: ≈↻ ॐ️ 🦁 🐉 🦉 🔱                                          *)
(*                                                                         *)
(* Final: Includes Recharge with 4 charges + PrintT tracing              *)
(* Trace points: ॐ sync fires, Recharge occurs, Terminal stall           *)
(* This is production-ready for TLC model checking.                       *)
(***************************************************************************)

EXTENDS Naturals, Integers, Sequences, FiniteSets, TLC

CONSTANTS
    MaxEnergy,          \* Upper bound on system energy
    PhiSync_x1000,      \* Golden ratio sync * 1000, e.g. 618 for 0.618
    Epsilon_x1000,      \* Near-recurrence threshold * 1000
    Components,         \* Set of system components
    Phases,             \* Set of possible phases, assume Nat
    HistoryMax,         \* Max history length
    MaxCharges          \* Total recharge operations allowed

ASSUME Assumptions ==
    /\ MaxEnergy \in Nat \ {0}
    /\ PhiSync_x1000 \in 1..999
    /\ Epsilon_x1000 \in Nat
    /\ HistoryMax \in Nat \ {0}
    /\ MaxCharges \in Nat
    /\ Phases \subseteq Nat
    /\ Components # {}

VARIABLES
    state,              \* Current system state: [Components -> Phases]
    energy,             \* Current energy level
    history,            \* Sequence of past states
    authority,          \* "deciding" | "executing" | "verifying" | "recharging"
    verified,           \* Boolean: last operation verified
    proposed,           \* Next state proposed by Decide
    charges,            \* Recharge operations remaining
    syncCount           \* Counter: how many times ॐ fired

vars == <<state, energy, history, authority, verified, proposed, charges, syncCount>>

(* ═══════════════════ Helpers ═══════════════════ *)

RECURSIVE Sum(_)
Sum(seq) == IF seq = <<>> THEN 0 ELSE Head(seq) + Sum(Tail(seq))

Abs(x) == IF x >= 0 THEN x ELSE -x

Distance(s1, s2) ==
    LET diffs == [c \in Components |-> Abs(s1[c] - s2[c]) * 1000]
    IN Sum([c \in Components |-> diffs[c]])

Quantize(phase) ==
    LET scaled == phase * 1000
        remainder == scaled % PhiSync_x1000
        base == scaled - remainder
    IN IF remainder * 2 >= PhiSync_x1000
       THEN (base + PhiSync_x1000) \div 1000
       ELSE base \div 1000

Min(set) == CHOOSE x \in set : \A y \in set : x <= y
Max(set) == CHOOSE x \in set : \A y \in set : x >= y

(* ═══════════════════ Types and Invariants ═══════════════════ *)

TypeInvariant ==
    /\ state \in [Components -> Phases]
    /\ proposed \in [Components -> Phases]
    /\ energy \in 0..MaxEnergy
    /\ history \in Seq([Components -> Phases])
    /\ Len(history) <= HistoryMax
    /\ authority \in {"deciding", "executing", "verifying", "recharging"}
    /\ verified \in BOOLEAN
    /\ charges \in 0..MaxCharges
    /\ syncCount \in Nat

EnergyBound ==
    energy <= MaxEnergy

ChargesBound ==
    charges <= MaxCharges

(* ═══════════════════ Operators ═══════════════════ *)

(* Near-Recurrence Operator (≈↻) *)
(* Detects when current state is within Epsilon of any historical state *)
NearRecurrence(s) ==
    \E i \in 1..Len(history) : Distance(s, history[i]) <= Epsilon_x1000

(* Unity Anchor (ॐ) - Snap to φ-grid *)
(* Enforces coherence by quantizing to golden-ratio intervals *)
SyncToPhi(s) ==
    [c \in Components |->
        LET q == Quantize(s[c])
        IN IF q \in Phases THEN q ELSE Min(Phases)
    ]

(* Sovereign Authority (🦁) - Energy-aware phase selection *)
(* Advance phases when energy >= 50%, retreat when low *)
ChoosePhase(currentPhase) ==
    LET phaseList == CHOOSE seq \in [1..Cardinality(Phases) -> Phases] :
                        Range(seq) = Phases /\ \A i,j \in DOMAIN seq : i < j => seq[i] < seq[j]
        idx == CHOOSE i \in DOMAIN phaseList : phaseList[i] = currentPhase
        nextIdx == IF energy * 2 >= MaxEnergy
                   THEN IF idx = Len(phaseList) THEN 1 ELSE idx + 1
                   ELSE IF idx = 1 THEN Len(phaseList) ELSE idx - 1
    IN phaseList[nextIdx]

(* ═══════════════════ Tri-Phase Execution (🔱) + Recharge ═══════════════════ *)

(* 🦁 DECIDE: Sovereign picks next state but doesn't commit yet *)
Decide ==
    /\ authority = "deciding"
    /\ proposed' = [c \in Components |-> ChoosePhase(state[c])]
    /\ authority' = "executing"
    /\ UNCHANGED <<state, energy, history, verified, charges, syncCount>>

(* 🐉 EXECUTE: Apply proposed state if energy available *)
Execute ==
    /\ authority = "executing"
    /\ energy > 0
    /\ state' = proposed
    /\ energy' = energy - 1
    /\ history' = Append(history, proposed)
    /\ authority' = "verifying"
    /\ UNCHANGED <<verified, proposed, charges, syncCount>>

(* 🦉 VERIFY + ॐ Unity Anchor with tracing *)
Verify ==
    /\ authority = "verifying"
    /\ EnergyBound
    /\ \A c \in Components : state[c] \in Phases
    /\ verified' = TRUE
    /\ LET willSync == NearRecurrence(state)
           syncedState == IF willSync THEN SyncToPhi(state) ELSE state
       IN /\ state' = syncedState
          /\ syncCount' = IF willSync /\ syncedState # state
                          THEN syncCount + 1
                          ELSE syncCount
          /\ IF willSync /\ syncedState # state
             THEN PrintT(<<"ॐ Unity Anchor fired",
                          "cycle", Len(history),
                          "energy", energy,
                          "charges", charges,
                          "distance_synced", Distance(state, syncedState)>>)
             ELSE TRUE
    /\ authority' = "deciding"
    /\ history' = IF Len(history) > HistoryMax
                  THEN Tail(history)
                  ELSE history
    /\ UNCHANGED <<energy, proposed, charges>>

(* 🔋 RECHARGE: Only when energy depleted and charges remain *)
Recharge ==
    /\ authority = "executing"
    /\ energy = 0
    /\ charges > 0
    /\ energy' = MaxEnergy
    /\ charges' = charges - 1
    /\ authority' = "recharging"
    /\ PrintT(<<"🔋 RECHARGE",
               "charges_remaining", charges - 1,
               "cycles_completed", Len(history),
               "sync_events", syncCount>>)
    /\ UNCHANGED <<state, history, verified, proposed, syncCount>>

(* Return to deciding after recharge *)
ResumeAfterRecharge ==
    /\ authority = "recharging"
    /\ authority' = "deciding"
    /\ UNCHANGED <<state, energy, history, verified, proposed, charges, syncCount>>

(* Terminal stall: no energy and no charges *)
TerminalStall ==
    /\ authority = "executing"
    /\ energy = 0
    /\ charges = 0
    /\ PrintT(<<"⚠️  TERMINAL STALL",
               "total_cycles", Len(history),
               "total_sync_events", syncCount,
               "final_state", state>>)
    /\ UNCHANGED vars

Next ==
    Decide \/ Execute \/ Verify \/ Recharge \/ ResumeAfterRecharge \/ TerminalStall

(* ═══════════════════ Fairness and Properties ═══════════════════ *)

Fairness ==
    /\ WF_vars(Decide)
    /\ WF_vars(Execute)
    /\ WF_vars(Verify)
    /\ WF_vars(Recharge)
    /\ WF_vars(ResumeAfterRecharge)

(* Safety: System never violates energy bounds *)
EnergySafety ==
    [] EnergyBound

(* Safety: Charges never overflow *)
ChargesSafety ==
    [] ChargesBound

(* Liveness: System eventually verifies *)
VerificationLiveness ==
    []<>(authority = "verifying" /\ verified)

(* Liveness: System eventually stalls when charges depleted *)
EventuallyStalls ==
    <>[](authority = "executing" /\ energy = 0 /\ charges = 0)

(* Invariant: syncCount only increases or stays the same *)
SyncCountMonotonic ==
    [][syncCount' >= syncCount]_vars

(* ═══════════════════ Initial State ═══════════════════ *)

Init ==
    /\ state = [c \in Components |-> Min(Phases)]
    /\ proposed = state
    /\ energy = MaxEnergy
    /\ history = <<>>
    /\ authority = "deciding"
    /\ verified = TRUE
    /\ charges = MaxCharges
    /\ syncCount = 0

(* ═══════════════════ Specification ═══════════════════ *)

Spec ==
    Init /\ [][Next]_vars /\ Fairness

====
