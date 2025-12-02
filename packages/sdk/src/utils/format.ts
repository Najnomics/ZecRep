/**
 * Formatting utilities for ZecRep SDK.
 */

const ZATOSHI_PER_ZEC = 100_000_000n;

/**
 * Format zatoshis as ZEC with proper decimal places.
 */
export function formatZec(zatoshis: bigint | number): string {
  const bigintZats = typeof zatoshis === "bigint" ? zatoshis : BigInt(zatoshis);
  const zec = Number(bigintZats) / Number(ZATOSHI_PER_ZEC);
  return `${zec.toLocaleString(undefined, { maximumFractionDigits: 8 })} ZEC`;
}

/**
 * Format tier name with emoji.
 */
export function formatTier(tier: string): string {
  const emojis: Record<string, string> = {
    BRONZE: "🥉",
    SILVER: "🥈",
    GOLD: "🥇",
    PLATINUM: "💎",
    NONE: "",
  };
  return `${emojis[tier] ?? ""} ${tier}`;
}

/**
 * Format tier range for display.
 */
export function formatTierRange(tier: string): string {
  const ranges: Record<string, string> = {
    BRONZE: "1-2 ZEC",
    SILVER: "3-10 ZEC",
    GOLD: "10-50 ZEC",
    PLATINUM: "50+ ZEC",
  };
  return ranges[tier] ?? "Unknown";
}

/**
 * Format score with proper formatting.
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Format address with ellipsis (e.g., 0x1234...5678).
 */
export function formatAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format transaction hash with ellipsis.
 */
export function formatTxHash(hash: string): string {
  return formatAddress(hash, 8);
}

/**
 * Format percentage (e.g., 0.2 -> "20%").
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format fee discount multiplier (e.g., 0.8 -> "20% off").
 */
export function formatDiscount(multiplier: number): string {
  const discount = (1 - multiplier) * 100;
  return `${discount.toFixed(0)}% off`;
}

