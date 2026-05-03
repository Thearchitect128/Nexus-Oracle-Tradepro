----------------------------- MODULE EnvelopeLaws -----------------------------
EXTENDS Naturals, Sequences

CONSTANTS
    MaxDepth,
    AllowedInputs

VARIABLES state

(*
Envelope laws define the admissible region of system evolution.
They are not dynamics — they are constraints.
*)

DepthBound ==
    Len(state) <= MaxDepth

InputBound ==
    \A i \in DOMAIN state:
        state[i] \in AllowedInputs

Envelope ==
    DepthBound /\ InputBound

=============================================================================