# Operator Console

The operator console is the human-facing surface for MFCS-OMEGA. It should make
the current oracle evaluation readable without requiring the operator to inspect
raw source files or trace dumps.

## Console Layout

### Workbench Panel

Shows the current envelope inputs and the derived report:

- active facet
- support gap
- kink proximity
- phi-attractor state
- law-compliance flags

### Mirror Panel

Loads the latest Digital Mirror payload:

- mirror version
- invariants
- last trace summary
- peaks
- oracle state

### Repository Panel

Links the browser surface back to the underlying source of truth:

- architecture overview
- operator guide
- oracle overview
- phi-A law

## Operating Rule

If the operator cannot explain the current state from the console alone, the
console is under-specified and should be expanded before more automation is
added.
