import type { FastifyInstance } from "fastify";
import { createRangeJob, getRangeJob } from "../services/jobs.js";
import type { RangeJobRequest } from "../services/jobs.js";
import { recordJobCreated, recordJobCompleted } from "../lib/metrics.js";

/**
 * Job management routes for range proof orchestration.
 * 
 * POST /api/jobs/range - Create a new range proof job (returns 202 Accepted)
 * GET /api/jobs/range/:id - Poll job status (returns current job state)
 * 
 * Jobs coordinate with Cofhe gateway for async FHE encryption per:
 * CONTEXT/cofhe-docs/docs/devdocs/architecture/data-flows/encryption-request.md
 */
export async function registerJobRoutes(fastify: FastifyInstance) {
  fastify.post("/api/jobs/range", async (request, reply) => {
    try {
      const body = request.body as unknown;
      if (!body || typeof body !== "object") {
        return reply.status(400).send({
          error: "InvalidJobRequest",
          message: "Request body must be an object",
        });
      }
      
      const job = createRangeJob(body as RangeJobRequest);
      
      // Record metrics
      recordJobCreated(job.tier);
      
      // 202 Accepted - job created, processing asynchronously
      return reply.status(202).send({ job });
    } catch (error) {
      fastify.log.error(error, "Failed to create range job");
      return reply.status(400).send({
        error: "InvalidJobRequest",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  fastify.get("/api/jobs/range/:id", async (request, reply) => {
    const params = request.params as { id: string };
    const jobId = params.id;
    
    if (!jobId || typeof jobId !== "string") {
      return reply.status(400).send({
        error: "InvalidJobId",
        message: "Job ID must be a valid string",
      });
    }
    
    const job = getRangeJob(jobId);
    if (!job) {
      return reply.status(404).send({
        error: "NotFound",
        message: `Job with ID ${jobId} not found`,
      });
    }
    
    return { job };
  });
}

