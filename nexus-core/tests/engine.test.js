import { describe, expect, it } from "vitest";
import { NexusEngine } from "../src/core/engine.js";
import { createInitialState, createPaths } from "../src/core/state.js";
describe("engine", () => {
    it("processes one step", () => {
        const engine = new NexusEngine(createInitialState(), createPaths());
        const result = engine.step({
            id: "t1",
            kind: "task",
            value: 0.8
        });
        expect(result.tick).toBe(1);
        expect(result.lastDecision).toBeDefined();
    });
});