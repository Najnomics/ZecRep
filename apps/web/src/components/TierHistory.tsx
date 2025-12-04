"use client";

import type { AggregatorClient } from "@zecrep/sdk";
import { useTierHistory } from "@zecrep/sdk";

interface TierHistoryProps {
  client: AggregatorClient;
  address?: string;
}

export function TierHistory({ client, address }: TierHistoryProps) {
  const { history, loading, error } = useTierHistory(client, address, { limit: 5, pollInterval: 15000 });

  if (!address) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-sm text-slate-400">
        Connect your wallets to view tier history.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Tier History</h3>
          <p className="text-sm text-slate-400">Latest badge updates</p>
        </div>
        {loading && <span className="text-xs text-emerald-300">Refreshing...</span>}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error.message}
        </div>
      )}

      {history.length === 0 ? (
        <p className="text-sm text-slate-400">No tier history recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {history.map((entry, idx) => (
            <div
              key={`${entry.updatedAt}-${idx}`}
              className="rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-300"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{entry.tier}</span>
                <span className="text-xs text-slate-500">{new Date(entry.updatedAt).toLocaleString()}</span>
              </div>
              <div className="mt-2 text-xs text-slate-400">Score: {entry.score}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

