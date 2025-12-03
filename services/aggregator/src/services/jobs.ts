import crypto from "node:crypto";
import { z } from "zod";
import { storage } from "./storage.js";
import type { StorableJob } from "./storage.js";
import { recordJobCompleted } from "../lib/metrics.js";
import { tierScoreMap } from "./tiers.js";

/**
 * Range proof job orchestration for ZecRep.
 * 
 * Coordinates with Cofhe/Fhenix async encryption workflow per:
 * - CONTEXT/cofhe-docs/docs/devdocs/architecture/data-flows/encryption-request.md
 * - CONTEXT/cofhe-docs/docs/devdocs/tutorials/migrating-to-cofhe.md
 * 
 * Jobs follow the pattern:
 * 1. User submits proof hash + tier → job created (pending)
 * 2. Aggregator forwards to Cofhe gateway for encryption (processing)
 * 3. Gateway completes encryption → job completed with ciphertext handle
 */

const RangeJobSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  viewingKey: z.string().min(1, "Viewing key required"),
  tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).optional(),
  proofHash: z.string().optional(),
  encryptedTotal: z.string().optional(), // inEuint64.data format
});

export type RangeJobRequest = z.infer<typeof RangeJobSchema>;

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type RangeJob = StorableJob;

/**
 * Creates a new range proof job.
 * In production, this will coordinate with Cofhe gateway for async encryption.
 */
export async function createRangeJob(input: RangeJobRequest): Promise<RangeJob> {
  const parsed = RangeJobSchema.parse(input);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const job: StorableJob = {
    id,
    status: "pending",
    submittedAt: now,
    updatedAt: now,
    address: parsed.address,
    viewingKey: parsed.viewingKey,
    tier: parsed.tier ?? "BRONZE",
    proofHash: parsed.proofHash ?? `0x${crypto.randomBytes(32).toString("hex")}`,
    result: undefined,
  };

  await storage.saveJob(job);

  // Job processor will handle async processing
  // No need for setTimeout - processor polls pending jobs

  return job;
}

export async function getRangeJob(id: string): Promise<RangeJob | null> {
  return storage.getJob(id);
}

export async function listRangeJobs(filters?: {
  address?: string;
  status?: JobStatus;
  limit?: number;
}): Promise<RangeJob[]> {
  return storage.listJobs(filters);
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
  result?: RangeJob["result"],
  error?: string
): Promise<boolean> {
  const job = await storage.getJob(id);
  if (!job) return false;

  await storage.updateJob(id, {
    status,
    result: result ?? job.result,
    error,
  });

  return true;
}

