import type { Item, Node } from "./types.js";

export function canAssign(item: Item, node: Node): boolean {
  if (node.used >= node.capacity) return false;
  if (!item.requiredTags?.length) return true;
  const tags = new Set(node.tags ?? []);
  return item.requiredTags.every((tag: string) => tags.has(tag));
}

export function edgeCost(item: Item, node: Node): number {
  if (!canAssign(item, node)) return Number.POSITIVE_INFINITY;

  const initialUsed = node.used;
  const initialLoad = node.capacity === 0 ? 1 : initialUsed / node.capacity;
  const riskPriority = -Math.round(item.risk * 1000);
  const loadPenalty = Math.round(initialLoad * 100);
  const latencyPenalty = Math.round(
    (item.latencySensitivity ?? 0) * initialLoad * 100
  );
  const regionPenalty =
    item.region && node.region && item.region !== node.region ? 10_000 : 0;

  return riskPriority + loadPenalty + latencyPenalty + regionPenalty;
}

export function finiteEdgeCost(item: Item, node: Node): number | null {
  const cost = edgeCost(item, node);
  return Number.isFinite(cost) ? cost : null;
}
