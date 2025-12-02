import { fetch } from "undici";
import type { Env } from "../config/schema.js";
import { logger } from "../lib/logger.js";

/**
 * Lightwalletd client service.
 * 
 * Per CONTEXT/lightwallet-protocol/walletrpc/service.proto:
 * - GetBlockRange: stream CompactBlocks for a height range
 * - GetAddressUtxos: get UTXOs for transparent addresses
 * - CompactTxStreamer gRPC service
 * 
 * This is a stub that will be replaced with actual gRPC client integration.
 */

export type CompactBlock = {
  height: number;
  hash: string;
  time: number;
  vtx: CompactTx[];
};

export type CompactTx = {
  index: number;
  txid: string;
  fee?: number;
  spends: unknown[];
  outputs: unknown[];
  actions: unknown[];
};

export type ShieldedActivity = {
  saplingZats: bigint;
  orchardZats: bigint;
  totalNotes: number;
};

/**
 * Fetch shielded activity for a viewing key.
 * TODO: Implement actual gRPC client using lightwallet-protocol service.proto
 */
export async function fetchShieldedActivity(
  env: Env,
  viewingKey: string
): Promise<ShieldedActivity> {
  // Placeholder: will use gRPC GetBlockRange + scan CompactBlocks for notes
  logger.debug({ viewingKey: viewingKey.slice(0, 10) }, "Fetching shielded activity");

  // Mock implementation - in production, this will:
  // 1. Connect to lightwalletd gRPC service
  // 2. Call GetBlockRange for relevant height range
  // 3. Scan CompactBlocks for notes matching viewing key
  // 4. Aggregate totals from Sapling/Orchard pools

  if (env.ZCASH_LIGHTWALLETD_URL.includes("mock")) {
    const res = await fetch(`${env.ZCASH_LIGHTWALLETD_URL}/mock-scan?vk=${encodeURIComponent(viewingKey)}`);
    if (!res.ok) {
      throw new Error(`Mock lightwalletd request failed: ${res.statusText}`);
    }
    return (await res.json()) as ShieldedActivity;
  }

  // Deterministic mock based on viewing key hash
  const hash = BigInt(`0x${Buffer.from(viewingKey.slice(0, 16)).toString("hex").padEnd(16, "0")}`);
  return {
    saplingZats: hash % BigInt(5_000_000_000),
    orchardZats: hash % BigInt(3_000_000_000),
    totalNotes: Number(hash % BigInt(25)),
  };
}

