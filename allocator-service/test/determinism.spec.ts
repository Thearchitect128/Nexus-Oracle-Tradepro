import { describe, expect, it } from "vitest";
import { allocate } from "../src/solver/allocate";

describe("determinism", () => {
  it("produces identical output regardless of item/node/tag order", () => {
    const inputA = {
      items: [
        { id: "i2", risk: 0.4, requiredTags: ["b", "a"] },
        { id: "i1", risk: 0.5 },
      ],
      nodes: [
        { id: "n2", capacity: 1, used: 0, tags: ["a", "b"] },
        { id: "n1", capacity: 1, used: 0 },
      ],
    };

    const inputB = {
      items: [
        { id: "i1", risk: 0.5 },
        { id: "i2", risk: 0.4, requiredTags: ["a", "b"] },
      ],
      nodes: [
        { id: "n1", capacity: 1, used: 0 },
        { id: "n2", capacity: 1, used: 0, tags: ["b", "a"] },
      ],
    };

    const a = allocate(inputA);
    const b = allocate(inputB);

    expect(a.requestHash).toBe(b.requestHash);
    expect(a.assignments).toEqual(b.assignments);
    expect(a.flow).toBe(b.flow);
    expect(a.cost).toBe(b.cost);
    expect(a.deterministic).toBe(true);
    expect(b.deterministic).toBe(true);
    expect(a).toEqual(b);
  });
});