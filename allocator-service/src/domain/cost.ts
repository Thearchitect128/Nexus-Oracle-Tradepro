import type { Item, Node } from "./types";

export function canAssign(item: Item, node: Node): boolean {
  if (node.used >= node.capacity) return false;
  if (item.region && node.region && item.region !== node.region) return false;
  if (!item.requiredTags?.length) return true;
  const tags = new Set(node.tags ?? []);
  return item.requiredTags.every((t) => tags.has(t));
}

export function edgeCost(item: Item, node: Node): number {
  const initialUtilization = node.capacity === 0 ? 1 : node.used / node.capacity;

  const load = node.load ?? initialUtilization;
  const regionPenalty = item.region && node.region && item.region !== node.region ? 10_000 : 0;
  const latencyPenalty = Math.round((item.latencySensitivity ?? 0) * load * 100);
  const riskPriority = -Math.round(item.risk * 1000);

  return riskPriority + Math.round(load * 100) + latencyPenalty + regionPenalty;
}
