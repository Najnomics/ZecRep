import Fastify from "fastify";
import cors from "@fastify/cors";
import { loadEnv } from "./config/index.js";
import { logger } from "./lib/logger.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerTierRoutes } from "./routes/tiers.js";
import { registerJobRoutes } from "./routes/jobs.js";
import { registerGuardRoutes } from "./routes/guards.js";
import { registerMetricsRoutes } from "./routes/metrics.js";
import { registerWebhookRoutes } from "./routes/webhooks.js";
import { registerStatsRoutes } from "./routes/stats.js";

export async function buildServer() {
  const env = loadEnv();
  const server = Fastify({
    logger,
  });

  await server.register(cors, {
    origin: true,
  });

  await server.register(registerHealthRoutes);
  await server.register(registerTierRoutes);
  await server.register(registerJobRoutes);
  await server.register(registerGuardRoutes);
  await server.register(registerMetricsRoutes);
  await server.register(registerWebhookRoutes);
  await server.register(registerStatsRoutes);

  server.get("/", async () => ({
    name: "ZecRep Aggregator",
    version: "0.1.0",
    message: "Bridge shielded reputation into Ethereum.",
  }));

  const start = async () => {
    try {
      await server.listen({ host: "0.0.0.0", port: env.PORT });
      logger.info({ port: env.PORT }, "Aggregator service listening");
    } catch (err) {
      server.log.error(err);
      process.exit(1);
    }
  };

  if (process.env.NODE_ENV !== "test") {
    start();
  }

  return server;
}

