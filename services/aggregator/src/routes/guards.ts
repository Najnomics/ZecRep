import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { fetchMockTier } from "../services/tiers.js";

/**
 * Guard routes that mirror on-chain tier enforcement logic.
 * Useful for protocols to check tier requirements before submitting transactions.
 * 
 * Based on ZecRepRegistry.enforceTier and ZecRepGuards patterns.
 */

const TierLevelEnum = z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]);

const GuardQuerySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  minimumTier: TierLevelEnum,
});

const TierLevelValue = {
  NONE: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
} as const;

function tierToValue(tier: string): number {
  return TierLevelValue[tier as keyof typeof TierLevelValue] ?? 0;
}

function valueToTier(value: number): string {
  const entry = Object.entries(TierLevelValue).find(([, v]) => v === value);
  return entry?.[0] ?? "NONE";
}

export async function registerGuardRoutes(fastify: FastifyInstance) {
  /**
   * Check if an address meets a minimum tier requirement.
   * Mirrors ZecRepRegistry.meetsTier logic.
   */
  fastify.get("/api/reputation/guards/meets-tier", async (request, reply) => {
    const parsed = GuardQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "InvalidQuery",
        details: parsed.error.format(),
      });
    }

    const tierData = await fetchMockTier(parsed.data.address);
    const userTierValue = tierToValue(tierData.tier);
    const minimumTierValue = tierToValue(parsed.data.minimumTier);

    const meets = userTierValue >= minimumTierValue && userTierValue > 0;

    return {
      address: parsed.data.address,
      userTier: tierData.tier,
      minimumTier: parsed.data.minimumTier,
      meets,
      canAccess: meets,
    };
  });

  /**
   * Enforce tier requirement - returns error if tier not met.
   * Mirrors ZecRepRegistry.enforceTier logic.
   */
  fastify.get("/api/reputation/guards/enforce-tier", async (request, reply) => {
    const parsed = GuardQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "InvalidQuery",
        details: parsed.error.format(),
      });
    }

    const tierData = await fetchMockTier(parsed.data.address);
    const userTierValue = tierToValue(tierData.tier);
    const minimumTierValue = tierToValue(parsed.data.minimumTier);

    if (userTierValue === 0) {
      return reply.status(403).send({
        error: "NotRegistered",
        message: `Address ${parsed.data.address} has no ZecRep badge`,
        address: parsed.data.address,
      });
    }

    if (userTierValue < minimumTierValue) {
      return reply.status(403).send({
        error: "TierRequirementNotMet",
        message: `Required tier: ${parsed.data.minimumTier}, actual tier: ${tierData.tier}`,
        address: parsed.data.address,
        requiredTier: parsed.data.minimumTier,
        actualTier: tierData.tier,
      });
    }

    return {
      address: parsed.data.address,
      tier: tierData.tier,
      meetsRequirement: true,
    };
  });

  /**
   * Get tier-based multipliers for fee discounts, LTV boosts, etc.
   * Mirrors ZecRepGuards helper functions.
   */
  fastify.get("/api/reputation/guards/multipliers", async (request, reply) => {
    const parsed = z
      .object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      })
      .safeParse(request.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "InvalidQuery",
        details: parsed.error.format(),
      });
    }

    const tierData = await fetchMockTier(parsed.data.address);
    const tier = tierData.tier;

    // Fee discount multipliers (from ZecRepGuards.getFeeDiscountMultiplier)
    const feeMultipliers: Record<string, number> = {
      NONE: 1.0,
      BRONZE: 0.95,
      SILVER: 0.9,
      GOLD: 0.8,
      PLATINUM: 0.7,
    };

    // LTV boost in basis points (from ZecRepGuards.getLTVBoostBps)
    const ltvBoosts: Record<string, number> = {
      NONE: 0,
      BRONZE: 0,
      SILVER: 500, // 5%
      GOLD: 1000, // 10%
      PLATINUM: 2000, // 20%
    };

    // Vote multipliers (from ZecRepGuards.getVoteMultiplier)
    const voteMultipliers: Record<string, number> = {
      NONE: 1.0,
      BRONZE: 1.25,
      SILVER: 1.5,
      GOLD: 2.0,
      PLATINUM: 3.0,
    };

    // Yield multipliers (from ZecRepGuards.getYieldMultiplier)
    const yieldMultipliers: Record<string, number> = {
      NONE: 1.0,
      BRONZE: 1.125,
      SILVER: 1.25,
      GOLD: 1.5,
      PLATINUM: 2.0,
    };

    return {
      address: parsed.data.address,
      tier,
      multipliers: {
        feeDiscount: feeMultipliers[tier] ?? 1.0,
        ltvBoostBps: ltvBoosts[tier] ?? 0,
        voteWeight: voteMultipliers[tier] ?? 1.0,
        yield: yieldMultipliers[tier] ?? 1.0,
      },
    };
  });
}

