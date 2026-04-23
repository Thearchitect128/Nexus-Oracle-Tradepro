import { parseNodeMap } from "../core/parseNodeMap.js";
import { exportAnalysis } from "../core/graph/exportAnalysis.js";
import { runFullAnalysis } from "../core/graph/pipeline.js";

const nodes = parseNodeMap("./data/node_map.csv");
const analysis = runFullAnalysis(nodes);
exportAnalysis(analysis);

console.log(`Full analysis exported for ${analysis.nodes.length} nodes to analysis.json`);
