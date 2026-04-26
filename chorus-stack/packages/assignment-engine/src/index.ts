import type { Assignment, AssignmentPolicy, NodeCapacity, WorkItem } from "../../shared-types/src/index.js";

function score(item: WorkItem, policy: AssignmentPolicy): number {
  if (policy === "priority_first") {
    return item.priority * 2 - item.risk;
  }
  if (policy === "risk_limited") {
    return item.confidence - item.risk;
  }
  return item.priority + item.confidence - item.risk;
}

function utilization(node: NodeCapacity & { used: number }): number {
  return node.capacity === 0 ? 1 : node.used / node.capacity;
}

export function constrainedBatchAssign(
  items: WorkItem[],
  nodes: NodeCapacity[],
  policy: AssignmentPolicy
): Assignment[] {
  const sortedItems = [...items].sort((a, b) => {
    if (policy === "risk_limited") {
      const aEligible = nodes.filter((node) => node.capacity > 0 && a.risk <= node.maxRisk).length;
      const bEligible = nodes.filter((node) => node.capacity > 0 && b.risk <= node.maxRisk).length;
      if (aEligible !== bEligible) {
        return aEligible - bEligible;
      }
      if (a.risk !== b.risk) {
        return b.risk - a.risk;
      }
    }

    const scoreDiff = score(b, policy) - score(a, policy);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return a.id.localeCompare(b.id);
  });

  const nodeState = nodes.map((n) => ({ ...n, used: 0 }));
  const assignments: Assignment[] = [];

  for (const item of sortedItems) {
    const candidate = nodeState
      .filter((node) => node.used < node.capacity && item.risk <= node.maxRisk)
      .sort((a, b) => {
        if (policy === "risk_limited" && a.maxRisk !== b.maxRisk) {
          return a.maxRisk - b.maxRisk;
        }

        const utilizationDiff = utilization(a) - utilization(b);
        if (utilizationDiff !== 0) {
          return utilizationDiff;
        }

        if (a.maxRisk !== b.maxRisk) {
          return a.maxRisk - b.maxRisk;
        }

        return a.nodeId.localeCompare(b.nodeId);
      })[0];

    if (!candidate) {
      continue;
    }

    candidate.used += 1;
    assignments.push({ itemId: item.id, nodeId: candidate.nodeId });
  }

  return assignments;
}
