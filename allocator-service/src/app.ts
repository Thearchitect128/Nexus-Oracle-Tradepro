import Fastify from "fastify";
import { registerAllocateRoute } from "./routes/allocate";

export async function buildApp() {
  const app = Fastify({ logger: true });
  await registerAllocateRoute(app);
  return app;
}
