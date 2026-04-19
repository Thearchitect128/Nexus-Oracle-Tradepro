----------------------------- MODULE MFCS -----------------------------
EXTENDS Naturals, Sequences, TLC

CONSTANTS
    Inputs,
    Outputs

VARIABLES
    state,
    input,
    output

Init ==
    /\ state = [ ]
    /\ input \in Inputs
    /\ output \in Outputs

Next ==
    \E i \in Inputs:
        /\ input' = i
        /\ state' = Append(state, i)
        /\ output' \in Outputs

Spec == Init /\ [][Next]_<<state, input, output>>

=============================================================================
