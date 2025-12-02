/**
 * Formatting utilities for prover CLI output.
 */

const ZATOSHI_PER_ZEC = 100_000_000n;

/**
 * Format zatoshis as ZEC with proper decimal places.
 */
export function formatZec(zatoshis: bigint): string {
  const zec = Number(zatoshis) / Number(ZATOSHI_PER_ZEC);
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
  };
  return `${emojis[tier] ?? ""} ${tier}`;
}

/**
 * Format proof hash for display (truncated).
 */
export function formatProofHash(hash: string): string {
  if (!hash.startsWith("0x")) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

/**
 * Format duration in seconds to human-readable string.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

