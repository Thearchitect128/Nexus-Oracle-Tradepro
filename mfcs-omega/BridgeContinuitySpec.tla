------------------------------ MODULE BridgeContinuitySpec ------------------------------
EXTENDS Naturals, Sequences, TLC

(***************************************************************************)
(* BridgeContinuitySpec                                                     *)
(* A design-level bridge between:                                           *)
(*   - MFCS phase discipline                                                *)
(*   - Nexus Fusion persistence                                             *)
(*   - Guardian-mediated lattice transitions                                *)
(*                                                                         *)
(* Guiding reading of the operator formula:                                *)
(*   approx recurrence / no rollback  =>  always phi                       *)
(*                                                                         *)
(* This is a proposed next-layer artifact, not a replacement for the       *)
(* canonical MFCS or Fusion specifications.                                *)
(***************************************************************************)

CONSTANTS
  MaxDepth,
  FusionThreshold,
  AllowedPhaseOrder,
  Guardians,
  Paths

VARIABLES
  phase,
  history,
  guardian,
  path,
  phi_ok,
  rollback,
  cycleDepth

Phases == {"Define", "Generate", "Choose", "Act", "Reset", "Hardstop"}

TypeOK ==
  /\ phase \in Phases
  /\ history \in Seq(Phases)
  /\ guardian \in Guardians
  /\ path \in Paths
  /\ phi_ok \in BOOLEAN
  /\ rollback \in BOOLEAN
  /\ cycleDepth \in Nat

Init ==
  /\ phase = "Define"
  /\ history = <<"Define">>
  /\ guardian \in Guardians
  /\ path \in Paths
  /\ phi_ok = TRUE
  /\ rollback = FALSE
  /\ cycleDepth = 0

NextPhase(p) ==
  CASE p = "Define"   -> "Generate"
    [] p = "Generate" -> "Choose"
    [] p = "Choose"   -> "Act"
    [] p = "Act"      -> "Reset"
    [] p = "Reset"    -> "Define"
    [] OTHER           -> "Hardstop"

LegalAdvance ==
  /\ phase # "Hardstop"
  /\ phase' = NextPhase(phase)
  /\ history' = Append(history, phase')
  /\ guardian' \in Guardians
  /\ path' \in Paths
  /\ rollback' = FALSE
  /\ cycleDepth' = IF phase = "Reset" THEN cycleDepth + 1 ELSE cycleDepth
  /\ phi_ok' = phi_ok

Hardstop ==
  /\ phase' = "Hardstop"
  /\ history' = Append(history, "Hardstop")
  /\ guardian' = guardian
  /\ path' = path
  /\ rollback' = rollback
  /\ cycleDepth' = cycleDepth
  /\ phi_ok' = phi_ok

Stutter ==
  /\ phase = "Hardstop"
  /\ UNCHANGED <<phase, history, guardian, path, rollback, cycleDepth, phi_ok>>

Next == LegalAdvance \/ Hardstop \/ Stutter

(***************************************************************************)
(* Proposed bridge predicates                                               *)
(***************************************************************************)

ApproxRecurrence ==
  /\ Len(history) >= 5
  /\ \E i \in 1..Len(history): history[i] = "Define"
  /\ \E j \in 1..Len(history): history[j] = "Reset"

NoRollback == ~rollback

AlwaysPhi == []phi_ok

DepthBound == cycleDepth <= MaxDepth

FusionPersistence == phi_ok

GuardianWitnessed == guardian \in Guardians /\ path \in Paths

BridgeInvariant ==
  /\ TypeOK
  /\ DepthBound
  /\ GuardianWitnessed
  /\ FusionPersistence

(***************************************************************************)
(* Temporal design claim                                                    *)
(***************************************************************************)

NoRollbackImpliesAlwaysPhi ==
  []((ApproxRecurrence /\ NoRollback) => phi_ok)

Spec == Init /\ [][Next]_<<phase, history, guardian, path, phi_ok, rollback, cycleDepth>>

THEOREM BridgeGoal ==
  Spec => NoRollbackImpliesAlwaysPhi

=============================================================================
