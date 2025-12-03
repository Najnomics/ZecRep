import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { TierQuerySchema, fetchTier, fetchTierHistory } from "../services/tiers.js";

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

  const TierHistorySchema = TierQuerySchema.extend({
    limit: z.coerce.number().int().min(1).max(50).default(10),
  });

  fastify.get("/api/reputation/history", async (request, reply) => {
    const parsed = TierHistorySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "InvalidQuery",
        details: parsed.error.format(),
      });
    }

    const history = await fetchTierHistory(parsed.data.address, parsed.data.limit);
    return { data: history };
  });
}

