import type { FastifyInstance } from "fastify";
import { AllocateRequestSchema } from "../domain/validate";
import { allocate } from "../solver/allocate";
import { withTimeout } from "../lib/timeout";

export async function registerAllocateRoute(app: FastifyInstance): Promise<void> {
  app.post("/v1/allocate", async (request, reply) => {
    const parsed = AllocateRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_INPUT",
        details: parsed.error.flatten(),
      });
    }

    const timeoutMs = parsed.data.timeoutMs ?? 2000;

    try {
      const result = await withTimeout(Promise.resolve(allocate(parsed.data)), timeoutMs);

      if (result.flow === 0) {
        return reply.status(422).send({
          error: "INFEASIBLE",
          ...result,
        });
      }

      return reply.status(200).send(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
      if (message === "REQUEST_TIMEOUT") {
        return reply.status(504).send({ error: "TIMEOUT" });
      }
      request.log.error({ err }, "allocation_failed");
      return reply.status(500).send({ error: "INTERNAL_ERROR" });
    }
  });
}
