import fs from "node:fs";
import path from "node:path";
import type { FullAnalysis } from "./pipeline.js";
import { sha256Hex, stableStringify } from "./hash.js";

export type ExportResult = {
  outputPath: string;
  hashPath: string;
  hash: string;
};

export function exportAnalysis(analysis: FullAnalysis, outputPath = "./analysis.json"): ExportResult {
  const serialized = stableStringify(analysis);
  fs.writeFileSync(outputPath, `${serialized}\n`);

  const hash = sha256Hex(`${serialized}\n`);
  const hashPath = `${outputPath}.sha256`;
  const fileName = path.basename(outputPath);
  fs.writeFileSync(hashPath, `${hash}  ${fileName}\n`);

  return { outputPath, hashPath, hash };
}
