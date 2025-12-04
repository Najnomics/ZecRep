import type { ProverEnv } from "../config.js";
import { fetchShieldedTotals } from "../clients/lightwalletd.js";
import { loadPipelineConfig } from "./config.js";
import { buildScanCacheKey, readScanCache, writeScanCache } from "./cache.js";
import { logger } from "../lib/logger.js";

export type ScanResult = {
  orchardZats: bigint;
  saplingZats: bigint;
  notes: number;
};

export async function scanShieldedActivity(viewingKey: string, env: ProverEnv): Promise<ScanResult> {
  const config = loadPipelineConfig();
  const ttlMs = Number(process.env.SCAN_CACHE_TTL_MS ?? 5 * 60 * 1000);
  const cacheKey = buildScanCacheKey(viewingKey, env.LIGHTWALLETD_URL);

  if (ttlMs > 0) {
    const cached = await readScanCache(cacheKey, ttlMs);
    if (cached) {
      logger.debug({ viewingKey: viewingKey.slice(0, 8) }, "Using cached lightwalletd scan");
      return cached;
    }
  }

  const scan = await fetchShieldedTotals(env, viewingKey, {
    blockRange: config.blockScanRange,
  });

  if (ttlMs > 0) {
    await writeScanCache(cacheKey, scan);
  }

  return scan;
}

