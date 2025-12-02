/**
 * Storage abstraction for aggregator service.
 * 
 * Currently in-memory, but provides interface for future database integration.
 * TODO: Implement PostgreSQL/Redis backend.
 */

import { logger } from "../lib/logger.js";

export type StorableJob = {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  address: string;
  tier: string;
  proofHash: string;
  submittedAt: string;
  updatedAt: string;
  encryptedPayload?: string;
  encryptedTotal?: string;
  error?: string;
};

export type StorableTier = {
  address: string;
  tier: string;
  score: number;
  encryptedTotal: string;
  volumeZats: number;
  updatedAt: string;
};

/**
 * In-memory storage implementation.
 * TODO: Replace with PostgreSQL/Redis for production.
 */
class MemoryStorage {
  private jobs = new Map<string, StorableJob>();
  private tiers = new Map<string, StorableTier>();
  private tierHistory = new Map<string, StorableTier[]>();

  // Job operations
  async saveJob(job: StorableJob): Promise<void> {
    this.jobs.set(job.id, job);
    logger.debug({ jobId: job.id, status: job.status }, "Saved job to storage");
  }

  async getJob(id: string): Promise<StorableJob | null> {
    return this.jobs.get(id) ?? null;
  }

  async listJobs(filters?: {
    address?: string;
    status?: string;
    limit?: number;
  }): Promise<StorableJob[]> {
    let jobs = Array.from(this.jobs.values());

    if (filters?.address) {
      jobs = jobs.filter((j) => j.address.toLowerCase() === filters.address!.toLowerCase());
    }

    if (filters?.status) {
      jobs = jobs.filter((j) => j.status === filters.status);
    }

    // Sort by updatedAt descending
    jobs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    if (filters?.limit) {
      jobs = jobs.slice(0, filters.limit);
    }

    return jobs;
  }

  async updateJob(id: string, updates: Partial<StorableJob>): Promise<void> {
    const job = this.jobs.get(id);
    if (!job) {
      throw new Error(`Job not found: ${id}`);
    }

    const updated = {
      ...job,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(id, updated);
    logger.debug({ jobId: id, updates }, "Updated job in storage");
  }

  // Tier operations
  async saveTier(tier: StorableTier): Promise<void> {
    this.tiers.set(tier.address.toLowerCase(), tier);

    // Add to history
    const history = this.tierHistory.get(tier.address.toLowerCase()) ?? [];
    history.push(tier);
    
    // Keep last 100 entries
    if (history.length > 100) {
      history.shift();
    }
    
    this.tierHistory.set(tier.address.toLowerCase(), history);

    logger.debug({ address: tier.address, tier: tier.tier }, "Saved tier to storage");
  }

  async getTier(address: string): Promise<StorableTier | null> {
    return this.tiers.get(address.toLowerCase()) ?? null;
  }

  async getTierHistory(address: string, limit = 10): Promise<StorableTier[]> {
    const history = this.tierHistory.get(address.toLowerCase()) ?? [];
    return history.slice(-limit).reverse(); // Most recent first
  }

  // Cleanup operations
  async cleanupOldJobs(maxAge: number): Promise<number> {
    const cutoff = Date.now() - maxAge;
    let deleted = 0;

    for (const [id, job] of this.jobs.entries()) {
      if (new Date(job.updatedAt).getTime() < cutoff) {
        this.jobs.delete(id);
        deleted++;
      }
    }

    logger.info({ deleted }, "Cleaned up old jobs");
    return deleted;
  }

  // Stats
  async getStats(): Promise<{
    totalJobs: number;
    jobsByStatus: Record<string, number>;
    totalTiers: number;
    tiersByTier: Record<string, number>;
  }> {
    const jobs = Array.from(this.jobs.values());
    const tiers = Array.from(this.tiers.values());

    const jobsByStatus: Record<string, number> = {};
    for (const job of jobs) {
      jobsByStatus[job.status] = (jobsByStatus[job.status] ?? 0) + 1;
    }

    const tiersByTier: Record<string, number> = {};
    for (const tier of tiers) {
      tiersByTier[tier.tier] = (tiersByTier[tier.tier] ?? 0) + 1;
    }

    return {
      totalJobs: jobs.length,
      jobsByStatus,
      totalTiers: tiers.length,
      tiersByTier,
    };
  }
}

// Singleton instance
const storage = new MemoryStorage();

export { storage };

/**
 * Storage interface for future database implementations.
 */
export interface IStorage {
  saveJob(job: StorableJob): Promise<void>;
  getJob(id: string): Promise<StorableJob | null>;
  listJobs(filters?: { address?: string; status?: string; limit?: number }): Promise<StorableJob[]>;
  updateJob(id: string, updates: Partial<StorableJob>): Promise<void>;
  saveTier(tier: StorableTier): Promise<void>;
  getTier(address: string): Promise<StorableTier | null>;
  getTierHistory(address: string, limit?: number): Promise<StorableTier[]>;
}

