import type { FastifyInstance } from "fastify";
import { createRangeJob, getRangeJob } from "../services/jobs.js";
import type { RangeJobRequest } from "../services/jobs.js";

export async function registerJobRoutes(fastify: FastifyInstance) {
  fastify.post("/api/jobs/range", async (request, reply) => {
    try {
      const job = createRangeJob(request.body as RangeJobRequest);
      return reply.status(202).send({ job });
    } catch (error) {
      return reply.status(400).send({
        error: "InvalidJobRequest",
        message: (error as Error).message,
      });
    }
  });

  fastify.get("/api/jobs/range/:id", async (request, reply) => {
    const job = getRangeJob((request.params as { id: string }).id);
    if (!job) {
      return reply.status(404).send({ error: "NotFound" });
    }
    return { job };
  });
}

