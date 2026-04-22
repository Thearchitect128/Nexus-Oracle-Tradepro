import { describe, expect, it } from "vitest";
import { canAssign, edgeCost, finiteEdgeCost } from "../packages/assignment-engine/src/domain/cost.js";
import type { Item, Node } from "../packages/assignment-engine/src/domain/types.js";

describe("assignment domain cost", () => {
  it("keeps region mismatch out of canAssign so mismatch remains a penalized fallback", () => {
    const item: Item = { id: "i1", risk: 0.5, region: "us" };
    const sameRegionNode: Node = { id: "n2", capacity: 1, used: 0, region: "us" };
    const otherRegionNode: Node = { id: "n1", capacity: 1, used: 0, region: "eu" };

    expect(canAssign(item, sameRegionNode)).toBe(true);
    expect(canAssign(item, otherRegionNode)).toBe(true);

    expect(edgeCost(item, sameRegionNode)).toBeLessThan(edgeCost(item, otherRegionNode));
  });

  it("prefers same-region nodes but allows penalized fallback when needed", () => {
    const item: Item = { id: "i1", risk: 0.5, region: "us" };
    const sameRegionNode: Node = { id: "n2", capacity: 1, used: 0, region: "us" };
    const otherRegionNode: Node = { id: "n1", capacity: 1, used: 0, region: "eu" };

    expect(edgeCost(item, sameRegionNode)).toBeLessThan(edgeCost(item, otherRegionNode));

    const sameRegionNodeUnavailable: Node = { ...sameRegionNode, used: 1 };
    expect(canAssign(item, sameRegionNodeUnavailable)).toBe(false);
    expect(canAssign(item, otherRegionNode)).toBe(true);
    expect(Number.isFinite(edgeCost(item, otherRegionNode))).toBe(true);
  });
});

describe("canAssign", () => {
  it("returns false when node is at full capacity", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const fullNode: Node = { id: "n1", capacity: 2, used: 2 };
    expect(canAssign(item, fullNode)).toBe(false);
  });

  it("returns false when node used exceeds capacity", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const overflowNode: Node = { id: "n1", capacity: 1, used: 3 };
    expect(canAssign(item, overflowNode)).toBe(false);
  });

  it("returns true when item has no requiredTags", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const node: Node = { id: "n1", capacity: 1, used: 0, tags: ["gpu"] };
    expect(canAssign(item, node)).toBe(true);
  });

  it("returns true when item has an empty requiredTags array", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: [] };
    const node: Node = { id: "n1", capacity: 1, used: 0 };
    expect(canAssign(item, node)).toBe(true);
  });

  it("returns true when all required tags are present on the node", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["secure", "gpu"] };
    const node: Node = { id: "n1", capacity: 1, used: 0, tags: ["secure", "gpu", "extra"] };
    expect(canAssign(item, node)).toBe(true);
  });

  it("returns false when node is missing one required tag", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["secure", "gpu"] };
    const node: Node = { id: "n1", capacity: 1, used: 0, tags: ["secure"] };
    expect(canAssign(item, node)).toBe(false);
  });

  it("returns false when node has no tags but item requires tags", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["secure"] };
    const node: Node = { id: "n1", capacity: 1, used: 0 };
    expect(canAssign(item, node)).toBe(false);
  });

  it("returns true when capacity is 1 and used is 0", () => {
    const item: Item = { id: "i1", risk: 0.2 };
    const node: Node = { id: "n1", capacity: 1, used: 0 };
    expect(canAssign(item, node)).toBe(true);
  });
});

describe("edgeCost", () => {
  it("returns Infinity when node is at capacity", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const fullNode: Node = { id: "n1", capacity: 1, used: 1 };
    expect(edgeCost(item, fullNode)).toBe(Number.POSITIVE_INFINITY);
  });

  it("returns Infinity when required tags are not satisfied", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["secure"] };
    const node: Node = { id: "n1", capacity: 1, used: 0, tags: ["public"] };
    expect(edgeCost(item, node)).toBe(Number.POSITIVE_INFINITY);
  });

  it("higher risk items get lower (more preferred) base cost", () => {
    const highRisk: Item = { id: "i1", risk: 0.9 };
    const lowRisk: Item = { id: "i2", risk: 0.1 };
    const node: Node = { id: "n1", capacity: 2, used: 0 };
    expect(edgeCost(highRisk, node)).toBeLessThan(edgeCost(lowRisk, node));
  });

  it("computes riskPriority as -round(risk * 1000)", () => {
    const item: Item = { id: "i1", risk: 0.8 };
    const node: Node = { id: "n1", capacity: 2, used: 0 };
    // used=0, capacity=2 -> initialLoad=0, loadPenalty=0, latencyPenalty=0, no region
    expect(edgeCost(item, node)).toBe(-800);
  });

  it("adds load penalty proportional to current utilization", () => {
    const item: Item = { id: "i1", risk: 0.0 };
    const halfLoadNode: Node = { id: "n1", capacity: 2, used: 1 };
    // risk=0 -> riskPriority=0; load=0.5 -> loadPenalty=50; no latency or region
    expect(edgeCost(item, halfLoadNode)).toBe(50);
  });

  it("adds latency penalty scaled by load and latency sensitivity", () => {
    const item: Item = { id: "i1", risk: 0.0, latencySensitivity: 1.0 };
    const halfLoadNode: Node = { id: "n1", capacity: 2, used: 1 };
    // riskPriority=0, loadPenalty=50, latencyPenalty=round(1.0*0.5*100)=50
    expect(edgeCost(item, halfLoadNode)).toBe(100);
  });

  it("applies region penalty of 10000 when item and node regions differ", () => {
    const item: Item = { id: "i1", risk: 0.0, region: "us-east-1" };
    const crossRegionNode: Node = { id: "n1", capacity: 1, used: 0, region: "eu-west-1" };
    // riskPriority=0, loadPenalty=0, latencyPenalty=0, regionPenalty=10000
    expect(edgeCost(item, crossRegionNode)).toBe(10000);
  });

  it("applies no region penalty when only item has region set", () => {
    const item: Item = { id: "i1", risk: 0.0, region: "us-east-1" };
    const noRegionNode: Node = { id: "n1", capacity: 1, used: 0 };
    expect(edgeCost(item, noRegionNode)).toBe(0);
  });

  it("applies no region penalty when only node has region set", () => {
    const item: Item = { id: "i1", risk: 0.0 };
    const node: Node = { id: "n1", capacity: 1, used: 0, region: "eu-west-1" };
    expect(edgeCost(item, node)).toBe(0);
  });

  it("treats zero-capacity node as fully loaded", () => {
    // zero-capacity node: used >= capacity (0 >= 0) -> canAssign returns false -> Infinity
    const item: Item = { id: "i1", risk: 0.5 };
    const zeroCapNode: Node = { id: "n1", capacity: 0, used: 0 };
    expect(edgeCost(item, zeroCapNode)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("finiteEdgeCost", () => {
  it("returns null when edge is not assignable", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const fullNode: Node = { id: "n1", capacity: 1, used: 1 };
    expect(finiteEdgeCost(item, fullNode)).toBeNull();
  });

  it("returns null when required tags are missing", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["secure"] };
    const node: Node = { id: "n1", capacity: 1, used: 0 };
    expect(finiteEdgeCost(item, node)).toBeNull();
  });

  it("returns the numeric cost when assignable", () => {
    const item: Item = { id: "i1", risk: 0.8 };
    const node: Node = { id: "n1", capacity: 2, used: 0 };
    expect(finiteEdgeCost(item, node)).toBe(-800);
  });

  it("returns a finite number for cross-region (penalized but assignable)", () => {
    const item: Item = { id: "i1", risk: 0.0, region: "us" };
    const node: Node = { id: "n1", capacity: 1, used: 0, region: "eu" };
    const result = finiteEdgeCost(item, node);
    expect(result).not.toBeNull();
    expect(Number.isFinite(result!)).toBe(true);
  });
});