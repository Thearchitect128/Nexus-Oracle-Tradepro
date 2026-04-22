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

  // Mode — degraded with low queue depth uses balanced policy
  it("uses balanced policy in degraded mode when queue depth is at or below 100", () => {
    // degraded triggered by contaminationRate > 0.15; queueDepth <= 100 → balanced
    const result = evaluateMode({ queueDepth: 100, contaminationRate: 0.2, confidenceDrift: 0.05 });
    expect(result.mode).toBe("degraded");
    expect(result.policy).toBe("balanced");
  });

  it("uses balanced policy in degraded mode triggered by confidenceDrift alone with low queue", () => {
    const result = evaluateMode({ queueDepth: 50, contaminationRate: 0.05, confidenceDrift: 0.25 });
    expect(result.mode).toBe("degraded");
    expect(result.policy).toBe("balanced");
  });

  // Containment triggered by confidenceDrift > 0.4 alone
  it("enters containment when confidenceDrift exceeds 0.4 regardless of contamination", () => {
    const result = evaluateMode({ queueDepth: 10, contaminationRate: 0.05, confidenceDrift: 0.41 });
    expect(result.mode).toBe("containment");
    expect(result.policy).toBe("risk_limited");
  });

  // containment with high queue depth still uses risk_limited (not priority_first)
  it("uses risk_limited policy in containment even when queue depth exceeds 100", () => {
    const result = evaluateMode({ queueDepth: 200, contaminationRate: 0.35, confidenceDrift: 0.05 });
    expect(result.mode).toBe("containment");
    expect(result.policy).toBe("risk_limited");
  });

  // Exact threshold boundaries
  it("stays normal when contaminationRate is exactly 0.15 (not above threshold)", () => {
    const result = evaluateMode({ queueDepth: 50, contaminationRate: 0.15, confidenceDrift: 0.1 });
    expect(result.mode).toBe("normal");
  });

  it("enters degraded when contaminationRate is just above 0.15", () => {
    const result = evaluateMode({ queueDepth: 50, contaminationRate: 0.151, confidenceDrift: 0.1 });
    expect(result.mode).toBe("degraded");
  });

  it("stays normal when queueDepth is exactly 120 (not above threshold)", () => {
    const result = evaluateMode({ queueDepth: 120, contaminationRate: 0.1, confidenceDrift: 0.1 });
    expect(result.mode).toBe("normal");
  });

  it("enters degraded when queueDepth exceeds 120", () => {
    const result = evaluateMode({ queueDepth: 121, contaminationRate: 0.1, confidenceDrift: 0.1 });
    expect(result.mode).toBe("degraded");
  });

  it("stays normal when confidenceDrift is exactly 0.2 (not above threshold)", () => {
    const result = evaluateMode({ queueDepth: 50, contaminationRate: 0.1, confidenceDrift: 0.2 });
    expect(result.mode).toBe("normal");
  });

  it("enters degraded when confidenceDrift just exceeds 0.2", () => {
    const result = evaluateMode({ queueDepth: 50, contaminationRate: 0.1, confidenceDrift: 0.201 });
    expect(result.mode).toBe("degraded");
  });

  it("stays degraded when contaminationRate is exactly 0.3 (not above containment threshold)", () => {
    const result = evaluateMode({ queueDepth: 50, contaminationRate: 0.3, confidenceDrift: 0.1 });
    expect(result.mode).toBe("degraded");
  });

  it("enters containment when contaminationRate just exceeds 0.3", () => {
    const result = evaluateMode({ queueDepth: 50, contaminationRate: 0.301, confidenceDrift: 0.1 });
    expect(result.mode).toBe("containment");
  });

  // Reason strings
  it("includes 'nominal operating envelope' reason in normal mode", () => {
    const result = evaluateMode({ queueDepth: 10, contaminationRate: 0.01, confidenceDrift: 0.01 });
    expect(result.reasons).toContain("nominal operating envelope");
  });

  it("includes 'load or evidence quality degraded' reason in degraded mode", () => {
    const result = evaluateMode({ queueDepth: 130, contaminationRate: 0.05, confidenceDrift: 0.05 });
    expect(result.reasons).toContain("load or evidence quality degraded");
  });

  it("includes 'safety threshold exceeded' reason in containment mode", () => {
    const result = evaluateMode({ queueDepth: 10, contaminationRate: 0.5, confidenceDrift: 0.05 });
    expect(result.reasons).toContain("safety threshold exceeded");
  });

  // Result shape
  it("always returns a reasons array with at least one entry", () => {
    const inputs = [
      { queueDepth: 10, contaminationRate: 0.01, confidenceDrift: 0.01 },
      { queueDepth: 200, contaminationRate: 0.2, confidenceDrift: 0.05 },
      { queueDepth: 10, contaminationRate: 0.5, confidenceDrift: 0.05 },
    ];
    for (const input of inputs) {
      const result = evaluateMode(input);
      expect(result.reasons.length).toBeGreaterThan(0);
    }
  });
});