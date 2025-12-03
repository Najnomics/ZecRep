import crypto from "node:crypto";
import { z } from "zod";
import { storage } from "./storage.js";
import type { StorableJob } from "./storage.js";
import { recordJobCompleted } from "../lib/metrics.js";

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
  tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]),
  proofHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid proof hash (expected 32 bytes hex)"),
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
    tier: parsed.tier,
    proofHash: parsed.proofHash,
    result: undefined,
  };

  await storage.saveJob(job);

  // TODO: Replace with Cofhe gateway integration
  setTimeout(async () => {
    const existing = await storage.getJob(id);
    if (existing && existing.status === "pending") {
      await storage.updateJob(id, {
        status: "completed",
        result: {
          encryptedPayload: `fhe://mock/${id.slice(0, 8)}`,
          inEuint64: {
            data: `0x${crypto.randomBytes(32).toString("hex")}`,
            securityZone: 0,
          },
        },
      });
      recordJobCompleted(existing.tier, 0.5);
    }
  }, 500);

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

