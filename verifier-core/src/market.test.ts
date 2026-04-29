import { describe, it, expect } from "vitest";
import { classifyMarketFeed, MarketFeedSchema } from "./market";

const feed = {
  timestamp: "2026-04-25T12:00:00Z",
  provenance: {
    sources: [
      { name: "Yahoo Finance", credibility: "HIGH", signed: false },
      { name: "CNBC", credibility: "HIGH", signed: false }
    ],
    cryptographic_verification: false,
    transform_chain: "UNKNOWN"
  },
  signal: {
    tech: "UP",
    vix: "DOWN",
    oil: "DOWN",
    gold: "UP",
    europe: "WEAK",
    asia: "NEUTRAL",
    yields: "DOWN",
    germany: "DOWN"
  }
};

describe("Market classifier", () => {
  it("classifies transformed stable market feeds", () => {
    const result = classifyMarketFeed(feed);

    expect(result.state).toBe("TRANSFORMED_STABLE");
    expect(result.regime).toBe("DIVERGENT_MARKETS");
    expect(result.risk_mode).toBe("CAUTIOUS_RISK_ON");
    expect(result.drift).toBe(false);
    expect(result.primary_drivers).toContain("oil");
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("validates market feed structure", () => {
    expect(() => MarketFeedSchema.parse(feed)).not.toThrow();
  });

  it("fails with incorrect feed schema", () => {
    const invalidFeed = {
      ...feed,
      signal: {
        ...feed.signal,
        tech: "FLUX"
      }
    };
    expect(() => MarketFeedSchema.parse(invalidFeed)).toThrow();
  });
});
