import { describe, expect, it } from "vitest";
import { enforceIdentity } from "../src/core/identity.js";
import { createInitialState } from "../src/core/state.js";
describe("enforceIdentity", () => {
    it("keeps data dominant state active and raises coherence floor", () => {
        const state = createInitialState();
        state.coherence = 0.4;
        const next = enforceIdentity(state);
        expect(next.mode).toBe("active");
        expect(next.coherence).toBeGreaterThanOrEqual(0.7);
    });
});