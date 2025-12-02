"use client";

import { useState, useEffect } from "react";
import { AGGREGATOR_URL } from "../lib/constants.js";

export interface TierData {
  address: string;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | null;
  score: number | null;
  volumeZats: number | null;
  updatedAt: string | null;
}

export function useTierData(address: string | null) {
  const [data, setData] = useState<TierData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address) {
      setData(null);
      return;
    }

    const fetchTier = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${AGGREGATOR_URL}/api/reputation/tier?address=${address}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch tier: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch tier"));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchTier();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchTier, 30000);
    return () => clearInterval(interval);
  }, [address]);

  return { data, loading, error };
}

