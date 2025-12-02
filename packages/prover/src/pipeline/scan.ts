import type { ProverEnv } from "../config.js";

export type ScanResult = {
  orchardZats: bigint;
  saplingZats: bigint;
  notes: number;
};

export async function scanShieldedActivity(viewingKey: string, env: ProverEnv): Promise<ScanResult> {
  // TODO: integrate with lightwalletd gRPC streaming (CONTEXT/lightwallet-protocol/walletrpc/service.proto)
  // For now we return deterministic mock data based on the viewing key hash.
  const hash = BigInt(`0x${Buffer.from(viewingKey).subarray(0, 6).toString("hex").padEnd(12, "0")}`);
  return {
    orchardZats: hash % BigInt(5_000_000_000),
    saplingZats: hash % BigInt(3_000_000_000),
    notes: Number(hash % BigInt(25)),
  };
}

