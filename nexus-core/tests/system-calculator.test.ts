import { describe, expect, it } from "vitest";
import { runCalculationCycle, verifyIntegrity } from "../src/system/calculator.js";
import { initialContext } from "../src/system/state.js";
import { generateSigningKeyPair } from "../src/core/signing.js";

describe("system calculator integration", () => {
  it("enters VERIFYING after trusted signed calculation", async () => {
    const keyPair = generateSigningKeyPair();
    const result = await runCalculationCycle("HOLD", initialContext, keyPair, 12);

    expect(result.state).toBe("VERIFYING");
    expect(result.integrity?.trustworthy).toBe(true);
  });

  it("flags tampered signed records as untrustworthy", async () => {
    const keyPair = generateSigningKeyPair();
    const result = await runCalculationCycle("HOLD", initialContext, keyPair, 9);

    if (!result.signed) {
      throw new Error("Expected signed result");
    }

    const tampered = {
      ...result.signed,
      record: {
        ...result.signed.record,
        final: {
          ...result.signed.record.final,
          provenance: {
            ...result.signed.record.final.provenance,
            hash: "tampered-hash",
          },
        },
      },
    };

    const integrity = await verifyIntegrity(tampered);
    expect(integrity.trustworthy).toBe(false);
  });
});
