/**
 * Constants for the ZecRep web application.
 */

export const TIER_CONFIG = {
  BRONZE: {
    name: "Bronze",
    range: "1-2 ZEC",
    score: 100,
    emoji: "🥉",
    color: "orange",
  },
  SILVER: {
    name: "Silver",
    range: "3-10 ZEC",
    score: 200,
    emoji: "🥈",
    color: "gray",
  },
  GOLD: {
    name: "Gold",
    range: "10-50 ZEC",
    score: 500,
    emoji: "🥇",
    color: "yellow",
  },
  PLATINUM: {
    name: "Platinum",
    range: "50+ ZEC",
    score: 1000,
    emoji: "💎",
    color: "cyan",
  },
} as const;

export const AGGREGATOR_URL = process.env.NEXT_PUBLIC_AGGREGATOR_URL ?? "http://localhost:4100";
export const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ?? "0x0000000000000000000000000000000000000000";

