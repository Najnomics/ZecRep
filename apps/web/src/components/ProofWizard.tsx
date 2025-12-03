"use client";

import { useEffect, useState } from "react";
import type { AggregatorClient } from "@zecrep/sdk/client/aggregator";
import { useProofWizard } from "@zecrep/sdk/hooks/useProofWizard";
import { TierBadge } from "./TierBadge.js";

interface ProofWizardProps {
  client: AggregatorClient;
  onComplete?: () => void;
}

export function ProofWizard({ client, onComplete }: ProofWizardProps) {
  const { state, scan, prove, encrypt, submit, reset } = useProofWizard(client);
  const [viewingKey, setViewingKey] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (state.step === "complete") {
      onComplete?.();
    }
  }, [state.step, onComplete]);

  const disabled = state.scanning || state.proving || state.encrypting || state.submitting;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 space-y-6">
      <div>
        <label className="block text-sm text-slate-400 mb-2">Zcash Viewing Key</label>
        <input
          type="text"
          value={viewingKey}
          onChange={(e) => setViewingKey(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="uview1..."
        />
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-2">Ethereum Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="0x..."
        />
      </div>

      {state.error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {state.error.message}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={() => scan(viewingKey)}
          disabled={!viewingKey || disabled}
          className="w-full rounded-lg bg-white/10 px-6 py-3 text-white hover:bg-white/20 disabled:opacity-40"
        >
          {state.scanning ? "Scanning..." : "1. Scan Shielded Activity"}
        </button>

        <button
          onClick={prove}
          disabled={!state.scanResult || disabled}
          className="w-full rounded-lg bg-white/10 px-6 py-3 text-white hover:bg-white/20 disabled:opacity-40"
        >
          {state.proving ? "Generating proof..." : "2. Generate Range Proof"}
        </button>

        <button
          onClick={encrypt}
          disabled={!state.proofResult || disabled}
          className="w-full rounded-lg bg-white/10 px-6 py-3 text-white hover:bg-white/20 disabled:opacity-40"
        >
          {state.encrypting ? "Encrypting..." : "3. Encrypt Result"}
        </button>

        <button
          onClick={() => submit(address)}
          disabled={!state.proofResult || !address || disabled}
          className="w-full rounded-lg bg-emerald-500 px-6 py-3 text-white hover:bg-emerald-600 disabled:opacity-40"
        >
          {state.submitting ? "Submitting..." : "4. Submit & Mint Badge"}
        </button>
      </div>

      {state.proofResult && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Tier</span>
            <TierBadge tier={state.proofResult.tier as "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"} />
          </div>
          <p className="mt-3 text-xs text-slate-500 break-all">Proof Hash: {state.proofResult.proofHash}</p>
        </div>
      )}

      {state.job && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <div className="flex items-center justify-between">
            <span>Job ID</span>
            <code className="text-xs">{state.job.id}</code>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Status</span>
            <span className="font-semibold">{state.job.status}</span>
          </div>
        </div>
      )}

      {state.step === "complete" && (
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <p className="text-slate-300">
            Badge minted successfully! Your proof job is complete and partners can verify your tier.
          </p>
          <button
            onClick={reset}
            className="rounded-lg border border-white/20 px-6 py-2 text-white hover:border-emerald-500/50"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}
