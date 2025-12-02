/**
 * Job processor for handling range proof jobs.
 * 
 * Orchestrates the async workflow:
 * 1. Receives job request
 * 2. Coordinates with prover/lightwalletd
 * 3. Monitors encryption job status
 * 4. Updates job status
 */

import { logger } from "../lib/logger.js";
import { storage, type StorableJob } from "./storage.js";
import { triggerWebhooks } from "../routes/webhooks.js";

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

    // TODO: Implement actual processing:
    // 1. Call prover to generate proof
    // 2. Submit encryption job to FHE gateway
    // 3. Poll encryption status
    // 4. Update job with encrypted result

    // For now, simulate async processing
    await simulateJobProcessing(jobId, encryptionTimeout);

    // Mark as completed
    await storage.updateJob(jobId, {
      status: "completed",
      encryptedPayload: `fhe://mock/${jobId}`,
      encryptedTotal: `0x${Buffer.from(jobId).toString("hex")}`,
    });

    logger.info({ jobId }, "Job processing completed");

    // Trigger webhook if tier upgrade
    await triggerWebhooks("badge_minted", {
      address: job.address,
      newTier: job.tier,
      score: 500, // TODO: Get from tier config
      proofHash: job.proofHash,
    });
  } catch (error) {
    logger.error({ error, jobId }, "Job processing failed");
    
    await storage.updateJob(jobId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Simulate async job processing (for development).
 */
async function simulateJobProcessing(jobId: string, timeout: number): Promise<void> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, Math.min(timeout, 5000)));
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

