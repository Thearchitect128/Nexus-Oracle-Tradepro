import type { Node } from "../parseNodeMap.js";

export type Edge = {
  from: string;
  to: string;
};

function squaredDistance(a: Node, b: Node): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function generateEdges(nodes: Node[]): Edge[] {
  if (nodes.length < 2) {
    return [];
  }

  return nodes.map((node) => {
    const candidates = nodes
      .filter((other) => other.node_id !== node.node_id && !other.dormant)
      .sort((a, b) => {
        const byDistance = squaredDistance(node, a) - squaredDistance(node, b);
        if (byDistance !== 0) {
          return byDistance;
        }

        if (a.weight !== b.weight) {
          return b.weight - a.weight;
        }

        return a.node_id.localeCompare(b.node_id);
      });

    const next = candidates[0];
    if (!next) {
      throw new Error(`No valid outgoing edge candidate for ${node.node_id}`);
    }

    return { from: node.node_id, to: next.node_id };
  });
}

export function validateEdges(edges: Edge[], nodes: Node[]): void {
  const known = new Set(nodes.map((node) => node.node_id));
  const outgoing = new Map<string, number>();

  for (const edge of edges) {
    if (!known.has(edge.from)) {
      throw new Error(`Edge has unknown source node: ${edge.from}`);
    }
    if (!known.has(edge.to)) {
      throw new Error(`Edge has unknown target node: ${edge.to}`);
    }

    outgoing.set(edge.from, (outgoing.get(edge.from) ?? 0) + 1);
  }

  for (const node of nodes) {
    if ((outgoing.get(node.node_id) ?? 0) === 0) {
      throw new Error(`Missing outgoing edge for node: ${node.node_id}`);
    }
  }
}

export function buildAdjacency(edges: Edge[]): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();

  for (const edge of edges) {
    const current = adjacency.get(edge.from) ?? [];
    current.push(edge.to);
    adjacency.set(edge.from, current);
  }

  return adjacency;
}
