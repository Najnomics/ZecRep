import { useState, useEffect, useCallback } from "react";
import type { AggregatorClient } from "../client/aggregator.js";

export interface TierMultipliers {
  feeDiscount: number;
  ltvBoostBps: number;
  voteWeight: number;
  yield: number;
}

export interface UseMultipliersResult {
  multipliers: TierMultipliers | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * React hook for fetching tier-based multipliers.
 * Returns fee discounts, LTV boosts, vote weights, and yield multipliers.
 */
export function useMultipliers(client: AggregatorClient, address: string | null): UseMultipliersResult {
  const [multipliers, setMultipliers] = useState<TierMultipliers | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMultipliers = useCallback(async () => {
    if (!address) {
      setMultipliers(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await client.getMultipliers(address);
      setMultipliers(data.multipliers);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch multipliers"));
      setMultipliers(null);
    } finally {
      setLoading(false);
    }
  }, [client, address]);

  useEffect(() => {
    void fetchMultipliers();
  }, [fetchMultipliers]);

  return {
    multipliers,
    loading,
    error,
    refetch: fetchMultipliers,
  };
}

