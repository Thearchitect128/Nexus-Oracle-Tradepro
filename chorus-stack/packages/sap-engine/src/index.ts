import type { EvaluationResult } from "../../shared-types/src/index.js";

export interface SapEngine {
  applyControl(result: EvaluationResult): Promise<void>;
}
