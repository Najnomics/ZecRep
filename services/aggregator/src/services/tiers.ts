import { z } from "zod";
import { logger } from "../lib/logger.js";

// Placeholder fetcher; will connect to lightwalletd and Cofhe jobs later.
export async function fetchMockTier(address: string) {
  logger.debug({ address }, "Fetching mock tier");
  const hash = Number(BigInt(address) & BigInt(0xffff));
  const tiers = ["NONE", "BRONZE", "SILVER", "GOLD", "PLATINUM"] as const;
  const tierIndex = hash % tiers.length;
  const score = [0, 100, 200, 500, 1000][tierIndex];
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


