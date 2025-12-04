import type { ProverEnv } from "../config.js";
import { scanShieldedActivity } from "./scan.js";
import { generateRangeProof } from "./proof.js";
import { encryptRangeResult } from "./encrypt.js";
import type { InEuint64 } from "../lib/fhe.js";

export type ProofInput = {
  address: string;
  viewingKey: string;
};

export type ProofArtifact = {
  address: string;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  proofHash: string;
  encryptedPayload: string;
  inEuint64: InEuint64;
  notesScanned: number;
  totalZats: string;
  witness: Awaited<ReturnType<typeof generateRangeProof>>["witness"];
};

export async function runMockPipeline(input: ProofInput, env: ProverEnv): Promise<ProofArtifact> {
  const scan = await scanShieldedActivity(input.viewingKey, env);
  const proof = await generateRangeProof(scan);
  const encryption = await encryptRangeResult(proof, env);
  const totalZats = proof.witness.total_zats;

  return {
    address: input.address,
    tier: proof.tier,
    proofHash: proof.proofHash,
    encryptedPayload: encryption.encryptedPayload,
    inEuint64: encryption.inEuint64,
    notesScanned: scan.notes,
    totalZats,
    witness: proof.witness,
  };
}

