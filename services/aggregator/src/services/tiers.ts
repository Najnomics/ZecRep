import { z } from "zod";
import { logger } from "../lib/logger.js";
import { storage } from "./storage.js";

// Placeholder fetcher; will connect to lightwalletd and Cofhe jobs later.
export const tierScoreMap: Record<string, number> = {
  NONE: 0,
  BRONZE: 100,
  SILVER: 200,
  GOLD: 500,
  PLATINUM: 1000,
};

export async function fetchTier(address: string) {
  const stored = await storage.getTier(address);
  if (stored) {
    return {
      address: stored.address,
      tier: stored.tier,
      score: stored.score,
      encryptedTotal: stored.encryptedTotal,
      updatedAt: stored.updatedAt,
      volumeZats: stored.volumeZats,
    };
  }
  return fetchMockTier(address);
}

export async function fetchMockTier(address: string) {
  logger.debug({ address }, "Fetching mock tier");
  const hash = Number(BigInt(address) & BigInt(0xffff));
  const tiers = ["NONE", "BRONZE", "SILVER", "GOLD", "PLATINUM"] as const;
  const tierIndex = hash % tiers.length;
  const score = tierScoreMap[tiers[tierIndex]];
  const volume = (tierIndex * 10 + 1) * 1_000_000;

  return {
    address,
    tier: tiers[tierIndex],
    score,
    encryptedTotal: `0xmock${hash.toString(16).padStart(4, "0")}`,
    updatedAt: new Date().toISOString(),
    volumeZats: volume,
  };
}

export const TierQuerySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export type TierQuery = z.infer<typeof TierQuerySchema>;

export async function fetchTierHistory(address: string, limit = 10) {
  const entries = await storage.getTierHistory(address, limit);
  return entries.map((entry) => ({
    address: entry.address,
    tier: entry.tier,
    score: entry.score,
    encryptedTotal: entry.encryptedTotal,
    updatedAt: entry.updatedAt,
    volumeZats: entry.volumeZats,
  }));
}


