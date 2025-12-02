import crypto from "node:crypto";
import { z } from "zod";

const RangeJobSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]),
  proofHash: z.string().min(4),
});

export type RangeJobRequest = z.infer<typeof RangeJobSchema>;

export type JobStatus = "pending" | "processing" | "completed";

export type RangeJob = {
  id: string;
  status: JobStatus;
  submittedAt: string;
  result?: {
    encryptedPayload: string;
  };
} & RangeJobRequest;

const jobs = new Map<string, RangeJob>();

export function createRangeJob(input: RangeJobRequest): RangeJob {
  const parsed = RangeJobSchema.parse(input);
  const id = crypto.randomUUID();
  const job: RangeJob = {
    id,
    status: "pending",
    submittedAt: new Date().toISOString(),
    ...parsed,
  };
  jobs.set(id, job);
  // For now immediately mark as completed to keep flow simple.
  setTimeout(() => {
    const existing = jobs.get(id);
    if (existing && existing.status === "pending") {
      existing.status = "completed";
      existing.result = {
        encryptedPayload: `fhe://mock/${id.slice(0, 6)}`,
      };
      jobs.set(id, existing);
    }
  }, 100);
  return job;
}

export function getRangeJob(id: string): RangeJob | undefined {
  return jobs.get(id);
}

