import { fetch } from "undici";
import type { ProverEnv } from "../config.js";
import type { ScanResult } from "../pipeline/scan.js";
import { LightwalletdClient } from "./lightwalletdClient.js";
import { parseCompactBlock, aggregateNotes, calculateTotal } from "./compactBlockParser.js";
import { filterNotesByViewingKey } from "./noteFilter.js";
import { logger } from "../lib/logger.js";

type ShieldedScanOptions = {
  blockRange?: number;
  startHeight?: number;
};

/**
 * Fetch shielded totals using real gRPC client or fallback to mock.
 */
export async function fetchShieldedTotals(
  env: ProverEnv,
  viewingKey: string,
  options: ShieldedScanOptions = {}
): Promise<ScanResult> {
  // Use mock endpoint if explicitly configured
  if (env.LIGHTWALLETD_URL.includes("mock") || !env.ENABLE_GRPC) {
    if (env.LIGHTWALLETD_URL.includes("mock")) {
      const res = await fetch(`${env.LIGHTWALLETD_URL}/mock-scan?vk=${encodeURIComponent(viewingKey)}`);
      if (!res.ok) {
        throw new Error(`Mock lightwalletd request failed: ${res.statusText}`);
      }
      const data = (await res.json()) as ScanResult;
      return data;
    }
    
    // Deterministic mock fallback
    const hash = BigInt(`0x${Buffer.from(viewingKey).subarray(0, 6).toString("hex").padEnd(12, "0")}`);
    return {
      orchardZats: hash % BigInt(5_000_000_000),
      saplingZats: hash % BigInt(3_000_000_000),
      notes: Number(hash % BigInt(25)),
    };
  }

  // Use real gRPC client
  const client = new LightwalletdClient(env);
  
  try {
    // Get chain info to determine scan range
    const info = await client.getLightdInfo();
    const currentHeight = info.blockHeight || info.chainLength || 0;

    const blockRange = options.blockRange ?? 1000;
    const requestedStart = Math.max(
      0,
      options.startHeight ?? currentHeight - blockRange
    );
    const requestedEnd =
      options.startHeight !== undefined
        ? Math.min(currentHeight, options.startHeight + blockRange)
        : currentHeight;
    const startHeight = Math.min(requestedStart, requestedEnd);
    const endHeight = Math.max(startHeight, requestedEnd);
    
    logger.info(
      {
        startHeight,
        endHeight,
        range: blockRange,
        viewingKey: viewingKey.slice(0, 10),
      },
      "Scanning block range via gRPC"
    );
    
    // Fetch compact blocks
    const blocks = await client.getBlockRange(startHeight, endHeight);
    
    // Parse blocks to extract notes
    const parsedBlocks = blocks.map(parseCompactBlock);
    const allNotes = aggregateNotes(parsedBlocks);
    
    // Deterministic placeholder filtering based on viewing key
    const filteredNotes = filterNotesByViewingKey(allNotes, viewingKey);
    const { saplingZats, orchardZats } = calculateTotal(filteredNotes);
    
    logger.info(
      {
        saplingZats: saplingZats.toString(),
        orchardZats: orchardZats.toString(),
        totalNotes: allNotes.length,
        filteredNotes: filteredNotes.length,
      },
      "Scanned shielded activity"
    );
    
    return {
      saplingZats,
      orchardZats,
      notes: filteredNotes.length,
    };
  } finally {
    client.close();
  }
}

