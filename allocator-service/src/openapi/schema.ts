export const allocateSchema = {
  summary: "Allocate items to nodes using min-cost max-flow",
  tags: ["allocation"],
  body: {
    type: "object",
    required: ["items", "nodes"],
    properties: {
      items: { type: "array" },
      nodes: { type: "array" },
      timeoutMs: { type: "number" },
    },
  },
};
