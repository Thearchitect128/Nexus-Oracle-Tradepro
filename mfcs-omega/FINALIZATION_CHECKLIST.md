# Finalization Checklist

## Immediate
- [ ] Add `spec/SystemConsistency.tla`
- [ ] Add a proof-page badge for `SystemConsistency`
- [ ] Add a mirror field for cross-layer consistency
- [ ] Map repo states into the abstract sets:
  - [ ] `SpecStates`
  - [ ] `GovernanceStates`
  - [ ] `ArtifactStates`
  - [ ] `SandboxStates`

## Bindings
- [ ] Replace `SpecInvariant` with the project's formal invariant summary
- [ ] Replace `GovernanceAllowed` with IGM admission logic
- [ ] Replace `ArtifactConsistent` with document / mirror consistency checks
- [ ] Replace `ViolatesCore` with sandbox isolation logic

## Verification
- [ ] Create a small TLC model
- [ ] Confirm `TypeOK`
- [ ] Confirm `SystemConsistency`
- [ ] Confirm no contradiction state is reachable

## Surface
- [ ] Proof page: show PASS/FAIL
- [ ] Operator console: show consistency badge
- [ ] Digital Mirror: include consistency status and timestamp

## Seal
- [ ] Record result in release notes
- [ ] Freeze the consistency mapping
- [ ] Treat changes to it as governance events
