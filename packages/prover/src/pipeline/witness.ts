import type { ScanResult } from "./scan.js";
import { TIER_THRESHOLDS } from "./constants.js";

export type NoirWitness = {
  total_zats: string;
  bronze_max: string;
  silver_max: string;
  gold_max: string;
};

export function buildNoirWitness(scan: ScanResult): NoirWitness {
  const total = scan.orchardZats + scan.saplingZats;
  return {
    total_zats: total.toString(),
    bronze_max: TIER_THRESHOLDS.bronzeMax.toString(),
    silver_max: TIER_THRESHOLDS.silverMax.toString(),
    gold_max: TIER_THRESHOLDS.goldMax.toString(),
  };
}

export function deriveTier(total: bigint) {
  if (total <= TIER_THRESHOLDS.bronzeMax) {
    return "BRONZE" as const;
  }
  if (total <= TIER_THRESHOLDS.silverMax) {
    return "SILVER" as const;
  }
  if (total <= TIER_THRESHOLDS.goldMax) {
    return "GOLD" as const;
  }
  return "PLATINUM" as const;
}

