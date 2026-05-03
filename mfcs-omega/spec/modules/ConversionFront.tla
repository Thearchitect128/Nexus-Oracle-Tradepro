---------------------------- MODULE ConversionFront ----------------------------
EXTENDS Integers, Naturals, Reals, TLC

(***************************************************************************)
(* Law φ-A: Near-Recursion Attractor Property                              *)
(***************************************************************************)

CONSTANTS Epsilon, MaxN

VARIABLES state, vars, mode, phi, r, e, t

(*
  NOTE: f^n(x), State, and EnvelopeLaws!InEnvelope are intentionally left as
  model-level definitions/hooks to be bound by the surrounding spec.
*)

Distance(x, y) ==
  ABS(x.phi - y.phi) + ABS(x.r - y.r) + ABS(x.e - y.e) + ABS(x.s - y.s)

NearRecursion(x) ==
  \E n \in 1..MaxN : Distance(f[n](x), x) <= Epsilon

Irreversible ==
  \A y \in State :
    y.mode = mode /\ y.phi = phi /\ y.r = r /\ y.e = e
    => y = [state EXCEPT !.t = t - 1]

InG_Phi(x) ==
  /\ x.facet \in {"Facet-A", "Facet-C"}
  /\ EnvelopeLaws!InEnvelope(x)

PhiAttractorProperty ==
  [][NearRecursion(state) /\ Irreversible => <>InG_Phi(state)]_vars

=============================================================================
