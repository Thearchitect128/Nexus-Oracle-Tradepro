import fs from "node:fs";
import type { FullAnalysis } from "./pipeline.js";

export function exportAnalysis(analysis: FullAnalysis, outputPath = "./analysis.json"): void {
  fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
}
