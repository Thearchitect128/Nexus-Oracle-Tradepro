import { describe, expect, it } from "vitest";
import { transition } from "../src/system/engine.js";
import { initialContext } from "../src/system/state.js";

describe("SABR-HOLD state machine", () => {
  it("remains in HOLD when no input change", () => {
    const { state } = transition("HOLD", initialContext);
    expect(state).toBe("HOLD");
  });

  it("moves to ACTIVE when input deviates", () => {
    const { state } = transition("HOLD", initialContext, 5);
    expect(state).toBe("ACTIVE");
  });

  it("returns to HOLD when drift resolves", () => {
    const ctx = { ...initialContext, input: 0, anchor: 0 };
    const { state } = transition("ACTIVE", ctx);
    expect(state).toBe("HOLD");
  });
});
