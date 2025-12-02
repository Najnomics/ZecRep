import type { ProverEnv } from "../config.js";
import { scanShieldedActivity } from "./scan.js";
import { generateRangeProof } from "./proof.js";
import { encryptRangeResult } from "./encrypt.js";

export type ProofInput = {
  address: string;
  viewingKey: string;
};

export type ProofArtifact = {
  address: string;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  proofHash: string;
  encryptedPayload: string;
  notesScanned: number;
};

export async function runMockPipeline(input: ProofInput, env: ProverEnv): Promise<ProofArtifact> {
  const scan = await scanShieldedActivity(input.viewingKey, env);
  const proof = await generateRangeProof(scan);
  const encryption = await encryptRangeResult(proof, env);

  return {
    address: input.address,
    tier: proof.tier,
    proofHash: proof.proofHash,
    encryptedPayload: encryption.encryptedPayload,
    notesScanned: scan.notes,
  };
}

