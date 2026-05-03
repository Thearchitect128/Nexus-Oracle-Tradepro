import { isValidVector } from "../src/matrix/constraints";
import { assertInvariants } from "../src/matrix/invariants";
import type { AllocatorResponse, Vector } from "../src/matrix/testMatrix";

const payload = process.argv[2];

if (!payload) {
  throw new Error("Expected a JSON vector argument");
}

const candidate = JSON.parse(payload) as Vector;

if (!isValidVector(candidate)) {
  throw new Error(`Invalid vector: ${JSON.stringify(candidate)}`);
}

const simulatedResponse: AllocatorResponse = {
  headers: { "Content-Type": "application/json" },
  autoApproved: candidate.risk !== "high" && candidate.decision === "model",
  deferred: candidate.decision === "defer",
  externalApiCalls: candidate.decision === "defer" ? 0 : 1,
  latencyMs: candidate.mode === "streaming" ? 150 : 250,
};

assertInvariants(candidate, simulatedResponse);
console.log(`ok ${JSON.stringify(candidate)}`);
