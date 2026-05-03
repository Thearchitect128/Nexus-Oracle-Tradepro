import { describe, expect, it } from "vitest";
import { generateAllVectors } from "../src/matrix/generator";
import { buildUnifiedState, mapToVisual, toFrontierEntry } from "../src/matrix/visual";

describe("visual binding", () => {
  it("maps frontier + selected deterministically", () => {
    const frontier = generateAllVectors().slice(0, 5).map(toFrontierEntry);

    const first = mapToVisual(frontier, frontier[2]);
    const second = mapToVisual(frontier, frontier[2]);

    expect(first).toEqual(second);
  });

  it("enforces cardinality lock at 36 vectors", () => {
    const frontier = generateAllVectors();
    expect(frontier.length).toBe(36);
  });

  it("builds hash-locked unified output", () => {
    const frontier = generateAllVectors();
    const state = buildUnifiedState(frontier, frontier[0]);

    expect(state.visual.background).toBe("void");
    expect(state.hashes.canonical).toHaveLength(64);
    expect(state.hashes.visual).toHaveLength(64);
    expect(state.visual.eyeIntensity).toBe(state.canonical.selected.metrics.safety);
  });
});
