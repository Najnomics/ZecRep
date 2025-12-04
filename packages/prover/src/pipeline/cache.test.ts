import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  setScanCacheDirectory,
  writeScanCache,
  readScanCache,
} from "./cache.js";

describe("scan cache", () => {
  let cacheDir: string;

  beforeEach(async () => {
    cacheDir = await mkdtemp(join(tmpdir(), "zecrep-cache-"));
    setScanCacheDirectory(cacheDir);
  });

  afterEach(async () => {
    if (cacheDir) {
      await rm(cacheDir, { recursive: true, force: true });
    }
  });

  it("persists and reads scan results", async () => {
    await writeScanCache("test", {
      orchardZats: 5n,
      saplingZats: 7n,
      notes: 3,
    });

    const cached = await readScanCache("test", 10_000);
    expect(cached?.orchardZats).toBe(5n);
    expect(cached?.saplingZats).toBe(7n);
    expect(cached?.notes).toBe(3);
  });

  it("expires entries when ttl is exceeded", async () => {
    await writeScanCache("expiring", {
      orchardZats: 1n,
      saplingZats: 1n,
      notes: 1,
    });

    const expired = await readScanCache("expiring", 0);
    expect(expired).toBeNull();
  });
});

