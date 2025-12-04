import { promises as fs } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { createHash } from "node:crypto";
import type { ScanResult } from "./scan.js";
import { logger } from "../lib/logger.js";

const DEFAULT_CACHE_ROOT = join(homedir(), ".zecrep", "cache");
const SCAN_SUBDIR = "scan-results";
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cacheRoot = process.env.ZECREP_CACHE_DIR || DEFAULT_CACHE_ROOT;

function scanCacheDir() {
  return join(cacheRoot, SCAN_SUBDIR);
}

async function ensureDir(path: string) {
  await fs.mkdir(path, { recursive: true });
}

function cacheFilePath(key: string) {
  return join(scanCacheDir(), `${key}.json`);
}

export function setScanCacheDirectory(directory: string) {
  cacheRoot = directory;
}

export function buildScanCacheKey(viewingKey: string, lightwalletdUrl: string): string {
  const hash = createHash("sha256");
  hash.update(viewingKey);
  hash.update(lightwalletdUrl);
  return hash.digest("hex");
}

type SerializedScan = {
  timestamp: number;
  data: {
    orchardZats: string;
    saplingZats: string;
    notes: number;
  };
};

export async function readScanCache(
  key: string,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<ScanResult | null> {
  if (ttlMs <= 0) {
    return null;
  }

  try {
    const content = await fs.readFile(cacheFilePath(key), "utf8");
    const parsed = JSON.parse(content) as SerializedScan;
    if (!parsed.timestamp || !parsed.data) {
      return null;
    }

    if (Date.now() - parsed.timestamp > ttlMs) {
      return null;
    }

    return {
      orchardZats: BigInt(parsed.data.orchardZats),
      saplingZats: BigInt(parsed.data.saplingZats),
      notes: parsed.data.notes,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      logger.debug({ error, key }, "Failed to read scan cache");
    }
    return null;
  }
}

export async function writeScanCache(key: string, scan: ScanResult): Promise<void> {
  const payload: SerializedScan = {
    timestamp: Date.now(),
    data: {
      orchardZats: scan.orchardZats.toString(),
      saplingZats: scan.saplingZats.toString(),
      notes: scan.notes,
    },
  };

  try {
    const dir = scanCacheDir();
    await ensureDir(dir);
    await fs.writeFile(cacheFilePath(key), JSON.stringify(payload), "utf8");
  } catch (error) {
    logger.debug({ error, key }, "Failed to write scan cache");
  }
}

