import { demoInputs } from "../adapters/consoleInput.js";
import { NexusEngine } from "../core/engine.js";
import { createInitialState, createPaths } from "../core/state.js";
const engine = new NexusEngine(createInitialState(), createPaths());
for (const input of demoInputs()) {
    const state = engine.step(input);
    console.log({
        input,
        state
    });
}