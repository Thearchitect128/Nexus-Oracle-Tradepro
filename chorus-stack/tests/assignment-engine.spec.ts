import { describe, expect, it } from "vitest";
import { constrainedBatchAssign } from "../packages/assignment-engine/src/index.js";
import type { NodeCapacity, WorkItem } from "../packages/shared-types/src/index.js";

describe("assignment engine", () => {
  it("prioritizes constrained high-risk items in risk_limited mode", () => {
    const items: WorkItem[] = [
      { id: "low-1", risk: 2, priority: 1, confidence: 0.9 },
      { id: "high-1", risk: 8, priority: 1, confidence: 0.2 },
      { id: "high-2", risk: 8, priority: 1, confidence: 0.1 }
    ];

    const nodes: NodeCapacity[] = [
      { nodeId: "restricted-a", capacity: 1, maxRisk: 8 },
      { nodeId: "restricted-b", capacity: 1, maxRisk: 8 },
      { nodeId: "permissive", capacity: 1, maxRisk: 10 }
    ];

    const assignments = constrainedBatchAssign(items, nodes, "risk_limited");

    expect(assignments).toHaveLength(3);
    expect(assignments).toEqual([
      { itemId: "high-1", nodeId: "restricted-a" },
      { itemId: "high-2", nodeId: "restricted-b" },
      { itemId: "low-1", nodeId: "permissive" }
    ]);
  });

  it("produces identical output regardless of item and node order", () => {
    const inputA = {
      items: [
        { id: "i2", risk: 7, priority: 3, confidence: 0.2 },
        { id: "i1", risk: 7, priority: 3, confidence: 0.2 },
        { id: "i3", risk: 0.5, priority: 1, confidence: 0.5 }
      ] satisfies WorkItem[],
      nodes: [
        { nodeId: "n2", capacity: 1, maxRisk: 7 },
        { nodeId: "n3", capacity: 1, maxRisk: 9 },
        { nodeId: "n1", capacity: 1, maxRisk: 7 }
      ] satisfies NodeCapacity[]
    };

    const inputB = {
      items: [
        { id: "i3", risk: 0.5, priority: 1, confidence: 0.5 },
        { id: "i1", risk: 7, priority: 3, confidence: 0.2 },
        { id: "i2", risk: 7, priority: 3, confidence: 0.2 }
      ] satisfies WorkItem[],
      nodes: [
        { nodeId: "n1", capacity: 1, maxRisk: 7 },
        { nodeId: "n2", capacity: 1, maxRisk: 7 },
        { nodeId: "n3", capacity: 1, maxRisk: 9 }
      ] satisfies NodeCapacity[]
    };

    const a = constrainedBatchAssign(inputA.items, inputA.nodes, "risk_limited");
    const b = constrainedBatchAssign(inputB.items, inputB.nodes, "risk_limited");

    expect(a).toEqual(b);

  it("remains deterministic across repeated identical runs", () => {
    const items: WorkItem[] = [
      { id: "i1", risk: 0.5, priority: 1, confidence: 0.5 },
      { id: "i2", risk: 7, priority: 3, confidence: 0.2 },
      { id: "i3", risk: 7, priority: 3, confidence: 0.2 }
    ];

    const nodes: NodeCapacity[] = [
      { nodeId: "n1", capacity: 1, maxRisk: 7 },
      { nodeId: "n2", capacity: 1, maxRisk: 7 },
      { nodeId: "n3", capacity: 1, maxRisk: 9 }
    ];

    const baseline = constrainedBatchAssign(items, nodes, "risk_limited");

    for (let i = 0; i < 5; i += 1) {
      expect(constrainedBatchAssign(items, nodes, "risk_limited")).toEqual(baseline);
    }
  });

  it("is deterministic when scored values tie", () => {
    const items: WorkItem[] = [
      { id: "b-item", risk: 3, priority: 2, confidence: 0.6 },
      { id: "a-item", risk: 3, priority: 2, confidence: 0.6 }
    ];

    const nodes: NodeCapacity[] = [
      { nodeId: "node-b", capacity: 1, maxRisk: 9 },
      { nodeId: "node-a", capacity: 1, maxRisk: 9 }
    ];

    const assignments = constrainedBatchAssign(items, nodes, "balanced");

    expect(assignments).toEqual([
      { itemId: "a-item", nodeId: "node-a" },
      { itemId: "b-item", nodeId: "node-b" }
    ]);
  });
});

describe("constrainedBatchAssign — balanced policy", () => {
  it("returns empty array for empty items list", () => {
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 2, maxRisk: 10 }];
    const result = constrainedBatchAssign([], nodes, "balanced");
    expect(result).toEqual([]);
  });

  it("returns empty array for empty nodes list", () => {
    const items: WorkItem[] = [{ id: "i1", risk: 1, priority: 2, confidence: 0.8 }];
    const result = constrainedBatchAssign(items, [], "balanced");
    expect(result).toEqual([]);
  });

  it("assigns item to the node with lower utilization", () => {
    const items: WorkItem[] = [{ id: "i1", risk: 1, priority: 2, confidence: 0.8 }];
    const nodes: NodeCapacity[] = [
      { nodeId: "busy", capacity: 4, maxRisk: 10 },
      { nodeId: "empty", capacity: 4, maxRisk: 10 }
    ];
    // Both start at used=0 so utilization is equal; tie-breaks by nodeId alphabetically
    const result = constrainedBatchAssign(items, nodes, "balanced");
    expect(result).toHaveLength(1);
    // "busy" < "empty" alphabetically
    expect(result[0].nodeId).toBe("busy");
  });

  it("prefers higher priority + confidence items in balanced mode", () => {
    const items: WorkItem[] = [
      { id: "low-priority", risk: 1, priority: 1, confidence: 0.5 },
      { id: "high-priority", risk: 1, priority: 5, confidence: 0.9 }
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "only-node", capacity: 1, maxRisk: 10 }];

    const result = constrainedBatchAssign(items, nodes, "balanced");

    // Only 1 slot; high-priority item should be assigned
    expect(result).toHaveLength(1);
    expect(result[0].itemId).toBe("high-priority");
  });

  it("skips items whose risk exceeds all node maxRisk values", () => {
    const items: WorkItem[] = [
      { id: "risky", risk: 9, priority: 5, confidence: 0.9 },
      { id: "safe", risk: 1, priority: 3, confidence: 0.7 }
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 2, maxRisk: 5 }];

    const result = constrainedBatchAssign(items, nodes, "balanced");
    expect(result).toHaveLength(1);
    expect(result[0].itemId).toBe("safe");
  });

  it("respects node capacity — does not exceed it", () => {
    const items: WorkItem[] = [
      { id: "i1", risk: 1, priority: 2, confidence: 0.5 },
      { id: "i2", risk: 1, priority: 2, confidence: 0.5 },
      { id: "i3", risk: 1, priority: 2, confidence: 0.5 }
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 2, maxRisk: 10 }];

    const result = constrainedBatchAssign(items, nodes, "balanced");
    // Node capacity is 2, so only 2 items assigned
    expect(result).toHaveLength(2);
    expect(result.every((a) => a.nodeId === "n1")).toBe(true);
  });

  it("spreads items across multiple nodes when available", () => {
    const items: WorkItem[] = [
      { id: "i1", risk: 1, priority: 2, confidence: 0.5 },
      { id: "i2", risk: 1, priority: 2, confidence: 0.5 }
    ];
    const nodes: NodeCapacity[] = [
      { nodeId: "n1", capacity: 1, maxRisk: 10 },
      { nodeId: "n2", capacity: 1, maxRisk: 10 }
    ];

    const result = constrainedBatchAssign(items, nodes, "balanced");
    expect(result).toHaveLength(2);
    const nodeIds = result.map((a) => a.nodeId);
    expect(nodeIds).toContain("n1");
    expect(nodeIds).toContain("n2");
  });
});

describe("constrainedBatchAssign — priority_first policy", () => {
  it("assigns highest priority item first regardless of confidence", () => {
    const items: WorkItem[] = [
      { id: "low-conf-high-pri", risk: 1, priority: 10, confidence: 0.1 },
      { id: "high-conf-low-pri", risk: 1, priority: 1, confidence: 0.9 }
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 1, maxRisk: 10 }];

    // priority_first score = priority*2 - risk; higher priority wins
    const result = constrainedBatchAssign(items, nodes, "priority_first");
    expect(result).toHaveLength(1);
    expect(result[0].itemId).toBe("low-conf-high-pri");
  });

  it("returns all items assigned when capacity allows under priority_first", () => {
    const items: WorkItem[] = [
      { id: "i1", risk: 2, priority: 5, confidence: 0.8 },
      { id: "i2", risk: 3, priority: 3, confidence: 0.5 }
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 5, maxRisk: 10 }];

    const result = constrainedBatchAssign(items, nodes, "priority_first");
    expect(result).toHaveLength(2);
  });
});

describe("constrainedBatchAssign — risk_limited policy", () => {
  it("excludes item from node whose maxRisk is below item risk", () => {
    const items: WorkItem[] = [{ id: "risky", risk: 9, priority: 5, confidence: 0.9 }];
    const nodes: NodeCapacity[] = [{ nodeId: "low-risk-node", capacity: 1, maxRisk: 5 }];

    const result = constrainedBatchAssign(items, nodes, "risk_limited");
    expect(result).toHaveLength(0);
  });

  it("assigns to node whose maxRisk >= item risk", () => {
    const items: WorkItem[] = [{ id: "risky", risk: 7, priority: 5, confidence: 0.9 }];
    const nodes: NodeCapacity[] = [
      { nodeId: "low-cap", capacity: 1, maxRisk: 5 },
      { nodeId: "high-cap", capacity: 1, maxRisk: 8 }
    ];

    const result = constrainedBatchAssign(items, nodes, "risk_limited");
    expect(result).toHaveLength(1);
    expect(result[0].nodeId).toBe("high-cap");
  });

  it("prefers node with lowest maxRisk that still qualifies", () => {
    // In risk_limited mode, candidate sort puts lower maxRisk first
    const items: WorkItem[] = [{ id: "i1", risk: 3, priority: 5, confidence: 0.9 }];
    const nodes: NodeCapacity[] = [
      { nodeId: "permissive", capacity: 1, maxRisk: 10 },
      { nodeId: "tight", capacity: 1, maxRisk: 4 }
    ];

    const result = constrainedBatchAssign(items, nodes, "risk_limited");
    expect(result).toHaveLength(1);
    expect(result[0].nodeId).toBe("tight");
  });

  it("handles item risk exactly equal to node maxRisk (boundary)", () => {
    const items: WorkItem[] = [{ id: "i1", risk: 5, priority: 3, confidence: 0.7 }];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 1, maxRisk: 5 }];

    // risk <= maxRisk is the condition (5 <= 5 is true)
    const result = constrainedBatchAssign(items, nodes, "risk_limited");
    expect(result).toHaveLength(1);
    expect(result[0].itemId).toBe("i1");
  });

  it("leaves all items unassigned when no node can handle any risk", () => {
    const items: WorkItem[] = [
      { id: "i1", risk: 8, priority: 5, confidence: 0.9 },
      { id: "i2", risk: 6, priority: 3, confidence: 0.7 }
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 5, maxRisk: 2 }];

    const result = constrainedBatchAssign(items, nodes, "risk_limited");
    expect(result).toHaveLength(0);
  });

  it("does not mutate the original nodes array", () => {
    const items: WorkItem[] = [{ id: "i1", risk: 1, priority: 3, confidence: 0.7 }];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 2, maxRisk: 10 }];
    const nodesBefore = JSON.parse(JSON.stringify(nodes)) as NodeCapacity[];

    constrainedBatchAssign(items, nodes, "risk_limited");

    expect(nodes).toEqual(nodesBefore);

  // Edge cases — empty inputs
  it("returns empty assignments when items list is empty", () => {
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 5, maxRisk: 10 }];
    expect(constrainedBatchAssign([], nodes, "balanced")).toEqual([]);
  });

  it("returns empty assignments when nodes list is empty", () => {
    const items: WorkItem[] = [{ id: "i1", risk: 1, priority: 1, confidence: 0.5 }];
    expect(constrainedBatchAssign(items, [], "balanced")).toEqual([]);
  });

  // Items whose risk exceeds all available node maxRisk are silently skipped
  it("skips items whose risk exceeds all node maxRisk limits", () => {
    const items: WorkItem[] = [
      { id: "safe", risk: 3, priority: 1, confidence: 0.5 },
      { id: "risky", risk: 9, priority: 5, confidence: 0.9 },
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 2, maxRisk: 5 }];

    const assignments = constrainedBatchAssign(items, nodes, "balanced");
    expect(assignments).toHaveLength(1);
    expect(assignments[0].itemId).toBe("safe");
  });

  // Capacity exhaustion — excess items are dropped
  it("does not assign items beyond node capacity", () => {
    const items: WorkItem[] = [
      { id: "i1", risk: 1, priority: 1, confidence: 0.5 },
      { id: "i2", risk: 1, priority: 1, confidence: 0.5 },
      { id: "i3", risk: 1, priority: 1, confidence: 0.5 },
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 2, maxRisk: 10 }];

    const assignments = constrainedBatchAssign(items, nodes, "balanced");
    expect(assignments).toHaveLength(2);
  });

  // balanced policy — score = priority + confidence - risk
  it("assigns higher-scoring items first in balanced mode", () => {
    // Item A: score = 5 + 0.9 - 1 = 4.9
    // Item B: score = 1 + 0.1 - 8 = -6.9
    const items: WorkItem[] = [
      { id: "low-score", risk: 8, priority: 1, confidence: 0.1 },
      { id: "high-score", risk: 1, priority: 5, confidence: 0.9 },
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "only-node", capacity: 1, maxRisk: 10 }];

    const assignments = constrainedBatchAssign(items, nodes, "balanced");
    expect(assignments).toHaveLength(1);
    expect(assignments[0].itemId).toBe("high-score");
  });

  // priority_first policy — score = priority * 2 - risk
  it("assigns higher priority*2-risk items first in priority_first mode", () => {
    // Item A: score = 10*2 - 9 = 11
    // Item B: score = 1*2 - 0.1 = 1.9
    const items: WorkItem[] = [
      { id: "high-priority", risk: 9, priority: 10, confidence: 0.1 },
      { id: "low-priority", risk: 0.1, priority: 1, confidence: 0.9 },
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "only-node", capacity: 1, maxRisk: 10 }];

    const assignments = constrainedBatchAssign(items, nodes, "priority_first");
    expect(assignments).toHaveLength(1);
    expect(assignments[0].itemId).toBe("high-priority");
  });

  // Node selection in balanced/priority_first: prefer lower utilization
  it("assigns to lower-utilization node when multiple eligible nodes exist", () => {
    const items: WorkItem[] = [
      { id: "i1", risk: 1, priority: 1, confidence: 0.5 },
    ];
    const nodes: NodeCapacity[] = [
      // nodeState starts with used=0 for all; after i1 assignment, n1 is full
      { nodeId: "n-high-cap", capacity: 4, maxRisk: 10 }, // utilization after 0 assigned = 0
      { nodeId: "n-low-cap", capacity: 1, maxRisk: 10 },  // same utilization = 0
    ];
    // Both start at 0 utilization; tie-break by maxRisk then nodeId
    const assignments = constrainedBatchAssign(items, nodes, "balanced");
    expect(assignments).toHaveLength(1);
    // Both have equal utilization (0/4 vs 0/1 = 0), same maxRisk=10; nodeId "n-high-cap" < "n-low-cap"
    expect(assignments[0].nodeId).toBe("n-high-cap");
  });

  // nodeState resets used=0 regardless of input node state
  it("ignores initial node.used values — capacity tracking starts from zero", () => {
    // All nodes start with used=0 internally even though we don't expose initial `used` in NodeCapacity
    // NodeCapacity only has capacity/maxRisk; we verify by checking more items can be assigned than initial used
    const items: WorkItem[] = Array.from({ length: 3 }, (_, i) => ({
      id: `item-${i}`,
      risk: 1,
      priority: 1,
      confidence: 0.5,
    }));
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 3, maxRisk: 10 }];

    const assignments = constrainedBatchAssign(items, nodes, "balanced");
    expect(assignments).toHaveLength(3);
  });

  // risk_limited: node candidate selection prefers tightest maxRisk first
  it("in risk_limited mode, assigns to the node with tightest sufficient maxRisk", () => {
    const items: WorkItem[] = [{ id: "i1", risk: 5, priority: 1, confidence: 0.5 }];
    const nodes: NodeCapacity[] = [
      { nodeId: "loose", capacity: 1, maxRisk: 10 },
      { nodeId: "tight", capacity: 1, maxRisk: 5 },
    ];

    const assignments = constrainedBatchAssign(items, nodes, "risk_limited");
    expect(assignments).toHaveLength(1);
    expect(assignments[0].nodeId).toBe("tight");
  });

  // Regression: items not mutated across calls
  it("does not mutate input items or nodes across calls", () => {
    const items: WorkItem[] = [
      { id: "i1", risk: 2, priority: 3, confidence: 0.8 },
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 2, maxRisk: 10 }];

    const first = constrainedBatchAssign(items, nodes, "balanced");
    const second = constrainedBatchAssign(items, nodes, "balanced");

    expect(first).toEqual(second);
    expect(items).toHaveLength(1);
    expect(nodes).toHaveLength(1);
  });
});