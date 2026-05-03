------------------------------ MODULE SystemConsistency ------------------------------
EXTENDS Naturals, Sequences, TLC

(*
  SystemConsistency.tla
  Design-level cross-layer contract tying together:
  - formal core
  - governance layer
  - artifact/document layer
  - sandbox / alpha-zero layer

  This module is intentionally lightweight. It is meant to be specialized by
  replacing the abstract state sets and helper predicates with repo-specific ones.
*)

CONSTANTS
  SpecStates,
  GovernanceStates,
  ArtifactStates,
  SandboxStates

VARIABLES
  spec_state,
  governance_state,
  artifact_state,
  sandbox_state

vars == <<spec_state, governance_state, artifact_state, sandbox_state>>

TypeOK ==
  /\ spec_state \in SpecStates
  /\ governance_state \in GovernanceStates
  /\ artifact_state \in ArtifactStates
  /\ sandbox_state \in SandboxStates

(*
  Helper predicates. Replace these with concrete project logic or refinement mappings.
*)
SpecInvariant(s) == s \in SpecStates
GovernanceAllowed(g) == g \in GovernanceStates
ArtifactConsistent(a) == a \in ArtifactStates
SandboxExperiment(z) == z \in SandboxStates

(*
  Placeholder relation saying the sandbox does not mutate the formal core directly.
*)
ViolatesCore(s, z) == FALSE

(*
  Cross-layer contract.
*)
SpecImpliesGovernance ==
  SpecInvariant(spec_state) => GovernanceAllowed(governance_state)

GovernanceImpliesArtifacts ==
  GovernanceAllowed(governance_state) => ArtifactConsistent(artifact_state)

SandboxIsolation ==
  SandboxExperiment(sandbox_state) => ~ViolatesCore(spec_state, sandbox_state)

NoContradiction ==
  ~(
    SpecInvariant(spec_state)
    /\ ~ArtifactConsistent(artifact_state)
  )

SystemConsistency ==
  /\ TypeOK
  /\ SpecImpliesGovernance
  /\ GovernanceImpliesArtifacts
  /\ SandboxIsolation
  /\ NoContradiction

Init ==
  /\ TypeOK
  /\ SystemConsistency

Next ==
  /\ UNCHANGED vars

Spec ==
  Init /\ [][Next]_vars

THEOREM CrossLayerInvariant ==
  Spec => []SystemConsistency

=============================================================================
