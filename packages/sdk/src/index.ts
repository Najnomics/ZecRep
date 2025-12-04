/**
 * ZecRep TypeScript SDK
 * 
 * Main entry point for the SDK. Exports all public APIs.
 */

// Client exports
export { AggregatorClient } from "./client/aggregator.js";
export { RegistryClient, BadgeClient } from "./client/contract.js";

// Hook exports
export { useTier } from "./hooks/useTier.js";
export { useProofWizard } from "./hooks/useProofWizard.js";
export type { ProofWizardStep, ProofWizardState } from "./hooks/useProofWizard.js";
export { useJobs } from "./hooks/useJobs.js";
export { useTierHistory } from "./hooks/useTierHistory.js";

// Type exports
export type { TierData, RangeJob, ProofInput, JobStatus } from "./types.js";

// Utility exports
export * from "./utils/format.js";
export * from "./utils/retry.js";

// Error exports
export * from "./errors.js";

// Constants
export const ZATOSHI_PER_ZEC = 100_000_000n;

export const TIER_LEVELS = {
  NONE: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
} as const;

export const TIER_THRESHOLDS = {
  BRONZE_MAX: 2n * ZATOSHI_PER_ZEC,
  SILVER_MAX: 10n * ZATOSHI_PER_ZEC,
  GOLD_MAX: 50n * ZATOSHI_PER_ZEC,
} as const;
