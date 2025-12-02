import type { ProverEnv } from "../config.js";
import type { RangeProofOutput } from "./proof.js";

export type EncryptionOutput = {
  encryptedPayload: string;
};

export async function encryptRangeResult(
  proof: RangeProofOutput,
  env: ProverEnv
): Promise<EncryptionOutput> {
  // TODO: plug into cofhejs / Fhenix gateway. Placeholder returns deterministic URL.
  return {
    encryptedPayload: `fhe://${env.FHE_GATEWAY_URL}/cipher/${proof.proofHash.slice(2, 10)}`,
  };
}

