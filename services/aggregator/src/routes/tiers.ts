import type { FastifyInstance } from "fastify";
import { TierQuerySchema, fetchTier } from "../services/tiers.js";
import { storage } from "../services/storage.js";

export async function registerTierRoutes(fastify: FastifyInstance) {
  fastify.get("/api/reputation/tier", async (request, reply) => {
    const parsed = TierQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "InvalidQuery",
        details: parsed.error.format(),
      });
    }
    const result = await fetchTier(parsed.data.address);
    return { data: result };
  });

  fastify.get("/api/reputation/history", async (request, reply) => {
    const parsed = TierQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "InvalidQuery",
        details: parsed.error.format(),
      });
    }

    const history = await storage.getTierHistory(parsed.data.address, 10);
    return { data: history };
  });
}

