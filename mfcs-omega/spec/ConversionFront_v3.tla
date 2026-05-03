--------------------------- MODULE ConversionFront_v3 ---------------------------
EXTENDS Integers, TLC

(***************************************************************************
 v0.3.0 3-resource conversion-front model.

 The model intentionally encourages three extremal regions:
   * Early phi-dominant phase
   * Mid conversion r-dominant phase
   * Late conversion s-dominant phase
***************************************************************************)

CONSTANTS MaxStep

VARIABLES t, phi, r, s, e

Vars == <<t, phi, r, s, e>>

Init ==
  /\ t = 0
  /\ phi = 10
  /\ r = 0
  /\ s = 0
  /\ e = 90

PhaseA ==
  /\ t < 4
  /\ t' = t + 1
  /\ phi' = phi - 1
  /\ r' = r + 2
  /\ s' = s + 1
  /\ e' = e - 4

PhaseB ==
  /\ t >= 4 /\ t < 8
  /\ t' = t + 1
  /\ phi' = phi - 2
  /\ r' = r + 1
  /\ s' = s + 2
  /\ e' = e - 3

PhaseC ==
  /\ t >= 8 /\ t < MaxStep
  /\ t' = t + 1
  /\ phi' = IF phi > 0 THEN phi - 1 ELSE 0
  /\ r' = IF r > 0 THEN r - 1 ELSE 0
  /\ s' = s + 3
  /\ e' = e - 2

Next == PhaseA \/ PhaseB \/ PhaseC

TypeOK ==
  /\ t \in Nat
  /\ phi \in Int
  /\ r \in Int
  /\ s \in Int
  /\ e \in Int

Spec == Init /\ [][Next]_Vars /\ WF_Vars(Next)

Termination == t = MaxStep

=============================================================================
