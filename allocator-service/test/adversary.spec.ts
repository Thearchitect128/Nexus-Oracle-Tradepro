import { describe, expect, it } from "vitest";
import { allocate } from "../src/solver/allocate";

describe("adversary", () => {
  it("leaves items unassigned when constraints are infeasible", () => {
    const result = allocate({
      items: [{ id: "i1", risk: 0.8, requiredTags: ["secure"] }],
      nodes: [{ id: "n1", capacity: 1, used: 0, tags: ["public"] }],
    });

    expect(result.flow).toBe(0);
    expect(result.assignments).toEqual({});
  });
});
