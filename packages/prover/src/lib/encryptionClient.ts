/**
 * Enhanced FHE encryption client with async job support.
 * 
 * Supports both synchronous encryption (for small values) and
 * async encryption jobs via the Fhenix Cofhe gateway.
 */

import { fetch } from "undici";
import type { InEuint64 } from "./fhe.js";
import { formatInEuint64, mockInEuint64 } from "./fhe.js";
import { logger } from "./logger.js";

export type EncryptionJobStatus = "pending" | "processing" | "completed" | "failed";

export type EncryptionJob = {
  jobId: string;
  status: EncryptionJobStatus;
  encryptedValue?: InEuint64;
  error?: string;
  createdAt: string;
  completedAt?: string;
};

export type AsyncEncryptRequest = {
  value: string; // uint64 as string
  type: "euint64";
  registryAddress?: string; // Optional: encrypt for specific contract
};

export type AsyncEncryptResponse = {
  jobId: string;
  status: "pending";
  estimatedTime?: number; // seconds
};

export type JobStatusResponse = {
  jobId: string;
  status: EncryptionJobStatus;
  encryptedValue?: {
    ciphertext: string;
    securityZone?: number;
  };
  error?: string;
};

/**
 * Client for Fhenix Cofhe encryption gateway.
 */
export class EncryptionClient {
  constructor(private gatewayUrl: string) {
    // Remove trailing slash
    this.gatewayUrl = gatewayUrl.replace(/\/$/, "");
  }

  /**
   * Encrypt a value synchronously (for small values or quick operations).
   */
  async encryptSync(value: bigint | number, registryAddress?: string): Promise<InEuint64> {
    const num = typeof value === "bigint" ? value : BigInt(value);
    const request: AsyncEncryptRequest = {
      value: num.toString(),
      type: "euint64",
    };

    if (registryAddress) {
      request.registryAddress = registryAddress;
    }

    logger.debug({ value: num.toString(), registryAddress }, "Encrypting synchronously");

    try {
      const response = await fetch(`${this.gatewayUrl}/v1/encrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Fhenix encryption failed: ${response.status} ${text}`);
      }

      const result = (await response.json()) as {
        ciphertext: string;
        securityZone?: number;
      };

      const ciphertext = Buffer.from(result.ciphertext.replace(/^0x/, ""), "hex");
      return formatInEuint64(ciphertext, result.securityZone ?? 0);
    } catch (error) {
      logger.error({ error, value: num.toString() }, "Sync encryption failed, falling back to mock");
      // Fallback to mock for development
      return mockInEuint64(num);
    }
  }

  /**
   * Submit an async encryption job (for larger values or when async is required).
   */
  async encryptAsync(value: bigint | number, registryAddress?: string): Promise<EncryptionJob> {
    const num = typeof value === "bigint" ? value : BigInt(value);
    const request: AsyncEncryptRequest = {
      value: num.toString(),
      type: "euint64",
    };

    if (registryAddress) {
      request.registryAddress = registryAddress;
    }

    logger.info({ value: num.toString(), registryAddress }, "Submitting async encryption job");

    try {
      const response = await fetch(`${this.gatewayUrl}/v1/encrypt/async`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Failed to submit encryption job: ${response.status} ${text}`);
      }

      const result = (await response.json()) as AsyncEncryptResponse;

      return {
        jobId: result.jobId,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error({ error, value: num.toString() }, "Failed to submit async encryption job");
      throw error;
    }
  }

  /**
   * Poll job status until completion or timeout.
   */
  async pollJobStatus(
    jobId: string,
    options: { maxWait?: number; pollInterval?: number } = {}
  ): Promise<InEuint64> {
    const { maxWait = 60000, pollInterval = 2000 } = options;
    const startTime = Date.now();

    logger.debug({ jobId }, "Polling encryption job status");

    while (Date.now() - startTime < maxWait) {
      const status = await this.getJobStatus(jobId);

      if (status.status === "completed" && status.encryptedValue) {
        const ciphertext = Buffer.from(status.encryptedValue.ciphertext.replace(/^0x/, ""), "hex");
        return formatInEuint64(ciphertext, status.encryptedValue.securityZone ?? 0);
      }

      if (status.status === "failed") {
        throw new Error(`Encryption job failed: ${status.error ?? "Unknown error"}`);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Encryption job timed out after ${maxWait}ms`);
  }

  /**
   * Get current status of an encryption job.
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await fetch(`${this.gatewayUrl}/v1/jobs/${jobId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Failed to get job status: ${response.status} ${text}`);
    }

    return (await response.json()) as JobStatusResponse;
  }

  /**
   * Wait for async encryption to complete and return the encrypted value.
   */
  async encryptAsyncAndWait(
    value: bigint | number,
    registryAddress?: string,
    options?: { maxWait?: number; pollInterval?: number }
  ): Promise<InEuint64> {
    const job = await this.encryptAsync(value, registryAddress);
    return this.pollJobStatus(job.jobId, options);
  }
}

