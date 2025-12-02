import type { ScanResult } from "./scan.js";

export type RangeProofOutput = {
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  proofHash: string;
};

export async function generateRangeProof(scan: ScanResult): Promise<RangeProofOutput> {
  // TODO: call Noir circuit once implemented.
  const total = Number(scan.orchardZats + scan.saplingZats);
  let tier: RangeProofOutput["tier"];
  if (total >= 5_000_000_000) {
    tier = "PLATINUM";
  } else if (total >= 1_000_000_000) {
    tier = "GOLD";
  } else if (total >= 300_000_000) {
    tier = "SILVER";
  } else {
    tier = "BRONZE";
  }
  const proofHash = `0xproof${total.toString(16).padStart(8, "0")}`;
  return { tier, proofHash };
}

