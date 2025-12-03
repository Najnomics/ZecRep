"use client";

import type { AggregatorClient } from "@zecrep/sdk/client/aggregator";
import { useJobs } from "@zecrep/sdk/hooks/useJobs";

interface JobHistoryProps {
  client: AggregatorClient;
  address?: string;
}

export function JobHistory({ client, address }: JobHistoryProps) {
  const { jobs, loading, error } = useJobs(client, {
    address,
    limit: 5,
    pollInterval: 5000,
  });

  if (!address) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-sm text-slate-400">
        Connect your wallets to view job history.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Recent Proof Jobs</h3>
          <p className="text-sm text-slate-400">Live updates every 5 seconds</p>
        </div>
        {loading && <span className="text-xs text-emerald-300">Refreshing...</span>}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error.message}
        </div>
      )}

      {jobs.length === 0 ? (
        <p className="text-sm text-slate-400">No jobs submitted yet.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Job ID</span>
                  <code className="text-xs">{job.id.slice(0, 10)}...</code>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-slate-500">Status</span>
                  <span className="font-semibold text-white">{job.status}</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-slate-400">
                <span>Tier: {job.tier}</span>
                <span>Updated: {job.updatedAt ?? job.submittedAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

