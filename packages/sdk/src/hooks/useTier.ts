import { useState, useEffect, useCallback } from "react";
import type { AggregatorClient } from "../client/aggregator.js";
import type { TierData } from "../types.js";

export interface UseTierResult {
  tier: TierData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * React hook for fetching and caching tier data.
 */
export function useTier(client: AggregatorClient, address: string | null): UseTierResult {
  const [tier, setTier] = useState<TierData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTier = useCallback(async () => {
    if (!address) {
      setTier(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await client.getTier(address);
      setTier(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch tier"));
      setTier(null);
    } finally {
      setLoading(false);
    }
  }, [client, address]);

  useEffect(() => {
    void fetchTier();
  }, [fetchTier]);

  return {
    tier,
    loading,
    error,
    refetch: fetchTier,
  };
}

