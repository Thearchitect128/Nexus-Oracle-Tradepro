import { sha256StableJson } from "../lib/hash";
import type { Vector } from "./testMatrix";

const TARGET_FRONTIER_CARDINALITY = 36;

type Metrics = {
  safety: number;
};

export type FrontierEntry = {
  vector: Vector;
  metrics: Metrics;
};

export type VisualState = {
  eyeIntensity: number;
  glowSpread: number;
  posture: "stable" | "alert" | "restricted";
  background: "void";
};

export type CanonicalState = {
  frontier: FrontierEntry[];
  selected: FrontierEntry;
};

export type UnifiedState = {
  canonical: CanonicalState;
  visual: VisualState;
  hashes: {
    canonical: string;
    visual: string;
  };
};

function safetyFromRisk(risk: Vector["risk"]): number {
  if (risk === "low") return 1;
  if (risk === "medium") return 0.5;
  return 0;
}

function compareVector(a: Vector, b: Vector): number {
  return JSON.stringify(a).localeCompare(JSON.stringify(b));
}

export function toFrontierEntry(vector: Vector): FrontierEntry {
  return {
    vector,
    metrics: { safety: safetyFromRisk(vector.risk) },
  };
}

export function mapToVisual(frontier: FrontierEntry[], selected?: FrontierEntry): VisualState {
  const orderedFrontier = [...frontier].sort((a, b) => compareVector(a.vector, b.vector));
  const best = selected ?? orderedFrontier[0];

  if (!best) {
    throw new Error("Cannot map visual state with an empty frontier");
  }

  return {
    eyeIntensity: best.metrics.safety,
    glowSpread: Math.min(1, orderedFrontier.length / TARGET_FRONTIER_CARDINALITY),
    posture: best.vector.auth === "bypass" ? "alert" : best.vector.decision === "model" ? "stable" : "restricted",
    background: "void",
  };
}

export function buildUnifiedState(frontierVectors: Vector[], selectedVector?: Vector): UnifiedState {
  const frontier = frontierVectors.map(toFrontierEntry).sort((a, b) => compareVector(a.vector, b.vector));
  const selected = selectedVector ? toFrontierEntry(selectedVector) : frontier[0];

  if (!selected) {
    throw new Error("Cannot build unified state with an empty frontier");
  }

  const visual = mapToVisual(frontier, selected);

  if (visual.eyeIntensity !== selected.metrics.safety) {
    throw new Error("Visual mismatch: safety encoding broken");
  }

  const canonical: CanonicalState = { frontier, selected };

  return {
    canonical,
    visual,
    hashes: {
      canonical: sha256StableJson(canonical),
      visual: sha256StableJson(visual),
    },
  };
}
