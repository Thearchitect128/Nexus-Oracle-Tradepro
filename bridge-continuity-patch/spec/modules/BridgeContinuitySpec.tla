----------------------------- MODULE BridgeContinuitySpec -----------------------------
EXTENDS Naturals, Sequences, TLC

(***************************************************************************)
(* Contract: ≈↻ ∧ ¬(↺) ⇒ Gφ                                                  *)
(*                                                                           *)
(* Operationalized as                                                        *)
(* - forward-cycle-established: there exists a forward continuity witness    *)
(* - no-reverse-cycle: no regression edge appears                            *)
(* - global-convergence-to-phi: phi holds for all states in the trace        *)
(***************************************************************************)

CONSTANT Trace

IsForward(step) == step.kind = "forward"
IsReverse(step) == step.kind = "reverse"
Phi(step) == step.phi = TRUE

ForwardCycleEstablished == \E i \in DOMAIN Trace : IsForward(Trace[i])
NoReverseCycle == \A i \in DOMAIN Trace : ~IsReverse(Trace[i])
GlobalConvergenceToPhi == \A i \in DOMAIN Trace : Phi(Trace[i])

BridgeContract == ForwardCycleEstablished /\ NoReverseCycle => GlobalConvergenceToPhi

====
