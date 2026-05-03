import type { AllocateRequest, AllocateResponse } from "../domain/types";
import { canAssign, edgeCost } from "../domain/cost";
import { normalizeRequest } from "../domain/normalize";
import { sha256Json } from "../lib/hash";
import { MinCostMaxFlow } from "./mcmf";

export function allocate(input: AllocateRequest): AllocateResponse {
  const req = normalizeRequest(input);
  const requestHash = sha256Json(req);

  const itemCount = req.items.length;
  const nodeCount = req.nodes.length;
  const totalNodes = itemCount + nodeCount + 2;
  const SRC = totalNodes - 2;
  const SNK = totalNodes - 1;

  const mcmf = new MinCostMaxFlow(totalNodes);

  req.items.forEach((_, i) => mcmf.addEdge(SRC, i, 1, 0));

  req.items.forEach((item, i) => {
    req.nodes.forEach((node, j) => {
      if (!canAssign(item, node)) return;
      mcmf.addEdge(i, itemCount + j, 1, edgeCost(item, node));
    });
  });

  req.nodes.forEach((node, j) => {
    const remaining = Math.max(0, node.capacity - node.used);
    if (remaining > 0) {
      mcmf.addEdge(itemCount + j, SNK, remaining, 0);
    }
  });

  const { flow, cost } = mcmf.run(SRC, SNK);

  const assignments: Record<string, string> = {};
  req.items.forEach((item, i) => {
    for (const e of mcmf.graph[i]) {
      if (e.to >= itemCount && e.to < itemCount + nodeCount && e.cap === 0) {
        assignments[item.id] = req.nodes[e.to - itemCount].id;
        break;
      }
    }
  });

  return {
    assignments,
    flow,
    cost,
    deterministic: true,
    requestHash,
  };
}
