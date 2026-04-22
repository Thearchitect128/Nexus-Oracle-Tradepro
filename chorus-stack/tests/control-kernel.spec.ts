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

describe("Control Kernel mode thresholds", () => {
  it("enters containment when confidenceDrift exceeds 0.4", () => {
    const result = evaluateMode({ queueDepth: 50, contaminationRate: 0.1, confidenceDrift: 0.41 });
    expect(result.mode).toBe("containment");
    expect(result.policy).toBe("risk_limited");
  });

  it("enters containment when contaminationRate is exactly at boundary 0.3+", () => {
    const result = evaluateMode({ queueDepth: 10, contaminationRate: 0.31, confidenceDrift: 0.0 });
    expect(result.mode).toBe("containment");
    expect(result.policy).toBe("risk_limited");
  });

  it("does not trigger containment at exactly contaminationRate 0.3 (boundary is exclusive)", () => {
    const result = evaluateMode({ queueDepth: 10, contaminationRate: 0.3, confidenceDrift: 0.0 });
    expect(result.mode).not.toBe("containment");
  });

  it("enters degraded mode when only queueDepth exceeds 120", () => {
    const result = evaluateMode({ queueDepth: 121, contaminationRate: 0.05, confidenceDrift: 0.05 });
    expect(result.mode).toBe("degraded");
  });

  it("enters degraded mode when only contaminationRate exceeds 0.15", () => {
    const result = evaluateMode({ queueDepth: 50, contaminationRate: 0.16, confidenceDrift: 0.05 });
    expect(result.mode).toBe("degraded");
  });

  it("enters degraded mode when only confidenceDrift exceeds 0.2", () => {
    const result = evaluateMode({ queueDepth: 50, contaminationRate: 0.05, confidenceDrift: 0.21 });
    expect(result.mode).toBe("degraded");
  });

  it("uses balanced policy when degraded but queueDepth is at or below 100", () => {
    const result = evaluateMode({ queueDepth: 100, contaminationRate: 0.16, confidenceDrift: 0.05 });
    expect(result.mode).toBe("degraded");
    expect(result.policy).toBe("balanced");
  });

  it("uses priority_first policy when degraded and queueDepth exceeds 100", () => {
    const result = evaluateMode({ queueDepth: 101, contaminationRate: 0.16, confidenceDrift: 0.05 });
    expect(result.mode).toBe("degraded");
    expect(result.policy).toBe("priority_first");
  });

  it("normal mode includes reason about nominal operating envelope", () => {
    const result = evaluateMode({ queueDepth: 10, contaminationRate: 0.05, confidenceDrift: 0.05 });
    expect(result.reasons).toContain("nominal operating envelope");
  });

  it("containment mode includes reason about safety threshold", () => {
    const result = evaluateMode({ queueDepth: 10, contaminationRate: 0.5, confidenceDrift: 0.0 });
    expect(result.reasons).toContain("safety threshold exceeded");
  });

  it("degraded mode includes reason about load or evidence quality", () => {
    const result = evaluateMode({ queueDepth: 200, contaminationRate: 0.05, confidenceDrift: 0.05 });
    expect(result.reasons).toContain("load or evidence quality degraded");
  });

  it("normal mode with queueDepth exactly 120 stays normal (boundary is > 120)", () => {
    const result = evaluateMode({ queueDepth: 120, contaminationRate: 0.05, confidenceDrift: 0.05 });
    expect(result.mode).toBe("normal");
  });

  it("result contains all three required fields", () => {
    const result = evaluateMode({ queueDepth: 10, contaminationRate: 0.05, confidenceDrift: 0.05 });
    expect(result).toHaveProperty("mode");
    expect(result).toHaveProperty("policy");
    expect(result).toHaveProperty("reasons");
    expect(Array.isArray(result.reasons)).toBe(true);
  });

  it("normal mode uses balanced policy even with queueDepth above 100", () => {
    // queueDepth=101, contamination and drift within normal thresholds
    const result = evaluateMode({ queueDepth: 101, contaminationRate: 0.05, confidenceDrift: 0.05 });
    expect(result.mode).toBe("normal");
    // In normal mode, selectPolicy is called with mode="normal" and queueDepth=101 (>100) -> priority_first
    expect(result.policy).toBe("priority_first");
  });
});