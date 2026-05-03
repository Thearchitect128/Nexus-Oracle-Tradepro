import type { AssignmentPolicy, EvaluationInput, EvaluationResult } from "../../shared-types/src/index.js";

function selectPolicy(mode: EvaluationResult["mode"], queueDepth: number): AssignmentPolicy {
  if (mode === "containment") {
    return "risk_limited";
  }
  if (queueDepth > 100) {
    return "priority_first";
  }
  return "balanced";
}

export function evaluateMode(input: EvaluationInput): EvaluationResult {
  const reasons: string[] = [];
  let mode: EvaluationResult["mode"] = "normal";

  if (input.contaminationRate > 0.3 || input.confidenceDrift > 0.4) {
    mode = "containment";
    reasons.push("safety threshold exceeded");
  } else if (input.contaminationRate > 0.15 || input.queueDepth > 120 || input.confidenceDrift > 0.2) {
    mode = "degraded";
    reasons.push("load or evidence quality degraded");
  } else {
    reasons.push("nominal operating envelope");
  }

  const policy = selectPolicy(mode, input.queueDepth);
  return { mode, policy, reasons };
}
