import type { ProverEnv } from "../config.js";
import { fetchShieldedTotals } from "../clients/lightwalletd.js";

export type ScanResult = {
  orchardZats: bigint;
  saplingZats: bigint;
  notes: number;
};

export async function scanShieldedActivity(viewingKey: string, env: ProverEnv): Promise<ScanResult> {
  return fetchShieldedTotals(env, viewingKey);
}

