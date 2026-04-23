import type { Node } from "../parseNodeMap.js";
import { validateGraph } from "../validateGraph.js";
import { mapBasins, type GraphNode } from "./basinMapping.js";
import { buildAdjacency, generateEdges, validateEdges, type Edge } from "./edges.js";
import { simulate, type SimulationResult } from "./simulate.js";

export type SimulationRecord = {
  start: string;
  result: SimulationResult;
};

export type FullAnalysis = {
  nodes: Node[];
  edges: Edge[];
  adj: Record<string, string[]>;
  simulations: SimulationRecord[];
  basins: ReturnType<typeof mapBasins>;
};

function toGraphNode(node: Node): GraphNode {
  return {
    node_id: node.node_id,
    weight: node.weight,
    dormant: node.dormant
  };
}

function toSerializableAdjacency(adj: Map<string, string[]>): Record<string, string[]> {
  return Object.fromEntries(adj.entries());
}

export function runFullAnalysis(nodes: Node[]): FullAnalysis {
  validateGraph(nodes);
  const edges = generateEdges(nodes);
  validateEdges(edges, nodes);
  const adj = buildAdjacency(edges);
  const nodeMap = new Map(nodes.map((node) => [node.node_id, toGraphNode(node)]));

  const simulations = nodes.map((node) => ({
    start: node.node_id,
    result: simulate(node.node_id, adj, nodeMap)
  }));

  const basins = mapBasins(nodes, adj, nodeMap);

  return {
    nodes,
    edges,
    adj: toSerializableAdjacency(adj),
    simulations,
    basins
  };
}
