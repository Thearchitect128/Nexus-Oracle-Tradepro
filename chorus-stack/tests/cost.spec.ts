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
  it("still allows cross-region assignment when same-region capacity is unavailable", () => {
    const item: Item = { id: "i1", risk: 0.5, region: "us" };
    const sameRegionNodeUnavailable: Node = {
      id: "n2",
      capacity: 1,
      used: 1,
      region: "us"
    };
    const otherRegionNode: Node = { id: "n1", capacity: 1, used: 0, region: "eu" };

    expect(canAssign(item, sameRegionNodeUnavailable)).toBe(false);
    expect(canAssign(item, otherRegionNode)).toBe(true);
    expect(Number.isFinite(edgeCost(item, otherRegionNode))).toBe(true);
  });
});

describe("canAssign", () => {
  it("returns false when node is at capacity", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const node: Node = { id: "n1", capacity: 2, used: 2 };
    expect(canAssign(item, node)).toBe(false);
  });

  it("returns false when node is over capacity", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const node: Node = { id: "n1", capacity: 1, used: 2 };
    expect(canAssign(item, node)).toBe(false);
  });

  it("returns true when node has remaining capacity and no required tags", () => {

  // canAssign — capacity checks
  it("rejects assignment when node is at full capacity (used === capacity)", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const fullNode: Node = { id: "n1", capacity: 3, used: 3 };
    expect(canAssign(item, fullNode)).toBe(false);
  });

  it("rejects assignment when node is over capacity (used > capacity)", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const overNode: Node = { id: "n1", capacity: 2, used: 5 };
    expect(canAssign(item, overNode)).toBe(false);
  });

  it("allows assignment when node has remaining capacity", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const node: Node = { id: "n1", capacity: 2, used: 1 };
    expect(canAssign(item, node)).toBe(true);
  });

  it("returns true when item has no requiredTags (undefined)", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: undefined };
    const node: Node = { id: "n1", capacity: 1, used: 0, tags: [] };
    expect(canAssign(item, node)).toBe(true);
  });

  it("returns true when item has empty requiredTags array", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: [] };
    const node: Node = { id: "n1", capacity: 1, used: 0, tags: [] };
    expect(canAssign(item, node)).toBe(true);
  });

  it("returns true when node has all required tags", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["gpu", "secure"] };
  // canAssign — tag matching
  it("allows assignment when item has no required tags", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const nodeNoTags: Node = { id: "n1", capacity: 1, used: 0 };
    const nodeWithTags: Node = { id: "n2", capacity: 1, used: 0, tags: ["secure"] };
    expect(canAssign(item, nodeNoTags)).toBe(true);
    expect(canAssign(item, nodeWithTags)).toBe(true);
  });

  it("allows assignment when item has empty requiredTags array", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: [] };
    const node: Node = { id: "n1", capacity: 1, used: 0 };
    expect(canAssign(item, node)).toBe(true);
  });

  it("allows assignment when node has all required tags", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["secure", "gpu"] };
    const node: Node = { id: "n1", capacity: 1, used: 0, tags: ["gpu", "secure", "extra"] };
    expect(canAssign(item, node)).toBe(true);
  });

  it("returns false when node is missing a required tag", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["gpu", "secure"] };
    const node: Node = { id: "n1", capacity: 1, used: 0, tags: ["gpu"] };
    expect(canAssign(item, node)).toBe(false);
  });

  it("returns false when node has no tags but item requires some", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["gpu"] };
  it("rejects assignment when node is missing a required tag", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["secure", "gpu"] };
    const nodeMissingGpu: Node = { id: "n1", capacity: 1, used: 0, tags: ["secure"] };
    expect(canAssign(item, nodeMissingGpu)).toBe(false);
  });

  it("rejects assignment when node has no tags but item requires tags", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["secure"] };
    const node: Node = { id: "n1", capacity: 1, used: 0 };
    expect(canAssign(item, node)).toBe(false);
  });

  it("returns false when node is at capacity even if tags match", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["gpu"] };
    const node: Node = { id: "n1", capacity: 1, used: 1, tags: ["gpu"] };
    expect(canAssign(item, node)).toBe(false);
  });

  it("returns false when node has zero capacity (used >= capacity is always true)", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const node: Node = { id: "n1", capacity: 0, used: 0 };
    // used(0) >= capacity(0) is true, so canAssign returns false
    expect(canAssign(item, node)).toBe(false);
  });
});

describe("edgeCost", () => {
  it("returns Infinity when canAssign is false (node at capacity)", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const node: Node = { id: "n1", capacity: 1, used: 1 };
    expect(edgeCost(item, node)).toBe(Number.POSITIVE_INFINITY);
  });

  it("returns Infinity when required tags are not met", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["secure"] };
    const node: Node = { id: "n1", capacity: 1, used: 0, tags: ["public"] };
    expect(edgeCost(item, node)).toBe(Number.POSITIVE_INFINITY);
  });

  it("computes correct cost for zero-load node with no optional fields", () => {
    // risk=0.5 → riskPriority = -Math.round(0.5*1000) = -500
    // load = 0/2 = 0 → loadPenalty = 0, latencyPenalty = 0, regionPenalty = 0
    // total = -500
    const item: Item = { id: "i1", risk: 0.5 };
    const node: Node = { id: "n1", capacity: 2, used: 0 };
    expect(edgeCost(item, node)).toBe(-500);
  });

  it("computes correct cost with partial load", () => {
    // risk=0.8 → riskPriority = -800
    // load = 1/2 = 0.5 → loadPenalty = Math.round(0.5*100) = 50
    // latency=0 → latencyPenalty = 0
    // total = -800 + 50 = -750
    const item: Item = { id: "i1", risk: 0.8 };
    const node: Node = { id: "n1", capacity: 2, used: 1 };
    expect(edgeCost(item, node)).toBe(-750);
  });

  it("applies latency penalty correctly", () => {
    // risk=0.5 → riskPriority = -500
    // load = 1/2 = 0.5 → loadPenalty = 50
    // latencySensitivity=0.8 → latencyPenalty = Math.round(0.8 * 0.5 * 100) = 40
    // total = -500 + 50 + 40 = -410
    const item: Item = { id: "i1", risk: 0.5, latencySensitivity: 0.8 };
    const node: Node = { id: "n1", capacity: 2, used: 1 };
    expect(edgeCost(item, node)).toBe(-410);
  });

  it("applies region penalty of 10000 for mismatched regions", () => {
    const item: Item = { id: "i1", risk: 0.5, region: "us-east-1" };
    const sameRegion: Node = { id: "n1", capacity: 1, used: 0, region: "us-east-1" };
    const diffRegion: Node = { id: "n2", capacity: 1, used: 0, region: "eu-west-1" };
    expect(edgeCost(item, diffRegion) - edgeCost(item, sameRegion)).toBe(10_000);
  });

  it("does not apply region penalty when item has no region", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const node: Node = { id: "n1", capacity: 1, used: 0, region: "eu-west-1" };
    const nodeNoRegion: Node = { id: "n2", capacity: 1, used: 0 };
    // Both should have same cost (no region to mismatch)
    expect(edgeCost(item, node)).toBe(edgeCost(item, nodeNoRegion));
  });

  it("does not apply region penalty when node has no region", () => {
    const item: Item = { id: "i1", risk: 0.5, region: "us-east-1" };
    const nodeNoRegion: Node = { id: "n1", capacity: 1, used: 0 };
    const nodeSameRegion: Node = { id: "n2", capacity: 1, used: 0, region: "us-east-1" };
    expect(edgeCost(item, nodeNoRegion)).toBe(edgeCost(item, nodeSameRegion));
  });

  it("treats zero-capacity node as fully loaded (load = 1)", () => {
    // capacity=0 → initialLoad=1 → loadPenalty=100
    // risk=0.0 → riskPriority=0
    // total = 0 + 100 + 0 + 0 = 100
    // But wait: canAssign returns false for capacity=0 (used>=capacity → 0>=0)
    // So edgeCost returns Infinity for capacity=0
    const item: Item = { id: "i1", risk: 0.0 };
    const node: Node = { id: "n1", capacity: 0, used: 0 };
    expect(edgeCost(item, node)).toBe(Number.POSITIVE_INFINITY);
  });

  it("higher risk items get lower (more preferred) base cost", () => {
    // Higher risk → more negative riskPriority → lower cost → more preferred
    const nodeEmpty: Node = { id: "n1", capacity: 1, used: 0 };
    const lowRiskItem: Item = { id: "i1", risk: 0.1 };
    const highRiskItem: Item = { id: "i2", risk: 0.9 };
    expect(edgeCost(highRiskItem, nodeEmpty)).toBeLessThan(edgeCost(lowRiskItem, nodeEmpty));
  });
});

describe("finiteEdgeCost", () => {
  it("returns the finite cost when assignment is valid", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const node: Node = { id: "n1", capacity: 2, used: 0 };
    expect(finiteEdgeCost(item, node)).toBe(-500);
  });

  it("returns null when node is at capacity (infinite cost)", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const node: Node = { id: "n1", capacity: 1, used: 1 };
    expect(finiteEdgeCost(item, node)).toBeNull();
  });

  it("returns null when required tags are unmet (infinite cost)", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["gpu"] };
    const node: Node = { id: "n1", capacity: 1, used: 0, tags: [] };
    expect(finiteEdgeCost(item, node)).toBeNull();
  });

  it("returns a number type (not null) for eligible pairs", () => {
    const item: Item = { id: "i1", risk: 0.2, latencySensitivity: 0.5 };
    const node: Node = { id: "n1", capacity: 4, used: 2, tags: [], region: "us" };
    const result = finiteEdgeCost(item, node);
    expect(result).not.toBeNull();
    expect(typeof result).toBe("number");
  });
  // edgeCost — formula components
  it("returns POSITIVE_INFINITY for a full-capacity node", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const fullNode: Node = { id: "n1", capacity: 1, used: 1 };
    expect(edgeCost(item, fullNode)).toBe(Number.POSITIVE_INFINITY);
  });

  it("returns POSITIVE_INFINITY when required tag is missing", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["gpu"] };
    const node: Node = { id: "n1", capacity: 1, used: 0, tags: ["cpu"] };
    expect(edgeCost(item, node)).toBe(Number.POSITIVE_INFINITY);
  });

  it("computes riskPriority as negative round(risk * 1000) — higher risk yields lower base cost", () => {
    // Both nodes empty, no tags, no region
    const highRiskItem: Item = { id: "i1", risk: 0.9 };
    const lowRiskItem: Item = { id: "i2", risk: 0.1 };
    const node: Node = { id: "n1", capacity: 1, used: 0 };

    // high risk → riskPriority = -900; low risk → riskPriority = -100
    expect(edgeCost(highRiskItem, node)).toBeLessThan(edgeCost(lowRiskItem, node));
  });

  it("load penalty increases cost when node utilization is higher", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const lowLoadNode: Node = { id: "n1", capacity: 4, used: 1 };  // load=0.25
    const highLoadNode: Node = { id: "n2", capacity: 4, used: 3 }; // load=0.75

    expect(edgeCost(item, highLoadNode)).toBeGreaterThan(edgeCost(item, lowLoadNode));
  });

  it("latency sensitivity adds penalty proportional to load", () => {
    const latentItem: Item = { id: "i1", risk: 0.5, latencySensitivity: 1.0 };
    const normalItem: Item = { id: "i2", risk: 0.5 };
    const node: Node = { id: "n1", capacity: 2, used: 1 }; // load=0.5

    // latentItem gets extra round(1.0 * 0.5 * 100) = 50 penalty
    expect(edgeCost(latentItem, node)).toBeGreaterThan(edgeCost(normalItem, node));
  });

  it("zero-capacity node has load treated as 1", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    // A zero-capacity node means used (0) >= capacity (0) → canAssign returns false
    const zeroCapNode: Node = { id: "n1", capacity: 0, used: 0 };
    expect(edgeCost(item, zeroCapNode)).toBe(Number.POSITIVE_INFINITY);
  });

  it("region mismatch adds exactly 10000 to cost", () => {
    const item: Item = { id: "i1", risk: 0.5, region: "us" };
    const sameRegion: Node = { id: "n1", capacity: 1, used: 0, region: "us" };
    const diffRegion: Node = { id: "n2", capacity: 1, used: 0, region: "eu" };

    expect(edgeCost(item, diffRegion) - edgeCost(item, sameRegion)).toBe(10_000);
  });

  it("no region penalty when item has no region", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const nodeWithRegion: Node = { id: "n1", capacity: 1, used: 0, region: "eu" };
    const cost = edgeCost(item, nodeWithRegion);
    expect(Number.isFinite(cost)).toBe(true);
    // Should be same as node without region (no penalty applied)
    const nodeNoRegion: Node = { id: "n2", capacity: 1, used: 0 };
    expect(cost).toBe(edgeCost(item, nodeNoRegion));
  });

  it("no region penalty when node has no region", () => {
    const item: Item = { id: "i1", risk: 0.5, region: "us" };
    const nodeNoRegion: Node = { id: "n1", capacity: 1, used: 0 };
    const cost = edgeCost(item, nodeNoRegion);
    expect(Number.isFinite(cost)).toBe(true);
    // Only item has region, node does not — no mismatch penalty
    const sameRegionNode: Node = { id: "n2", capacity: 1, used: 0, region: "us" };
    expect(cost).toBe(edgeCost(item, sameRegionNode));
  });

  // finiteEdgeCost
  it("finiteEdgeCost returns null for an ineligible assignment", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const fullNode: Node = { id: "n1", capacity: 1, used: 1 };
    expect(finiteEdgeCost(item, fullNode)).toBeNull();
  });

  it("finiteEdgeCost returns a finite number for an eligible assignment", () => {
    const item: Item = { id: "i1", risk: 0.5 };
    const node: Node = { id: "n1", capacity: 1, used: 0 };
    const cost = finiteEdgeCost(item, node);
    expect(cost).not.toBeNull();
    expect(typeof cost).toBe("number");
    expect(Number.isFinite(cost as number)).toBe(true);
  });

  it("finiteEdgeCost returns null when required tag is missing", () => {
    const item: Item = { id: "i1", risk: 0.5, requiredTags: ["secure"] };
    const node: Node = { id: "n1", capacity: 1, used: 0, tags: ["public"] };
    expect(finiteEdgeCost(item, node)).toBeNull();
  });
});