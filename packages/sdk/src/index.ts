/**
 * @zecrep/sdk
 * 
 * TypeScript SDK for ZecRep integrations.
 * 
 * Provides:
 * - Contract ABIs and type-safe interfaces
 * - React hooks for wallet integration
 * - Aggregator client for job orchestration
 * - Helper functions for tier checks and permissions
 */

export { AggregatorClient } from "./client/aggregator.js";
export type { TierData, JobStatus } from "./types.js";

// Re-export contract types when available
export type { TierLevel, ProofRecord } from "./contracts/index.js";

