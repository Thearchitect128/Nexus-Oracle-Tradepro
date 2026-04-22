import { z } from "zod";

export const ItemSchema = z.object({
  id: z.string().min(1),
  risk: z.number().min(0).max(1),
  requiredTags: z.array(z.string()).optional(),
  region: z.string().optional(),
  latencySensitivity: z.number().min(0).max(1).optional(),
});

export const NodeSchema = z.object({
  id: z.string().min(1),
  capacity: z.number().int().nonnegative(),
  used: z.number().int().nonnegative(),
  tags: z.array(z.string()).optional(),
  region: z.string().optional(),
  load: z.number().min(0).max(1).optional(),
});

export const AllocateRequestSchema = z.object({
  items: z.array(ItemSchema),
  nodes: z.array(NodeSchema),
  timeoutMs: z.number().int().positive().max(10_000).optional(),
});
