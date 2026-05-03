import { decide } from "./arbitration.js";
import { updateStateAfterDecision } from "./coherence.js";
import { enforceIdentity } from "./identity.js";
import { selectPath } from "./paths.js";
import { isNearRecursion, stabilizeFromRecursion } from "./recursion.js";
import type { InputSignal, Path, SystemState } from "./types.js";

export class NexusEngine {
  private state: SystemState;
  private paths: Path[];

  constructor(initialState: SystemState, paths: Path[]) {
    this.state = initialState;
    this.paths = paths;
  }

  getState(): SystemState {
    return this.state;
  }

  getPaths(): Path[] {
    return this.paths;
  }

  step(input: InputSignal): SystemState {
    let next = enforceIdentity(this.state);

    if (isNearRecursion(next)) {
      next = stabilizeFromRecursion(next);
      this.state = next;
      return this.state;
    }

    const decision = decide(input, next);
    const path = selectPath(this.paths, decision);

    next = updateStateAfterDecision(next, input, decision, path?.id);
    this.state = next;

    return this.state;
  }
}