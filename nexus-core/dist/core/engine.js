import { decide } from "./arbitration.js";
import { updateStateAfterDecision } from "./coherence.js";
import { enforceIdentity } from "./identity.js";
import { selectPath } from "./paths.js";
import { isNearRecursion, stabilizeFromRecursion } from "./recursion.js";
export class NexusEngine {
    state;
    paths;
    constructor(initialState, paths) {
        this.state = initialState;
        this.paths = paths;
    }
    getState() {
        return this.state;
    }
    getPaths() {
        return this.paths;
    }
    step(input) {
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