import type { TierData, RangeJob, ProofInput } from "../types.js";
import type { JobStatus } from "../types.js";

/**
 * Client for interacting with the ZecRep aggregator service.
 * Handles tier queries, job submission, and status polling.
 */
export class AggregatorClient {
  constructor(private baseUrl: string) {}

  /**
   * Fetch tier data for an Ethereum address.
   */
  async getTier(address: string): Promise<TierData> {
    const response = await fetch(`${this.baseUrl}/api/reputation/tier?address=${address}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tier: ${response.statusText}`);
    }
    const data = (await response.json()) as { data: TierData };
    return data.data;
  }

  /**
   * Check if an address meets a minimum tier requirement.
   */
  async meetsTier(address: string, minimumTier: string): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/api/reputation/guards/meets-tier?address=${address}&minimumTier=${minimumTier}`
    );
    if (!response.ok) {
      throw new Error(`Failed to check tier: ${response.statusText}`);
    }
    const data = (await response.json()) as { meets: boolean };
    return data.meets;
  }

  /**
   * Submit a range proof job.
   */
  async submitRangeJob(input: ProofInput): Promise<RangeJob> {
    const response = await fetch(`${this.baseUrl}/api/jobs/range`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: input.address,
        viewingKey: input.viewingKey,
        tier: input.tier,
        proofHash: input.proofHash,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit job: ${response.statusText}`);
    }

    const data = (await response.json()) as { job: RangeJob };
    return data.job;
  }

  /**
   * Poll job status by ID.
   */
  async getJobStatus(jobId: string): Promise<RangeJob> {
    const response = await fetch(`${this.baseUrl}/api/jobs/range/${jobId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch job: ${response.statusText}`);
    }
    const data = (await response.json()) as { job: RangeJob };
    return data.job;
  }

  /**
   * List recent jobs with optional filters.
   */
  async listJobs(params?: { address?: string; status?: JobStatus; limit?: number }): Promise<RangeJob[]> {
    const search = new URLSearchParams();
    if (params?.address) search.set("address", params.address);
    if (params?.status) search.set("status", params.status);
    if (params?.limit) search.set("limit", params.limit.toString());

    const query = search.toString();
    const response = await fetch(`${this.baseUrl}/api/jobs${query ? `?${query}` : ""}`);
    if (!response.ok) {
      throw new Error(`Failed to list jobs: ${response.statusText}`);
    }
    const data = (await response.json()) as { jobs: RangeJob[] };
    return data.jobs;
  }

  /**
   * Get tier-based multipliers for an address.
   */
  async getMultipliers(address: string) {
    const response = await fetch(
      `${this.baseUrl}/api/reputation/guards/multipliers?address=${address}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch multipliers: ${response.statusText}`);
    }
    return (await response.json()) as {
      address: string;
      tier: string;
      multipliers: {
        feeDiscount: number;
        ltvBoostBps: number;
        voteWeight: number;
        yield: number;
      };
    };
  }

  async getTierHistory(address: string, limit = 10) {
    const response = await fetch(
      `${this.baseUrl}/api/reputation/history?address=${address}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch tier history: ${response.statusText}`);
    }
    const data = (await response.json()) as { data: Array<{ tier: string; score: number; updatedAt: string }> };
    return data.data;
  }
}

