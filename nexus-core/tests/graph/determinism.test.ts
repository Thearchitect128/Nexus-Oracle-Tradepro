import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { parseNodeMap } from "../../src/core/parseNodeMap.js";
import { exportAnalysis } from "../../src/core/graph/exportAnalysis.js";
import { runFullAnalysis } from "../../src/core/graph/pipeline.js";

describe("deterministic export", () => {
  test("produces byte-identical analysis and hash for repeated runs", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-determinism-"));
    const outputA = path.join(tempDir, "analysis-a.json");
    const outputB = path.join(tempDir, "analysis-b.json");

    const nodesA = parseNodeMap("./data/node_map.csv");
    const nodesB = parseNodeMap("./data/node_map.csv");

    const runA = exportAnalysis(runFullAnalysis(nodesA), outputA);
    const runB = exportAnalysis(runFullAnalysis(nodesB), outputB);

    expect(fs.readFileSync(outputA)).toEqual(fs.readFileSync(outputB));
    expect(fs.readFileSync(runA.hashPath, "utf8").split("  ")[0]).toBe(runA.hash);
    expect(runA.hash).toBe(runB.hash);
  });
});
