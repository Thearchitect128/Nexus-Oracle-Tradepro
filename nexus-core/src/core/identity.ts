import { MIN_COHERENCE_ACTIVE } from "./constants.js";
import type { SystemState } from "./types.js";

export function enforceIdentity(state: SystemState): SystemState {
  if (state.identity === "data_dominant") {
    return {
      ...state,
      mode: state.mode === "locked" ? "locked" : "active",
      coherence: Math.max(state.coherence, MIN_COHERENCE_ACTIVE)
    };
  }

  return {
    ...state,
    mode: "drift"
  };
}