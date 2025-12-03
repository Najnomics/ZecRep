/**
 * Job processor for handling range proof jobs.
 * 
 * Orchestrates the async workflow:
 * 1. Receives job request
 * 2. Coordinates with prover/lightwalletd
 * 3. Monitors encryption job status
 * 4. Updates job status
 */

import { fetch } from "undici";
import { logger } from "../lib/logger.js";
import { storage, type StorableJob } from "./storage.js";
import { triggerWebhooks } from "../routes/webhooks.js";
import { loadEnv } from "../config/index.js";

export type JobProcessorOptions = {
  encryptionTimeout?: number;
  maxRetries?: number;
};

/**
 * Process a range proof job asynchronously.
 */
export async function processRangeJob(
  jobId: string,
  options: JobProcessorOptions = {}
): Promise<void> {
  const { encryptionTimeout = 60000, maxRetries = 3 } = options;

  logger.info({ jobId }, "Starting job processing");

  try {
    const job = await storage.getJob(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Update status to processing
    await storage.updateJob(jobId, { status: "processing" });

    // Call prover service to generate proof and encrypt
    const env = loadEnv();
    const proverUrl = env.PROVER_URL || "http://localhost:4101";
    
    logger.info({ jobId, proverUrl }, "Calling prover service");
    
    const proverResponse = await fetch(`${proverUrl}/prove`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        address: job.address,
        viewingKey: job.viewingKey,
      }),
    });

    if (!proverResponse.ok) {
      const errorText = await proverResponse.text();
      throw new Error(`Prover service failed: ${proverResponse.status} ${errorText}`);
    }

    const proverResult = (await proverResponse.json()) as {
      success: boolean;
      artifact: {
        tier: string;
        proofHash: string;
        encryptedPayload: string;
        inEuint64: { data: string; securityZone: number };
        notesScanned: number;
      };
    };

    if (!proverResult.success || !proverResult.artifact) {
      throw new Error("Prover returned unsuccessful result");
    }

    // Update job with prover result
    await storage.updateJob(jobId, {
      status: "completed",
      tier: proverResult.artifact.tier,
      proofHash: proverResult.artifact.proofHash,
      result: {
        encryptedPayload: proverResult.artifact.encryptedPayload,
        inEuint64: proverResult.artifact.inEuint64,
      },
    });

    logger.info({ jobId }, "Job processing completed");

    // Get updated job to access final tier/proofHash
    const completedJob = await storage.getJob(jobId);
    if (completedJob) {
      // Trigger webhook if tier upgrade
      await triggerWebhooks("badge_minted", {
        address: completedJob.address,
        newTier: completedJob.tier,
        score: 500, // TODO: Get from tier config
        proofHash: completedJob.proofHash,
      });
    }
  } catch (error) {
    logger.error({ error, jobId }, "Job processing failed");
    
    await storage.updateJob(jobId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}


/**
 * Start processing pending jobs.
 */
export async function startJobProcessor(
  options: { pollInterval?: number } = {}
): Promise<() => void> {
  const { pollInterval = 5000 } = options;

  logger.info({ pollInterval }, "Starting job processor");

  const interval = setInterval(async () => {
    try {
      const pendingJobs = await storage.listJobs({ status: "pending", limit: 10 });

      for (const job of pendingJobs) {
        // Process jobs in parallel
        processRangeJob(job.id).catch((error) => {
          logger.error({ error, jobId: job.id }, "Failed to process job");
        });
      }
    } catch (error) {
      logger.error({ error }, "Error in job processor loop");
    }
  }, pollInterval);

  // Return stop function
  return () => {
    clearInterval(interval);
    logger.info("Stopped job processor");
  };
}

