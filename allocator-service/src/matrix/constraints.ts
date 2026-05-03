import type { Vector } from "./testMatrix";

export function isValidVector(v: Vector): boolean {
  if (v.mode === "streaming" && v.decision !== "model") return false;
  if (v.risk === "high" && v.auth === "bypass") return false;
  if (v.mode === "streaming" && v.auth === "bypass") return false;
  if (v.decision === "reject" && v.mode === "streaming") return false;
  return true;
}
