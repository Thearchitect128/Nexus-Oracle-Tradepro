import type { AllocateRequest, Item, Node } from "./types";

function sortTags(tags?: string[]): string[] | undefined {
  return tags ? [...tags].sort() : undefined;
}

export function normalizeRequest(input: AllocateRequest): AllocateRequest {
  const items: Item[] = [...input.items]
    .map((i) => ({ ...i, requiredTags: sortTags(i.requiredTags) }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const nodes: Node[] = [...input.nodes]
    .map((n) => ({ ...n, tags: sortTags(n.tags) }))
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    items,
    nodes,
    timeoutMs: input.timeoutMs ?? 2000,
  };
}
