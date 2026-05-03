import { LOCKED_ENERGY_PENALTY, NEAR_RECURSION_COHERENCE, NEAR_RECURSION_DEPTH } from "./constants.js";
export function isNearRecursion(state) {
    return (state.recursionDepth > NEAR_RECURSION_DEPTH &&
        state.coherence < NEAR_RECURSION_COHERENCE);
}
export function stabilizeFromRecursion(state) {
    return {
        ...state,
        mode: "locked",
        energy: Math.max(0, state.energy * LOCKED_ENERGY_PENALTY),
        recursionDepth: 0,
        coherence: Math.min(1, state.coherence + 0.15)
    };
}