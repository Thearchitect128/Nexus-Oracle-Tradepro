# Spatial Lattice

The spatial layer translates kernel results into surfaces an operator can read
at a glance. It is less about geometric ornament and more about making support
structure, drift, and attractor state visible.

## Primary Surfaces

- Facet surface: highlights the currently active facet and its label.
- Envelope surface: shows whether the state is inside the admissible region.
- Support surface: exposes `supportGap` and the current `M_min`.
- Kink surface: reports the distance between `C_r` and the kink threshold.
- Attractor surface: indicates when the state is inside `G_phi`.

## Rendering Contract

Any UI built on the spatial layer should preserve the following fields:

- active facet
- facet label
- inside/outside envelope state
- margin and support gap
- kink proximity
- attractor and law-compliance badges

The static browser workbench in `index.html` is the current lightweight
reference implementation for this contract.
