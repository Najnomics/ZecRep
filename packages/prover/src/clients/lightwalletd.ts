import { fetch } from "undici";
import type { ProverEnv } from "../config.js";
import type { ScanResult } from "../pipeline/scan.js";

export async function fetchShieldedTotals(env: ProverEnv, viewingKey: string): Promise<ScanResult> {
  // TODO: replace with actual gRPC client; for now call mock HTTP endpoint if provided.
  if (env.LIGHTWALLETD_URL.includes("mock")) {
    const res = await fetch(`${env.LIGHTWALLETD_URL}/mock-scan?vk=${encodeURIComponent(viewingKey)}`);
    if (!res.ok) {
      throw new Error(`Mock lightwalletd request failed: ${res.statusText}`);
    }
    const data = (await res.json()) as ScanResult;
    return data;
  }
  const hash = BigInt(`0x${Buffer.from(viewingKey).subarray(0, 6).toString("hex").padEnd(12, "0")}`);
  return {
    orchardZats: hash % BigInt(5_000_000_000),
    saplingZats: hash % BigInt(3_000_000_000),
    notes: Number(hash % BigInt(25)),
  };
}

