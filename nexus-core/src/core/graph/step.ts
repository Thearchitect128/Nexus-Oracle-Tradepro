import type { Node } from "./parseNodeMap.js";
import type { RuntimeState } from "./runtimeState.js";

export function step(
  state: RuntimeState,
  adj: Map<string, string[]>,
  nodeMap: Map<string, Node>
): RuntimeState {
  const neighbors = adj.get(state.current) ?? [];
  if (neighbors.length === 0) {
    throw new Error(`Dead end at ${state.current}`);
  }

  let next = neighbors[0];
  let maxWeight = -Infinity;

  for (const neighbor of neighbors) {
    const node = nodeMap.get(neighbor);
    if (!node) {
      throw new Error(`Unknown neighbor node: ${neighbor}`);
    }

    if (node.weight > maxWeight) {
      maxWeight = node.weight;
      next = neighbor;
    }
  }

  return {
    current: next,
    steps: state.steps + 1,
    history: [...state.history, next]
  };
}
