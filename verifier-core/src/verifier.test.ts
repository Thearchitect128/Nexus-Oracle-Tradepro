import { describe, it, expect } from "vitest";
import {
  sha256String,
  sha256Buffer,
  verifySignature,
  classify,
  trustScore,
  verifyAsset,
  isFailed,
  isPassed,
  mockSignalDetection,
  InvalidOptionsError,
  FileAccessError,
  HashComputationError,
  isSignalStable
} from "../src/index";
import { Manifest } from "../src/schema";
import fs from "fs";
import path from "path";

// Mock manifest for testing
const mockManifest: Manifest = {
  asset_id: "550e8400-e29b-41d4-a716-446655440000",
  hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  created_at: "2026-04-25T10:00:00Z",
  creator: {
    id: "device-001",
    signature: "mock-signature"
  },
  transforms: []
};

describe("Hash Functions", () => {
  it("computes consistent SHA-256", () => {
    const text = "test data";
    const hash1 = sha256String(text);
    const hash2 = sha256String(text);

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });

  it("detects hash changes", () => {
    const hash1 = sha256String("data1");
    const hash2 = sha256String("data2");

    expect(hash1).not.toBe(hash2);
  });

  it("validates SHA-256 format", () => {
    const hash = sha256String("anything");
    expect(hash.length).toBe(64);
    expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
  });

  it("throws on invalid buffer input", () => {
    expect(() => {
      sha256Buffer("not a buffer" as any);
    }).toThrow(HashComputationError);
  });

  it("throws on non-string input", () => {
    expect(() => {
      sha256String(123 as any);
    }).toThrow(HashComputationError);
  });
});

describe("Signal Functions", () => {
  it("validates signal stability", () => {
    const result = isSignalStable(167.9, 167.9, 0.5);
    expect(result.stable).toBe(true);
    expect(result.error_hz).toBe(0);
  });

  it("detects signal drift", () => {
    const result = isSignalStable(170.0, 167.9, 0.5);
    expect(result.stable).toBe(false);
    expect(result.error_hz).toBeCloseTo(2.1);
  });

  it("throws on invalid frequency", () => {
    expect(() => {
      isSignalStable(NaN, 167.9, 0.5);
    }).toThrow(InvalidOptionsError);
  });

  it("throws on negative tolerance", () => {
    expect(() => {
      isSignalStable(167.9, 167.9, -1);
    }).toThrow(InvalidOptionsError);
  });

  it("throws on invalid mock scenario", () => {
    expect(() => {
      mockSignalDetection("invalid" as any);
    }).toThrow(InvalidOptionsError);
  });
});

describe("State Classification", () => {
  it("returns UNKNOWN when no manifest", () => {
    const state = classify({
      hasManifest: false,
      hashMatch: true,
      signatureValid: true,
      transformsValid: true
    });

    expect(state).toBe("UNKNOWN");
  });

  it("returns BROKEN on invalid signature", () => {
    const state = classify({
      hasManifest: true,
      hashMatch: true,
      signatureValid: false,
      transformsValid: true
    });

    expect(state).toBe("BROKEN");
  });

  it("returns VERIFIED on full match", () => {
    const state = classify({
      hasManifest: true,
      hashMatch: true,
      signatureValid: true,
      transformsValid: true
    });

    expect(state).toBe("VERIFIED");
  });

  it("returns TRANSFORMED when hash changed but transforms valid", () => {
    const state = classify({
      hasManifest: true,
      hashMatch: false,
      signatureValid: true,
      transformsValid: true
    });

    expect(state).toBe("TRANSFORMED");
  });

  it("returns BROKEN when transforms invalid", () => {
    const state = classify({
      hasManifest: true,
      hashMatch: false,
      signatureValid: true,
      transformsValid: false
    });

    expect(state).toBe("BROKEN");
  });

  it("factors signal stability into state", () => {
    const state = classify({
      hasManifest: true,
      hashMatch: true,
      signatureValid: true,
      transformsValid: true,
      signalStable: false
    });

    expect(state).toBe("BROKEN");
  });
});

describe("Trust Score", () => {
  it("scores VERIFIED at 100", () => {
    expect(trustScore("VERIFIED")).toBe(100);
  });

  it("scores TRANSFORMED at 60", () => {
    expect(trustScore("TRANSFORMED")).toBe(60);
  });

  it("scores BROKEN at 0", () => {
    expect(trustScore("BROKEN")).toBe(0);
  });

  it("scores UNKNOWN at 0", () => {
    expect(trustScore("UNKNOWN")).toBe(0);
  });
});

describe("Verification Results", () => {
  it("identifies failed verification", () => {
    expect(isFailed({ state: "BROKEN" } as any)).toBe(true);
    expect(isFailed({ state: "UNKNOWN" } as any)).toBe(true);
    expect(isFailed({ state: "VERIFIED" } as any)).toBe(false);
    expect(isFailed({ state: "TRANSFORMED" } as any)).toBe(false);
  });

  it("identifies passed verification (strict)", () => {
    expect(isPassed({ state: "VERIFIED" } as any)).toBe(true);
    expect(isPassed({ state: "TRANSFORMED" } as any)).toBe(false);
    expect(isPassed({ state: "BROKEN" } as any)).toBe(false);
  });
});

describe("Error Handling", () => {
  it("throws on missing file", async () => {
    await expect(async () => {
      await verifyAsset("/nonexistent/file.txt", mockManifest);
    }).rejects.toThrow(FileAccessError);
  });

  it("throws on invalid manifest", async () => {
    const testFile = path.join(__dirname, "test-file.txt");
    fs.writeFileSync(testFile, "test");

    try {
      await expect(
        verifyAsset(testFile, { invalid: "manifest" })
      ).rejects.toThrow();
    } finally {
      fs.unlinkSync(testFile);
    }
  });
});
