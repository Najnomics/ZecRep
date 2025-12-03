import type { FastifyInstance } from "fastify";
import { register } from "../lib/metrics.js";

/**
 * Metrics endpoint for Prometheus scraping.
 * Exposes job counts, durations, tier queries, and error rates.
 */
export async function registerMetricsRoutes(fastify: FastifyInstance) {
  fastify.get("/metrics", async (request, reply) => {
    reply.header("Content-Type", register.contentType);
    return register.metrics();
  });
}

