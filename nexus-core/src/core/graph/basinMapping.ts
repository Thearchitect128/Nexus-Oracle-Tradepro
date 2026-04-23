import type { Node as FullNode } from "../parseNodeMap.js";
import type { SimulationResult } from "./simulate.js";
import { simulate } from "./simulate.js";

export type GraphNode = Pick<FullNode, "node_id" | "weight" | "dormant">;

export type Basin = {
  attractorKey: string;
  attractorCycle: string[];
  members: string[];
};

function toGraphNodeMap(nodes: FullNode[]): Map<string, GraphNode> {
  return new Map(
    nodes.map((node) => [
      node.node_id,
      { node_id: node.node_id, weight: node.weight, dormant: node.dormant }
    ])
  );
}

function resolveAttractorKey(result: SimulationResult): { key: string; cycle: string[] } {
  if (result.type !== "ATTRACTOR") {
    return { key: "TRANSIENT", cycle: [] };
  }

  const cycle = result.state.history.slice(-5);
  return { key: cycle.join("->"), cycle };
}

export function mapBasins(
  nodes: FullNode[],
  adj: Map<string, string[]>,
  nodeMap: Map<string, GraphNode> = toGraphNodeMap(nodes)
): Basin[] {
  const grouped = new Map<string, Basin>();

  for (const node of nodes) {
    const result = simulate(node.node_id, adj, nodeMap);
    const { key, cycle } = resolveAttractorKey(result);
    const basin = grouped.get(key) ?? {
      attractorKey: key,
      attractorCycle: cycle,
      members: []
    };

    basin.members.push(node.node_id);
    grouped.set(key, basin);
  }

  return [...grouped.values()].sort((a, b) => b.members.length - a.members.length);
}
