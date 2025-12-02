import type { ProverEnv } from "../config.js";
import type { RangeProofOutput } from "./proof.js";
import type { InEuint64 } from "../lib/fhe.js";
import { EncryptionClient } from "../lib/encryptionClient.js";
import { mockInEuint64 } from "../lib/fhe.js";
import { logger } from "../lib/logger.js";

export type EncryptionOutput = {
  encryptedPayload: string;
  inEuint64: InEuint64;
  jobId?: string; // For async encryption jobs
};

/**
 * Encrypt the total zatoshi using Fhenix FHE.
 * 
 * Supports both sync and async encryption modes:
 * - Sync: Immediate encryption (USE_COFHE=true, USE_ASYNC=false)
 * - Async: Job-based encryption with polling (USE_COFHE=true, USE_ASYNC=true)
 * - Mock: Deterministic placeholder (USE_COFHE=false)
 */
export async function encryptRangeResult(
  proof: RangeProofOutput,
  env: ProverEnv
): Promise<EncryptionOutput> {
  const useCofhe = process.env.USE_COFHE === "true" || process.env.ENABLE_FHE_ENCRYPTION === "true";
  const useAsync = process.env.USE_ASYNC_ENCRYPTION === "true";
  const totalZats = BigInt(proof.witness.total_zats);

  let inEuint64: InEuint64;
  let jobId: string | undefined;

  if (useCofhe) {
    const client = new EncryptionClient(env.FHE_GATEWAY_URL);

    if (useAsync) {
      logger.info({ totalZats: totalZats.toString() }, "Starting async encryption job");
      // Submit async job and poll for completion
      inEuint64 = await client.encryptAsyncAndWait(totalZats, env.REGISTRY_ADDRESS, {
        maxWait: 60000, // 60 second timeout
        pollInterval: 2000, // Poll every 2 seconds
      });
      logger.info("Async encryption completed");
    } else {
      logger.info({ totalZats: totalZats.toString() }, "Encrypting synchronously");
      // Sync encryption
      inEuint64 = await client.encryptSync(totalZats, env.REGISTRY_ADDRESS);
      logger.info("Sync encryption completed");
    }
  } else {
    logger.debug("Using mock encryption (USE_COFHE=false)");
    // Deterministic mock for local dev
    inEuint64 = mockInEuint64(totalZats);
  }

  return {
    encryptedPayload: `fhe://${env.FHE_GATEWAY_URL}/cipher/${proof.proofHash.slice(2, 10)}`,
    inEuint64,
    jobId,
  };
}

