----------------------------- MODULE envelope-laws -----------------------------
EXTENDS Naturals, Sequences

VARIABLES state

EnvelopeLaw1 ==
    /\ Len(state) <= MaxDepth

EnvelopeLaw2 ==
    /\ \A i \in DOMAIN state:
        state[i] \in AllowedInputs

=============================================================================
