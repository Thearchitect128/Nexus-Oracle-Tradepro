import { describe, expect, it } from "vitest";
import { allocate } from "../src/solver/allocate";

describe("allocate", () => {
  it("is deterministic for identical inputs", () => {
    const req = {
      items: [
        { id: "i2", risk: 0.9, requiredTags: ["secure"] },
        { id: "i1", risk: 0.2 },
      ],
      nodes: [
        { id: "n2", capacity: 1, used: 0, tags: ["secure"] },
        { id: "n1", capacity: 1, used: 0 },
      ],
    };

    const a = allocate(req);
    const b = allocate(req);

    expect(a).toEqual(b);
  });
});
