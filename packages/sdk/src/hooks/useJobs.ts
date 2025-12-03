import { useEffect, useState } from "react";
import type { AggregatorClient } from "../client/aggregator.js";
import type { RangeJob, JobStatus } from "../types.js";

export type UseJobsOptions = {
  address?: string;
  status?: JobStatus;
  pollInterval?: number;
  limit?: number;
};

export type UseJobsResult = {
  jobs: RangeJob[];
  loading: boolean;
  error: Error | null;
};

/**
 * React hook for listing aggregator jobs with optional polling.
 */
export function useJobs(client: AggregatorClient, options: UseJobsOptions = {}): UseJobsResult {
  const { address, status, pollInterval = 5000, limit = 10 } = options;
  const [jobs, setJobs] = useState<RangeJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: NodeJS.Timeout | null = null;

    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        const result = await client.listJobs({
          address,
          status,
          limit,
        });
        if (!cancelled) {
          setJobs(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch jobs"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchJobs();

    if (pollInterval > 0) {
      timer = setInterval(fetchJobs, pollInterval);
    }

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [client, address, status, pollInterval, limit]);

  return { jobs, loading, error };
}

