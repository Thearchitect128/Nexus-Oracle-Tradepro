import { z } from "zod";

export const SourceCredibilityEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type SourceCredibility = z.infer<typeof SourceCredibilityEnum>;

export const MarketTrendEnum = z.enum(["UP", "DOWN", "FLAT"]);
export type MarketTrend = z.infer<typeof MarketTrendEnum>;

export const EuropeTrendEnum = z.enum(["STRONG", "WEAK", "NEUTRAL"]);
export type EuropeTrend = z.infer<typeof EuropeTrendEnum>;

export const TransformChainEnum = z.enum(["COMPLETE", "PARTIAL", "UNKNOWN"]);
export type TransformChain = z.infer<typeof TransformChainEnum>;

export const MarketSourceSchema = z.object({
  name: z.string().min(1),
  credibility: SourceCredibilityEnum,
  signed: z.boolean().optional()
});

export type MarketSource = z.infer<typeof MarketSourceSchema>;

export const MarketProvenanceSchema = z.object({
  sources: z.array(MarketSourceSchema).min(1),
  cryptographic_verification: z.boolean(),
  transform_chain: TransformChainEnum
});

export type MarketProvenance = z.infer<typeof MarketProvenanceSchema>;

export const MarketSignalSchema = z.object({
  tech: MarketTrendEnum,
  vix: MarketTrendEnum,
  oil: MarketTrendEnum,
  gold: MarketTrendEnum,
  europe: EuropeTrendEnum,
  asia: z.enum(["UP", "DOWN", "NEUTRAL"]),
  yields: MarketTrendEnum,
  germany: z.enum(["UP", "DOWN", "NEUTRAL"]).optional()
});

export type MarketSignal = z.infer<typeof MarketSignalSchema>;

export const MarketFeedSchema = z.object({
  timestamp: z.string().datetime(),
  provenance: MarketProvenanceSchema,
  signal: MarketSignalSchema,
  metadata: z.record(z.unknown()).optional()
});

export type MarketFeed = z.infer<typeof MarketFeedSchema>;

export const MarketClassificationSchema = z.object({
  state: z.string(),
  regime: z.string(),
  risk_mode: z.string(),
  confidence: z.number().min(0).max(1),
  drift: z.boolean(),
  primary_drivers: z.array(z.string()),
  provenance: z.object({
    state: z.string(),
    credibility: z.number().min(0).max(1),
    verified: z.boolean(),
    transform_chain: TransformChainEnum
  }),
  signal: z.object({
    stable: z.boolean(),
    coherence: z.number().min(0).max(1),
    details: z.record(z.any())
  }),
  metadata: z.record(z.unknown()).optional()
});

export type MarketClassification = z.infer<typeof MarketClassificationSchema>;

const credibilityScore = (credibility: SourceCredibility): number => {
  switch (credibility) {
    case "HIGH":
      return 0.9;
    case "MEDIUM":
      return 0.6;
    case "LOW":
      return 0.3;
  }
};

const provenanceState = ({
  cryptographic_verification,
  sources,
  transform_chain
}: MarketProvenance): { state: string; credibility: number; verified: boolean } => {
  const averageCredibility = sources.reduce((sum, source) => sum + credibilityScore(source.credibility), 0) / sources.length;
  const verified = cryptographic_verification === true;

  if (verified) {
    return {
      state: "VERIFIED",
      credibility: Math.min(1, averageCredibility + 0.1),
      verified: true
    };
  }

  if (averageCredibility >= 0.75 && transform_chain === "COMPLETE") {
    return {
      state: "TRANSFORMED",
      credibility: averageCredibility,
      verified: false
    };
  }

  if (averageCredibility >= 0.75) {
    return {
      state: "TRANSFORMED",
      credibility: averageCredibility,
      verified: false
    };
  }

  return {
    state: "UNKNOWN",
    credibility: averageCredibility,
    verified: false
  };
};

const evaluateSignalCoherence = (signal: MarketSignal) => {
  const checks = [
    signal.tech === "UP",
    signal.vix === "DOWN",
    signal.oil === "DOWN",
    signal.gold === "UP",
    signal.europe === "WEAK",
    signal.yields === "DOWN"
  ];

  const score = checks.filter(Boolean).length / checks.length;
  const stable = score >= 0.75;

  const drivers: string[] = [];
  if (signal.oil !== "FLAT") drivers.push("oil");
  if (signal.yields !== "FLAT") drivers.push("yields");
  if (signal.gold !== "FLAT") drivers.push("geopolitics");

  const regime = (() => {
    if (signal.tech === "UP" && signal.europe === "WEAK" && signal.asia === "NEUTRAL") {
      return "DIVERGENT_MARKETS";
    }
    if (signal.tech === "UP" && signal.europe === "STRONG" && signal.asia === "UP") {
      return "GLOBAL_EXPANSION";
    }
    if (signal.tech === "DOWN" && signal.europe === "WEAK" && signal.yields === "UP") {
      return "GLOBAL_RISK_OFF";
    }
    return "MIXED_MARKETS";
  })();

  const riskMode = (() => {
    if (signal.tech === "UP" && signal.vix === "DOWN" && signal.yields === "DOWN" && signal.gold === "UP") {
      return "CAUTIOUS_RISK_ON";
    }
    if (signal.vix === "UP" && signal.oil === "UP") {
      return "RISK_OFF";
    }
    return "NEUTRAL";
  })();

  return {
    coherence: score,
    stable,
    regime,
    riskMode,
    drivers: drivers.length > 0 ? drivers : ["oil", "yields", "geopolitics"],
    details: {
      tech: signal.tech,
      vix: signal.vix,
      oil: signal.oil,
      gold: signal.gold,
      europe: signal.europe,
      asia: signal.asia,
      yields: signal.yields,
      germany: signal.germany ?? "NEUTRAL"
    }
  };
};

const mergedState = (provenanceStateName: string, signalStable: boolean) => {
  if (provenanceStateName === "VERIFIED" && signalStable) {
    return "VERIFIED_STABLE";
  }
  if (provenanceStateName === "VERIFIED" && !signalStable) {
    return "VERIFIED_UNSTABLE";
  }
  if (provenanceStateName === "TRANSFORMED" && signalStable) {
    return "TRANSFORMED_STABLE";
  }
  if (provenanceStateName === "TRANSFORMED" && !signalStable) {
    return "TRANSFORMED_UNSTABLE";
  }
  if (provenanceStateName === "UNKNOWN" && signalStable) {
    return "UNKNOWN_STABLE";
  }
  return "UNKNOWN_UNSTABLE";
};

export function classifyMarketFeed(feedInput: unknown): MarketClassification {
  const feed = MarketFeedSchema.parse(feedInput);

  const provenance = provenanceState(feed.provenance);
  const signal = evaluateSignalCoherence(feed.signal);

  const state = mergedState(provenance.state, signal.stable);
  const confidence = Math.round(((provenance.credibility * 0.6 + signal.coherence * 0.4) * (signal.stable ? 1 : 0.8)) * 100) / 100;

  return MarketClassificationSchema.parse({
    state,
    regime: signal.regime,
    risk_mode: signal.riskMode,
    confidence,
    drift: !signal.stable,
    primary_drivers: signal.drivers,
    provenance: {
      state: provenance.state,
      credibility: provenance.credibility,
      verified: provenance.verified,
      transform_chain: feed.provenance.transform_chain
    },
    signal: {
      stable: signal.stable,
      coherence: signal.coherence,
      details: signal.details
    },
    metadata: {
      timestamp: feed.timestamp,
      witness_sources: feed.provenance.sources.map((source) => source.name)
    }
  });
}

export const MarketVerifyRequestSchema = z.object({
  feed: MarketFeedSchema.optional(),
  url: z.string().url().optional()
});

export type MarketVerifyRequest = z.infer<typeof MarketVerifyRequestSchema>;
