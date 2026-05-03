import { parseNodeMap } from "../core/parseNodeMap.js";
import { exportAnalysis } from "../core/graph/exportAnalysis.js";
import { runFullAnalysis } from "../core/graph/pipeline.js";

const nodes = parseNodeMap("./data/node_map.csv");
const analysis = runFullAnalysis(nodes);
const exported = exportAnalysis(analysis);

console.log(`Full analysis exported for ${analysis.nodes.length} nodes to ${exported.outputPath}`);
console.log(`SHA-256: ${exported.hash}`);
