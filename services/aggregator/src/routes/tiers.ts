import type { FastifyInstance } from "fastify";
import { TierQuerySchema, fetchMockTier } from "../services/tiers.js";

export async function registerTierRoutes(fastify: FastifyInstance) {
  fastify.get("/api/reputation/tier", async (request, reply) => {
    const parsed = TierQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "InvalidQuery",
        details: parsed.error.format(),
      });
    }
    const result = await fetchMockTier(parsed.data.address);
    return { data: result };
  });
}

