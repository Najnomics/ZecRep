import { fetch } from "undici";
import type { ProverEnv } from "../config.js";
import type { ProofArtifact } from "../pipeline/mockRange.js";

export type RangeJobResponse = {
  job: {
    id: string;
    status: string;
    submittedAt: string;
    result?: {
      encryptedPayload: string;
    };
  };
};

export async function submitRangeJob(env: ProverEnv, artifact: ProofArtifact) {
  const res = await fetch(`${env.AGGREGATOR_URL}/api/jobs/range`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      address: artifact.address,
      tier: artifact.tier,
      proofHash: artifact.proofHash,
    }),
  });
  if (!res.ok) {
    throw new Error(`Aggregator job failed: ${res.statusText}`);
  }
  return (await res.json()) as RangeJobResponse;
}

export async function pollRangeJob(env: ProverEnv, id: string) {
  const res = await fetch(`${env.AGGREGATOR_URL}/api/jobs/range/${id}`);
  if (!res.ok) {
    throw new Error(`Job poll failed: ${res.statusText}`);
  }
  return (await res.json()) as RangeJobResponse;
}

