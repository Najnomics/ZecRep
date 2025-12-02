import type { ProverEnv } from "../config.js";
import type { RangeProofOutput } from "./proof.js";
import type { InEuint64 } from "../lib/fhe.js";
import { encryptViaFhenix } from "../lib/fhenixGateway.js";
import { mockInEuint64 } from "../lib/fhe.js";

export type EncryptionOutput = {
  encryptedPayload: string;
  inEuint64: InEuint64;
};

/**
 * Encrypt the total zatoshi using Fhenix FHE.
 * When `USE_COFHE=true` we call the Fhenix gateway; otherwise we return a deterministic placeholder.
 */
export async function encryptRangeResult(
  proof: RangeProofOutput,
  env: ProverEnv
): Promise<EncryptionOutput> {
  const useCofhe = process.env.USE_COFHE === "true";
  const totalZats = BigInt(proof.witness.total_zats);

  let inEuint64: InEuint64;

  if (useCofhe) {
    // Real Fhenix gateway encryption
    inEuint64 = await encryptViaFhenix(env.FHE_GATEWAY_URL, totalZats);
  } else {
    // Deterministic mock for local dev
    inEuint64 = mockInEuint64(totalZats);
  }

  return {
    encryptedPayload: `fhe://${env.FHE_GATEWAY_URL}/cipher/${proof.proofHash.slice(2, 10)}`,
    inEuint64,
  };
}

