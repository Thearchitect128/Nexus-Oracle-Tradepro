import type { AllocatorResponse, Vector } from "./testMatrix";

export type InvariantMetricsHook = (event: {
  vector: Vector;
  invariant: string;
  message: string;
}) => void;

export function assertInvariants(
  vector: Vector,
  response: AllocatorResponse,
  metricsHook?: InvariantMetricsHook,
): void {
  const fail = (invariant: string, message: string): never => {
    metricsHook?.({ vector, invariant, message });
    throw new Error(`${invariant}: ${message}`);
  };

  if (!response.headers["Content-Type"]) {
    fail("headers", "response is missing Content-Type header");
  }

  if (vector.risk === "high" && response.autoApproved) {
    fail("safety", "high-risk vectors must not be auto-approved");
  }

  if (vector.decision === "defer" && response.externalApiCalls > 0) {
    fail("cost", "deferred vectors must not call external APIs");
  }

  if (vector.mode === "streaming" && response.latencyMs >= 200) {
    fail("latency", "streaming vectors must stay under 200ms latency");
  }
}
