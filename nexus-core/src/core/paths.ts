import type { Decision, Path } from "./types.js";

export function selectPath(paths: Path[], decision: Decision): Path | undefined {
  const eligible = paths.filter((p) => p.state === "open");
  if (eligible.length === 0) return undefined;

  const ranked = [...eligible].sort((a, b) => b.weight - a.weight);

  if (decision.action === "reject") {
    return ranked[ranked.length - 1];
  }

  return ranked[0];
}