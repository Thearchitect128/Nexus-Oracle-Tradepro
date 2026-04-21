import { describe, expect, it } from "vitest";
import { isNearRecursion, stabilizeFromRecursion } from "../src/core/recursion.js";
import { createInitialState } from "../src/core/state.js";
describe("recursion", () => {
    it("detects near recursion", () => {
        const state = createInitialState();
        state.recursionDepth = 4;
        state.coherence = 0.5;
        expect(isNearRecursion(state)).toBe(true);
    });
    it("stabilizes state", () => {
        const state = createInitialState();
        state.recursionDepth = 5;
        state.coherence = 0.4;
        const next = stabilizeFromRecursion(state);
        expect(next.mode).toBe("locked");
        expect(next.recursionDepth).toBe(0);
        expect(next.coherence).toBeGreaterThan(state.coherence);
    });
});