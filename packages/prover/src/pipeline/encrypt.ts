import type { ProverEnv } from "../config.js";
import type { RangeProofOutput } from "./proof.js";

export type EncryptionOutput = {
  encryptedPayload: string;
  ciphertext: Uint8Array;
};

/**
 * Encrypt the tier + total zatoshi using Cofhe FHE.
 * When `USE_COFHE=true` we call the Fhenix gateway; otherwise we return a deterministic placeholder.
 */
export async function encryptRangeResult(
  proof: RangeProofOutput,
  env: ProverEnv
): Promise<EncryptionOutput> {
  const useCofhe = process.env.USE_COFHE === "true";

  if (useCofhe) {
    // Real Cofhe encryption path (placeholder until cofhejs is wired)
    const payload = JSON.stringify({
      tier: proof.tier,
      totalZats: proof.witness.total_zats.toString(),
      proofHash: proof.proofHash,
    });

    // Simulate calling the Fhenix gateway
    const response = await fetch(`${env.FHE_GATEWAY_URL}/v1/encrypt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`Cofhe encryption failed: ${response.status}`);
    }

    const result = (await response.json()) as { ciphertext: string };
    const ciphertext = Buffer.from(result.ciphertext, "hex");

    return {
      encryptedPayload: `fhe://${env.FHE_GATEWAY_URL}/cipher/${proof.proofHash.slice(2, 10)}`,
      ciphertext,
    };
  }

  // Deterministic mock ciphertext for local dev
  const mockCipher = Buffer.alloc(64);
  const hashBytes = Buffer.from(proof.proofHash.replace("0x", ""), "hex");
  hashBytes.copy(mockCipher, 0, 0, Math.min(hashBytes.length, 32));
  mockCipher.writeUInt8(tierToNum(proof.tier), 32);

  return {
    encryptedPayload: `fhe://${env.FHE_GATEWAY_URL}/cipher/${proof.proofHash.slice(2, 10)}`,
    ciphertext: mockCipher,
  };
}

function tierToNum(tier: string): number {
  switch (tier) {
    case "BRONZE":
      return 1;
    case "SILVER":
      return 2;
    case "GOLD":
      return 3;
    case "PLATINUM":
      return 4;
    default:
      return 0;
  }
}
