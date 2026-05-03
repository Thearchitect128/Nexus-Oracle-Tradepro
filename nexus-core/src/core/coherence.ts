import type { Decision, InputSignal, SystemState } from "./types.js";

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function updateStateAfterDecision(
  state: SystemState,
  input: InputSignal,
  decision: Decision,
  pathId?: number
): SystemState {
  let energy = state.energy;
  let coherence = state.coherence;
  let recursionDepth = state.recursionDepth;

  switch (decision.action) {
    case "advance":
      energy -= 0.08;
      coherence += input.kind === "noise" ? -0.05 : 0.04;
      recursionDepth = Math.max(0, recursionDepth - 1);
      break;
    case "stabilize":
      energy -= 0.03;
      coherence += 0.08;
      recursionDepth = Math.max(0, recursionDepth - 2);
      break;
    case "hold":
      energy -= 0.02;
      coherence -= 0.01;
      recursionDepth += 1;
      break;
    case "reject":
      energy -= 0.01;
      coherence += 0.01;
      recursionDepth = Math.max(0, recursionDepth - 1);
      break;
  }

  return {
    ...state,
    tick: state.tick + 1,
    energy: clamp01(energy),
    coherence: clamp01(coherence),
    recursionDepth,
    lastDecision: decision,
    lastPathId: pathId
  };
}