import { describe, expect, it } from "vitest";
import { evaluateMode } from "../packages/control-kernel/src/controlKernel.js";

describe("Control Kernel", () => {
  it("stays in normal mode for healthy snapshots", () => {
    const result = evaluateMode({ queueDepth: 42, contaminationRate: 0.05, confidenceDrift: 0.06 });
    expect(result.mode).toBe("normal");
    expect(result.policy).toBe("balanced");
  });

  it("switches to degraded mode under elevated load", () => {
    const result = evaluateMode({ queueDepth: 180, contaminationRate: 0.1, confidenceDrift: 0.12 });
    expect(result.mode).toBe("degraded");
    expect(result.policy).toBe("priority_first");
  });

  it("enters containment when contamination spikes", () => {
    const result = evaluateMode({ queueDepth: 30, contaminationRate: 0.33, confidenceDrift: 0.12 });
    expect(result.mode).toBe("containment");
    expect(result.policy).toBe("risk_limited");
  });
});

describe("evaluateMode - normal mode", () => {
  it("returns normal mode when all metrics are below thresholds", () => {
    const result = evaluateMode({ queueDepth: 0, contaminationRate: 0, confidenceDrift: 0 });
    expect(result.mode).toBe("normal");
    expect(result.policy).toBe("balanced");
    expect(result.reasons).toContain("nominal operating envelope");
  });

  it("returns normal mode at boundary contaminationRate=0.15 (not greater than)", () => {
    const result = evaluateMode({ queueDepth: 50, contaminationRate: 0.15, confidenceDrift: 0.1 });
    expect(result.mode).toBe("normal");
    expect(result.policy).toBe("balanced");
  });

  it("returns normal mode at boundary queueDepth=120 (not greater than degraded threshold)", () => {
    // queueDepth=120 is NOT > 120, so mode stays normal.
    // But selectPolicy uses queueDepth > 100 for priority_first, so policy = priority_first.
    const result = evaluateMode({ queueDepth: 120, contaminationRate: 0.1, confidenceDrift: 0.1 });
    expect(result.mode).toBe("normal");
    expect(result.policy).toBe("priority_first");
  });

  it("returns normal mode at boundary confidenceDrift=0.2 (not greater than)", () => {
    const result = evaluateMode({ queueDepth: 50, contaminationRate: 0.1, confidenceDrift: 0.2 });
    expect(result.mode).toBe("normal");
    expect(result.policy).toBe("balanced");
  });

  it("uses balanced policy in normal mode with low queueDepth", () => {
    const result = evaluateMode({ queueDepth: 5, contaminationRate: 0.0, confidenceDrift: 0.0 });
    expect(result.policy).toBe("balanced");
  });
});

describe("evaluateMode - degraded mode", () => {
  it("enters degraded mode when contaminationRate exceeds 0.15", () => {
    const result = evaluateMode({ queueDepth: 50, contaminationRate: 0.16, confidenceDrift: 0.1 });
    expect(result.mode).toBe("degraded");
    expect(result.reasons).toContain("load or evidence quality degraded");
  });

  it("enters degraded mode when queueDepth exceeds 120", () => {
    const result = evaluateMode({ queueDepth: 121, contaminationRate: 0.1, confidenceDrift: 0.1 });
    expect(result.mode).toBe("degraded");
    expect(result.reasons).toContain("load or evidence quality degraded");
  });

  it("enters degraded mode when confidenceDrift exceeds 0.2", () => {
    const result = evaluateMode({ queueDepth: 50, contaminationRate: 0.1, confidenceDrift: 0.21 });
    expect(result.mode).toBe("degraded");
    expect(result.reasons).toContain("load or evidence quality degraded");
  });

  it("uses priority_first policy in degraded mode when queueDepth > 100", () => {
    const result = evaluateMode({ queueDepth: 150, contaminationRate: 0.16, confidenceDrift: 0.1 });
    expect(result.mode).toBe("degraded");
    expect(result.policy).toBe("priority_first");
  });

  it("uses balanced policy in degraded mode when queueDepth <= 100", () => {
    // degraded because contaminationRate > 0.15, but queueDepth <= 100
    const result = evaluateMode({ queueDepth: 80, contaminationRate: 0.16, confidenceDrift: 0.1 });
    expect(result.mode).toBe("degraded");
    expect(result.policy).toBe("balanced");
  });
});

describe("evaluateMode - containment mode", () => {
  it("enters containment when contaminationRate exceeds 0.3", () => {
    const result = evaluateMode({ queueDepth: 10, contaminationRate: 0.31, confidenceDrift: 0.1 });
    expect(result.mode).toBe("containment");
    expect(result.reasons).toContain("safety threshold exceeded");
  });

  it("enters containment when confidenceDrift exceeds 0.4", () => {
    const result = evaluateMode({ queueDepth: 10, contaminationRate: 0.1, confidenceDrift: 0.41 });
    expect(result.mode).toBe("containment");
    expect(result.reasons).toContain("safety threshold exceeded");
  });

  it("always uses risk_limited policy in containment mode regardless of queueDepth", () => {
    const resultLowQueue = evaluateMode({ queueDepth: 5, contaminationRate: 0.35, confidenceDrift: 0.1 });
    const resultHighQueue = evaluateMode({ queueDepth: 200, contaminationRate: 0.35, confidenceDrift: 0.1 });
    expect(resultLowQueue.mode).toBe("containment");
    expect(resultLowQueue.policy).toBe("risk_limited");
    expect(resultHighQueue.mode).toBe("containment");
    expect(resultHighQueue.policy).toBe("risk_limited");
  });

  it("containment takes precedence over degraded when both thresholds exceeded", () => {
    // contaminationRate > 0.3 (containment) AND queueDepth > 120 (degraded)
    const result = evaluateMode({ queueDepth: 200, contaminationRate: 0.35, confidenceDrift: 0.1 });
    expect(result.mode).toBe("containment");
    expect(result.policy).toBe("risk_limited");
  });

  it("enters containment at exact boundary contaminationRate > 0.3", () => {
    const justBelow = evaluateMode({ queueDepth: 10, contaminationRate: 0.3, confidenceDrift: 0.1 });
    const justAbove = evaluateMode({ queueDepth: 10, contaminationRate: 0.30001, confidenceDrift: 0.1 });
    // 0.3 is not greater than 0.3, so should not be containment
    expect(justBelow.mode).not.toBe("containment");
    // 0.30001 is greater than 0.3, so should be containment
    expect(justAbove.mode).toBe("containment");
  });

  it("enters containment at exact boundary confidenceDrift > 0.4", () => {
    const justBelow = evaluateMode({ queueDepth: 10, contaminationRate: 0.1, confidenceDrift: 0.4 });
    const justAbove = evaluateMode({ queueDepth: 10, contaminationRate: 0.1, confidenceDrift: 0.40001 });
    // 0.4 is not greater than 0.4, so should not be containment
    expect(justBelow.mode).not.toBe("containment");
    // 0.40001 is greater than 0.4, so should be containment
    expect(justAbove.mode).toBe("containment");
  });
});

describe("evaluateMode - return structure", () => {
  it("always returns a reasons array with at least one entry", () => {
    const cases = [
      { queueDepth: 10, contaminationRate: 0, confidenceDrift: 0 },
      { queueDepth: 200, contaminationRate: 0.1, confidenceDrift: 0.1 },
      { queueDepth: 10, contaminationRate: 0.5, confidenceDrift: 0.5 }
    ];
    for (const input of cases) {
      const result = evaluateMode(input);
      expect(result.reasons.length).toBeGreaterThan(0);
    }
  });

  it("returns a valid AssignmentPolicy in all modes", () => {
    const validPolicies = new Set(["balanced", "risk_limited", "priority_first"]);
    const cases = [
      { queueDepth: 10, contaminationRate: 0, confidenceDrift: 0 },
      { queueDepth: 200, contaminationRate: 0.16, confidenceDrift: 0.1 },
      { queueDepth: 10, contaminationRate: 0.5, confidenceDrift: 0.1 }
    ];
    for (const input of cases) {
      const result = evaluateMode(input);
      expect(validPolicies.has(result.policy)).toBe(true);
    }
  });

  it("returns a valid ControlMode string", () => {
    const validModes = new Set(["normal", "degraded", "containment"]);
    const result = evaluateMode({ queueDepth: 10, contaminationRate: 0, confidenceDrift: 0 });
    expect(validModes.has(result.mode)).toBe(true);
  });
});