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

describe("assignment engine edge cases", () => {
  it("returns empty array when items list is empty", () => {
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 2, maxRisk: 10 }];
    expect(constrainedBatchAssign([], nodes, "balanced")).toEqual([]);
  });

  it("returns empty array when nodes list is empty", () => {
    const items: WorkItem[] = [{ id: "i1", risk: 1, priority: 2, confidence: 0.5 }];
    expect(constrainedBatchAssign(items, [], "balanced")).toEqual([]);
  });

  it("skips items whose risk exceeds all node maxRisk values", () => {
    const items: WorkItem[] = [
      { id: "risky", risk: 9, priority: 1, confidence: 0.5 },
      { id: "safe", risk: 2, priority: 1, confidence: 0.5 }
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 2, maxRisk: 5 }];

    const assignments = constrainedBatchAssign(items, nodes, "balanced");

    expect(assignments).toHaveLength(1);
    expect(assignments[0].itemId).toBe("safe");
    expect(assignments[0].nodeId).toBe("n1");
  });

  it("respects node capacity and does not over-assign", () => {
    const items: WorkItem[] = [
      { id: "i1", risk: 1, priority: 2, confidence: 0.5 },
      { id: "i2", risk: 1, priority: 2, confidence: 0.5 },
      { id: "i3", risk: 1, priority: 2, confidence: 0.5 }
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 2, maxRisk: 10 }];

    const assignments = constrainedBatchAssign(items, nodes, "balanced");

    expect(assignments).toHaveLength(2);
    expect(assignments.every((a) => a.nodeId === "n1")).toBe(true);
  });

  it("assigns items across multiple nodes respecting individual capacities", () => {
    const items: WorkItem[] = [
      { id: "i1", risk: 1, priority: 1, confidence: 0.5 },
      { id: "i2", risk: 1, priority: 1, confidence: 0.5 },
      { id: "i3", risk: 1, priority: 1, confidence: 0.5 }
    ];
    const nodes: NodeCapacity[] = [
      { nodeId: "n1", capacity: 1, maxRisk: 10 },
      { nodeId: "n2", capacity: 1, maxRisk: 10 },
      { nodeId: "n3", capacity: 1, maxRisk: 10 }
    ];

    const assignments = constrainedBatchAssign(items, nodes, "balanced");

    expect(assignments).toHaveLength(3);
    const assignedNodes = assignments.map((a) => a.nodeId);
    expect(new Set(assignedNodes).size).toBe(3);
  });
});

describe("assignment engine policy scoring", () => {
  it("priority_first policy prefers high-priority items", () => {
    const items: WorkItem[] = [
      { id: "low-priority", risk: 0, priority: 1, confidence: 0.5 },
      { id: "high-priority", risk: 0, priority: 5, confidence: 0.5 }
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 1, maxRisk: 10 }];

    const assignments = constrainedBatchAssign(items, nodes, "priority_first");

    expect(assignments).toHaveLength(1);
    expect(assignments[0].itemId).toBe("high-priority");
  });

  it("balanced policy uses combined priority, confidence, and risk scoring", () => {
    // score = priority + confidence - risk
    // item-a: 3 + 0.5 - 1 = 2.5
    // item-b: 1 + 0.9 - 0.1 = 1.8
    const items: WorkItem[] = [
      { id: "item-a", risk: 1, priority: 3, confidence: 0.5 },
      { id: "item-b", risk: 0.1, priority: 1, confidence: 0.9 }
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 1, maxRisk: 10 }];

    const assignments = constrainedBatchAssign(items, nodes, "balanced");

    expect(assignments).toHaveLength(1);
    expect(assignments[0].itemId).toBe("item-a");
  });

  it("risk_limited policy skips items that exceed node maxRisk", () => {
    const items: WorkItem[] = [{ id: "too-risky", risk: 10, priority: 5, confidence: 0.9 }];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 3, maxRisk: 5 }];

    const assignments = constrainedBatchAssign(items, nodes, "risk_limited");

    expect(assignments).toHaveLength(0);
  });

  it("does not mutate the original items or nodes arrays", () => {
    const items: WorkItem[] = [
      { id: "i1", risk: 1, priority: 2, confidence: 0.5 }
    ];
    const nodes: NodeCapacity[] = [{ nodeId: "n1", capacity: 1, maxRisk: 10 }];

    const originalItemsJson = JSON.stringify(items);
    const originalNodesJson = JSON.stringify(nodes);

    constrainedBatchAssign(items, nodes, "balanced");

    expect(JSON.stringify(items)).toBe(originalItemsJson);
    expect(JSON.stringify(nodes)).toBe(originalNodesJson);
  });
});