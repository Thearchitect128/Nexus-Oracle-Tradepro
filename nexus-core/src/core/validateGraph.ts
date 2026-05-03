import { Node } from "./parseNodeMap.js";

export function validateGraph(nodes: Node[]): void {
  const idSet = new Set<string>();
  const labelSet = new Set<string>();
  let centralCount = 0;

  for (const node of nodes) {
    if (idSet.has(node.node_id)) {
      throw new Error(`Duplicate node_id: ${node.node_id}`);
    }
    idSet.add(node.node_id);

    if (labelSet.has(node.label)) {
      console.warn(`Duplicate label: ${node.label}`);
    }
    labelSet.add(node.label);

    if (node.weight < 0 || node.weight > 1) {
      throw new Error(`Invalid weight: ${node.node_id}`);
    }

    if (node.type === "central") {
      centralCount += 1;
      if (node.node_id !== "C01") {
        throw new Error(`Invalid central node: ${node.node_id}`);
      }
    }

    if (node.dormant && node.weight >= 0.8) {
      throw new Error(`Dormant node too strong: ${node.node_id}`);
    }

    if (node.type === "cluster") {
      const expectedPrefix = node.guardian[0];
      if (!node.node_id.startsWith(expectedPrefix)) {
        throw new Error(`Guardian mismatch: ${node.node_id}`);
      }
    }

    if (node.x < 0 || node.x > 100 || node.y < 0 || node.y > 100) {
      throw new Error(`Out-of-bounds coordinates: ${node.node_id}`);
    }
  }

  if (centralCount !== 1) {
    throw new Error(`Expected 1 central node, found ${centralCount}`);
  }
}
