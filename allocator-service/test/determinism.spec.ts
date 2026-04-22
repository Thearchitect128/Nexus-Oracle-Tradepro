import { describe, expect, it } from "vitest";
import { allocate } from "../src/solver/allocate";

describe("determinism", () => {
  it("produces stable hash regardless of item/node order", () => {
    const a = allocate({
      items: [
        { id: "i2", risk: 0.4, requiredTags: ["b", "a"] },
        { id: "i1", risk: 0.5 },
      ],
      nodes: [
        { id: "n2", capacity: 1, used: 0, tags: ["a", "b"] },
        { id: "n1", capacity: 1, used: 0 },
      ],
    });

    const b = allocate({
      items: [
        { id: "i1", risk: 0.5 },
        { id: "i2", risk: 0.4, requiredTags: ["a", "b"] },
      ],
      nodes: [
        { id: "n1", capacity: 1, used: 0 },
        { id: "n2", capacity: 1, used: 0, tags: ["b", "a"] },
      ],
    });

    expect(a.requestHash).toBe(b.requestHash);
    expect(a.assignments).toEqual(b.assignments);
  });
});
