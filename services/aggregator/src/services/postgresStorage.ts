/**
 * PostgreSQL storage implementation for aggregator service.
 * 
 * Provides persistent storage for jobs and tiers using PostgreSQL.
 */

import { Pool, type PoolClient } from "pg";
import { logger } from "../lib/logger.js";
import type { StorableJob, StorableTier, IStorage } from "./storage.js";

export class PostgresStorage implements IStorage {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on("error", (err) => {
      logger.error({ err }, "PostgreSQL pool error");
    });
  }

  async initialize(): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Create jobs table
      await client.query(`
        CREATE TABLE IF NOT EXISTS jobs (
          id VARCHAR(255) PRIMARY KEY,
          status VARCHAR(50) NOT NULL,
          address VARCHAR(42) NOT NULL,
          viewing_key TEXT NOT NULL,
          tier VARCHAR(20) NOT NULL,
          proof_hash VARCHAR(66) NOT NULL,
          submitted_at TIMESTAMP NOT NULL,
          updated_at TIMESTAMP NOT NULL,
          result JSONB,
          error TEXT
        )
      `);

      // Create tier_history table
      await client.query(`
        CREATE TABLE IF NOT EXISTS tier_history (
          id SERIAL PRIMARY KEY,
          address VARCHAR(42) NOT NULL,
          tier VARCHAR(20) NOT NULL,
          score INTEGER NOT NULL,
          encrypted_total TEXT NOT NULL,
          volume_zats BIGINT NOT NULL,
          updated_at TIMESTAMP NOT NULL
        )
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_jobs_address ON jobs(address);
        CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
        CREATE INDEX IF NOT EXISTS idx_jobs_updated_at ON jobs(updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_tier_history_address ON tier_history(address);
        CREATE INDEX IF NOT EXISTS idx_tier_history_updated_at ON tier_history(updated_at DESC);
      `);

      logger.info("PostgreSQL storage initialized");
    } finally {
      client.release();
    }
  }

  async saveJob(job: StorableJob): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO jobs (id, status, address, viewing_key, tier, proof_hash, submitted_at, updated_at, result, error)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           updated_at = EXCLUDED.updated_at,
           result = EXCLUDED.result,
           error = EXCLUDED.error`,
        [
          job.id,
          job.status,
          job.address.toLowerCase(),
          job.viewingKey,
          job.tier,
          job.proofHash,
          job.submittedAt,
          job.updatedAt,
          job.result ? JSON.stringify(job.result) : null,
          job.error ?? null,
        ]
      );
      logger.debug({ jobId: job.id, status: job.status }, "Saved job to PostgreSQL");
    } finally {
      client.release();
    }
  }

  async getJob(id: string): Promise<StorableJob | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM jobs WHERE id = $1`,
        [id]
      );
      if (result.rows.length === 0) return null;
      return this.rowToJob(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async listJobs(filters?: {
    address?: string;
    status?: string;
    limit?: number;
  }): Promise<StorableJob[]> {
    const client = await this.pool.connect();
    try {
      let query = "SELECT * FROM jobs WHERE 1=1";
      const params: unknown[] = [];
      let paramIndex = 1;

      if (filters?.address) {
        query += ` AND address = $${paramIndex}`;
        params.push(filters.address.toLowerCase());
        paramIndex++;
      }

      if (filters?.status) {
        query += ` AND status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      query += " ORDER BY updated_at DESC";

      if (filters?.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(filters.limit);
      }

      const result = await client.query(query, params);
      return result.rows.map((row) => this.rowToJob(row));
    } finally {
      client.release();
    }
  }

  async updateJob(id: string, updates: Partial<StorableJob>): Promise<void> {
    const client = await this.pool.connect();
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (updates.status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(updates.status);
      }
      if (updates.tier !== undefined) {
        fields.push(`tier = $${paramIndex++}`);
        values.push(updates.tier);
      }
      if (updates.proofHash !== undefined) {
        fields.push(`proof_hash = $${paramIndex++}`);
        values.push(updates.proofHash);
      }
      if (updates.result !== undefined) {
        fields.push(`result = $${paramIndex++}`);
        values.push(updates.result ? JSON.stringify(updates.result) : null);
      }
      if (updates.error !== undefined) {
        fields.push(`error = $${paramIndex++}`);
        values.push(updates.error ?? null);
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      await client.query(
        `UPDATE jobs SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
        values
      );
      logger.debug({ jobId: id, updates }, "Updated job in PostgreSQL");
    } finally {
      client.release();
    }
  }

  async saveTier(tier: StorableTier): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO tier_history (address, tier, score, encrypted_total, volume_zats, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          tier.address.toLowerCase(),
          tier.tier,
          tier.score,
          tier.encryptedTotal,
          tier.volumeZats,
          tier.updatedAt,
        ]
      );
      logger.debug({ address: tier.address, tier: tier.tier }, "Saved tier to PostgreSQL");
    } finally {
      client.release();
    }
  }

  async getTier(address: string): Promise<StorableTier | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM tier_history WHERE address = $1 ORDER BY updated_at DESC LIMIT 1`,
        [address.toLowerCase()]
      );
      if (result.rows.length === 0) return null;
      return this.rowToTier(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getTierHistory(address: string, limit = 10): Promise<StorableTier[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM tier_history WHERE address = $1 ORDER BY updated_at DESC LIMIT $2`,
        [address.toLowerCase(), limit]
      );
      return result.rows.map((row) => this.rowToTier(row));
    } finally {
      client.release();
    }
  }

  async cleanupOldJobs(maxAge: number): Promise<number> {
    const client = await this.pool.connect();
    try {
      const cutoff = new Date(Date.now() - maxAge);
      const result = await client.query(
        `DELETE FROM jobs WHERE updated_at < $1`,
        [cutoff]
      );
      logger.info({ deleted: result.rowCount }, "Cleaned up old jobs");
      return result.rowCount ?? 0;
    } finally {
      client.release();
    }
  }

  async getStats(): Promise<{
    totalJobs: number;
    jobsByStatus: Record<string, number>;
    totalTiers: number;
    tiersByTier: Record<string, number>;
  }> {
    const client = await this.pool.connect();
    try {
      const [jobsResult, tiersResult] = await Promise.all([
        client.query(`SELECT status, COUNT(*) as count FROM jobs GROUP BY status`),
        client.query(`SELECT tier, COUNT(DISTINCT address) as count FROM tier_history GROUP BY tier`),
      ]);

      const jobsByStatus: Record<string, number> = {};
      let totalJobs = 0;
      for (const row of jobsResult.rows) {
        jobsByStatus[row.status] = Number.parseInt(row.count, 10);
        totalJobs += Number.parseInt(row.count, 10);
      }

      const tiersByTier: Record<string, number> = {};
      let totalTiers = 0;
      for (const row of tiersResult.rows) {
        tiersByTier[row.tier] = Number.parseInt(row.count, 10);
        totalTiers += Number.parseInt(row.count, 10);
      }

      return {
        totalJobs,
        jobsByStatus,
        totalTiers,
        tiersByTier,
      };
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  private rowToJob(row: {
    id: string;
    status: string;
    address: string;
    viewing_key: string;
    tier: string;
    proof_hash: string;
    submitted_at: string;
    updated_at: string;
    result: string | null;
    error: string | null;
  }): StorableJob {
    return {
      id: row.id,
      status: row.status as StorableJob["status"],
      address: row.address,
      viewingKey: row.viewing_key,
      tier: row.tier,
      proofHash: row.proof_hash,
      submittedAt: row.submitted_at,
      updatedAt: row.updated_at,
      result: row.result ? JSON.parse(row.result) : undefined,
      error: row.error ?? undefined,
    };
  }

  private rowToTier(row: {
    address: string;
    tier: string;
    score: number;
    encrypted_total: string;
    volume_zats: number;
    updated_at: string;
  }): StorableTier {
    return {
      address: row.address,
      tier: row.tier,
      score: row.score,
      encryptedTotal: row.encrypted_total,
      volumeZats: Number(row.volume_zats),
      updatedAt: row.updated_at,
    };
  }
}

