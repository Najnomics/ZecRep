import type { ScanResult } from "./scan.js";
import { buildNoirWitness, deriveTier } from "./witness.js";
import { tryProveWithNoir } from "./noir.js";

export type RangeProofOutput = {
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  proofHash: string;
  witness: ReturnType<typeof buildNoirWitness>;
};

export async function generateRangeProof(scan: ScanResult): Promise<RangeProofOutput> {
  const witness = buildNoirWitness(scan);
  const total = scan.orchardZats + scan.saplingZats;
  const tier = deriveTier(total);
  const noirResult = await tryProveWithNoir(witness);
  const proofHash = noirResult?.proofHash ?? `0xproof${total.toString(16).padStart(8, "0")}`;
  return { tier, proofHash, witness };
}

