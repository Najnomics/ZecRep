import type { FastifyInstance } from "fastify";
import { loadEnv } from "../config/index.js";

export async function registerHealthRoutes(fastify: FastifyInstance) {
  const env = loadEnv();
  fastify.get("/health", async () => ({
    status: "ok",
    env: {
      port: env.PORT,
      logLevel: env.LOG_LEVEL,
    },
    timestamp: new Date().toISOString(),
  }));
}

