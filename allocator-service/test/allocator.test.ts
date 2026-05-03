import { describe, expect, it } from "vitest";
import { isValidVector } from "../src/matrix/constraints";
import { generateAllVectors } from "../src/matrix/generator";
import { assertInvariants } from "../src/matrix/invariants";
import type { AllocatorResponse, Vector } from "../src/matrix/testMatrix";

const V18: Vector = {
  env: "preview",
  mode: "streaming",
  risk: "low",
  decision: "model",
  auth: "protected",
};

const V42: Vector = {
  env: "production",
  mode: "non-streaming",
  risk: "high",
  decision: "defer",
  auth: "protected",
};

class AllocatorRuntime {
  private readonly unsafeDecisionCache = new Map<string, string>();

  runAllocator(vector: Vector): AllocatorResponse {
    const cacheKey = JSON.stringify(vector);
    const cachedDecision = this.unsafeDecisionCache.get(cacheKey);

    if (!cachedDecision) {
      this.unsafeDecisionCache.set(cacheKey, vector.decision);
    }

    return {
      headers: { "Content-Type": "application/json" },
      autoApproved: vector.decision === "model" && vector.risk !== "high",
      deferred: vector.decision === "defer",
      externalApiCalls: vector.decision === "defer" ? 0 : 1,
      latencyMs: vector.mode === "streaming" ? 120 : 280,
    };
  }
}

describe("allocator matrix", () => {
  it("generates all valid vectors and filters invalid combinations", () => {
    const vectors = generateAllVectors();

    expect(vectors.length).toBe(36);
    expect(vectors.every(isValidVector)).toBe(true);
    expect(vectors).toContainEqual(V18);
    expect(vectors).toContainEqual(V42);
    expect(
      vectors.some((vector) => vector.mode === "streaming" && vector.auth === "bypass"),
    ).toBe(false);
  });

  it("enforces invariants for every generated vector", () => {
    const runtime = new AllocatorRuntime();
    const vectors = generateAllVectors();

    for (const vector of vectors) {
      const response = runtime.runAllocator(vector);
      assertInvariants(vector, response);
    }
  });

  it("V18 — Fast Path", () => {
    const runtime = new AllocatorRuntime();
    const response = runtime.runAllocator(V18);

    assertInvariants(V18, response);

    expect(V18.mode).toBe("streaming");
    expect(response.autoApproved).toBe(true);
    expect(response.latencyMs).toBeLessThan(200);
  });

  it("V42 — Safety Path", () => {
    const runtime = new AllocatorRuntime();
    const response = runtime.runAllocator(V42);

    assertInvariants(V42, response);

    expect(response.autoApproved).toBe(false);
    expect(response.externalApiCalls).toBe(0);
    expect(response.deferred).toBe(true);
  });

  it("transition: low risk → high risk does not reuse unsafe approval", () => {
    const runtime = new AllocatorRuntime();
    const lowRisk: Vector = {
      env: "production",
      mode: "non-streaming",
      risk: "low",
      decision: "model",
      auth: "protected",
    };

    const highRisk: Vector = {
      ...lowRisk,
      risk: "high",
    };

    const lowRiskResponse = runtime.runAllocator(lowRisk);
    const highRiskResponse = runtime.runAllocator(highRisk);

    expect(lowRiskResponse.autoApproved).toBe(true);
    expect(highRiskResponse.autoApproved).toBe(false);
    assertInvariants(lowRisk, lowRiskResponse);
    assertInvariants(highRisk, highRiskResponse);
  });

  it("transition: streaming → deferred has no state leakage", () => {
    const runtime = new AllocatorRuntime();
    const streamingVector: Vector = {
      env: "preview",
      mode: "streaming",
      risk: "medium",
      decision: "model",
      auth: "protected",
    };

    const deferredVector: Vector = {
      env: "preview",
      mode: "non-streaming",
      risk: "medium",
      decision: "defer",
      auth: "protected",
    };

    const streamingResponse = runtime.runAllocator(streamingVector);
    const deferredResponse = runtime.runAllocator(deferredVector);

    expect(streamingResponse.deferred).toBe(false);
    expect(deferredResponse.deferred).toBe(true);
    expect(deferredResponse.externalApiCalls).toBe(0);
    assertInvariants(streamingVector, streamingResponse);
    assertInvariants(deferredVector, deferredResponse);
  });

  it("records metrics on invariant failures", () => {
    const metrics: Array<{ invariant: string; message: string }> = [];

    expect(() =>
      assertInvariants(
        V18,
        {
          headers: {},
          autoApproved: true,
          deferred: false,
          externalApiCalls: 1,
          latencyMs: 250,
        },
        (event) => {
          metrics.push({ invariant: event.invariant, message: event.message });
        },
      ),
    ).toThrow(/headers/);

    expect(metrics.length).toBe(1);
    expect(metrics[0]?.invariant).toBe("headers");
  });
});
