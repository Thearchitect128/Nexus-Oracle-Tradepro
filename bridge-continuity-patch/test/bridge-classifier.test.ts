import { describe, expect, it } from "vitest";
import { classifyTrace } from "../src/lib/bridge/traceClassifier";
import failTrace from "../traces/bridge-witness-fail.json";
import passTrace from "../traces/bridge-witness-pass.json";

describe("bridge continuity classifier", () => {
  it("classifies the pass witness as contract-satisfying", () => {
    const result = classifyTrace(passTrace);

    expect(result.pass).toBe(true);
    expect(result.invariants.forwardCycleEstablished).toBe(true);
    expect(result.invariants.noReverseCycle).toBe(true);
    expect(result.invariants.globalConvergenceToPhi).toBe(true);
  });

  it("classifies the fail witness as contract-violating", () => {
    const result = classifyTrace(failTrace);

    expect(result.pass).toBe(false);
    expect(result.invariants.forwardCycleEstablished).toBe(true);
    expect(result.invariants.noReverseCycle).toBe(false);
    expect(result.invariants.globalConvergenceToPhi).toBe(false);
  });
});
