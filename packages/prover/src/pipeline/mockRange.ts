import type { ProverEnv } from "../config.js";

export type ProofInput = {
  address: string;
  viewingKey: string;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
};

export type ProofArtifact = {
  tier: ProofInput["tier"];
  proofHash: string;
  encryptedPayload: string;
  notesScanned: number;
};

export async function runMockPipeline(input: ProofInput, env: ProverEnv): Promise<ProofArtifact> {
  // Placeholder that simulates the full scan -> proof -> encrypt pipeline.
  const hash = `0xmock${Buffer.from(input.address.slice(2, 10)).toString("hex")}`;
  const encryptedPayload = `fhe://${env.FHE_GATEWAY_URL}/job/${hash.slice(2, 10)}`;
  return {
    tier: input.tier,
    proofHash: hash,
    encryptedPayload,
    notesScanned: 0
  };
}

