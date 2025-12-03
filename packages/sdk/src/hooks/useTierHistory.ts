import { useEffect, useState } from "react";
import type { AggregatorClient } from "../client/aggregator.js";

export type TierHistoryEntry = {
  tier: string;
  score: number;
  updatedAt: string;
  encryptedTotal?: string;
  volumeZats?: number;
};

export function useTierHistory(
  client: AggregatorClient,
  address?: string,
  options: { pollInterval?: number; limit?: number } = {}
) {
  const { pollInterval = 10000, limit = 10 } = options;
  const [history, setHistory] = useState<TierHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address) {
      setHistory([]);
      return;
    }

    let canceled = false;
    let timer: NodeJS.Timeout | null = null;

    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const data = await client.getTierHistory(address!, limit);
        if (!canceled) {
          setHistory(data);
        }
      } catch (err) {
        if (!canceled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch tier history"));
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    }

    fetchHistory();

    if (pollInterval > 0) {
      timer = setInterval(fetchHistory, pollInterval);
    }

    return () => {
      canceled = true;
      if (timer) clearInterval(timer);
    };
  }, [client, address, pollInterval, limit]);

  return { history, loading, error };
}

