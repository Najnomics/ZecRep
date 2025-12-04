"use client";

import { useEffect, useMemo } from "react";
import type { AggregatorClient, ProofWizardStep } from "@zecrep/sdk";
import { useProofWizard } from "@zecrep/sdk";
import { TierBadge } from "./TierBadge";

interface ProofWizardProps {
  client: AggregatorClient;
  viewingKey: string;
  onViewingKeyChange: (value: string) => void;
  address: string;
  onAddressChange: (value: string) => void;
  onComplete?: () => void;
}

const stepRank: Record<ProofWizardStep, number> = {
  idle: -1,
  scan: 0,
  prove: 1,
  encrypt: 2,
  submit: 3,
  complete: 4,
};

const pipelineSteps = [
  {
    key: "scan" as const,
    title: "Scan Shielded Activity",
    detail: "Derive Sapling & Orchard totals via lightwalletd",
  },
  {
    key: "prove" as const,
    title: "Generate Range Proof",
    detail: "Run Noir circuit for tier membership",
  },
  {
    key: "encrypt" as const,
    title: "Encrypt Result",
    detail: "Seal totals with Fhenix Cofhe gateway",
  },
  {
    key: "submit" as const,
    title: "Submit & Mint Badge",
    detail: "Persist encrypted tier in ZecRep Registry",
  },
];

export function ProofWizard({
  client,
  viewingKey,
  onViewingKeyChange,
  address,
  onAddressChange,
  onComplete,
}: ProofWizardProps) {
  const { state, start, reset } = useProofWizard(client);

  useEffect(() => {
    if (state.step === "complete") {
      onComplete?.();
    }
  }, [state.step, onComplete]);

  const currentRank = stepRank[state.step];
  const stepState = (key: (typeof pipelineSteps)[number]["key"]) => {
    const target = stepRank[key];
    if (currentRank > target) return "done";
    if (currentRank === target) return "active";
    return "pending";
  };

  const isJobActive = useMemo(
    () => state.job && (state.job.status === "pending" || state.job.status === "processing"),
    [state.job]
  );
  const actionDisabled =
    state.submitting || Boolean(isJobActive) || !viewingKey || !address || Boolean(state.error && !state.job);

  const runProof = () => {
    start(viewingKey, address);
  };

  const formatZec = (totalZats: bigint) => {
    const zecValue = Number(totalZats) / 1e8;
    return `${zecValue.toFixed(4)} ZEC`;
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Zcash Viewing Key</label>
          <input
            type="text"
            value={viewingKey}
            onChange={(e) => onViewingKeyChange(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="uview1..."
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-2">Ethereum Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0x..."
          />
        </div>
      </div>

      {state.error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {state.error.message}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={runProof}
          disabled={actionDisabled}
          className="w-full rounded-lg bg-emerald-500 px-6 py-3 text-white hover:bg-emerald-600 disabled:opacity-40"
        >
          {state.submitting
            ? "Submitting job..."
            : isJobActive
              ? "Processing proof job..."
              : "Run Proof Job"}
        </button>
        <button
          onClick={reset}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-emerald-400/60"
        >
          Reset Wizard
        </button>
      </div>

      <div className="space-y-3">
        {pipelineSteps.map((step) => {
          const status = stepState(step.key);
          const baseClasses =
            "rounded-lg border px-4 py-3 transition-colors flex items-center justify-between gap-4";
          const statusClasses =
            status === "done"
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
              : status === "active"
                ? "border-white/40 bg-white/5 text-white"
                : "border-white/10 text-slate-400";

          return (
            <div key={step.key} className={`${baseClasses} ${statusClasses}`}>
              <div>
                <p className="font-medium">{step.title}</p>
                <p className="text-xs text-slate-400">{step.detail}</p>
              </div>
              <span className="text-xs uppercase tracking-wide">
                {status === "done" ? "Done" : status === "active" ? "Running" : "Pending"}
              </span>
            </div>
          );
        })}
      </div>

      {state.job && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span>Job ID</span>
            <code className="text-xs">{state.job.id}</code>
          </div>
          <div className="flex items-center justify-between">
            <span>Status</span>
            <span className="font-semibold text-white">{state.job.status}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Submitted</span>
            <span>{new Date(state.job.submittedAt).toLocaleString()}</span>
          </div>
        </div>
      )}

      {state.proofResult && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Tier</span>
            <TierBadge tier={state.proofResult.tier as "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"} />
          </div>
          <p className="text-xs text-slate-400 break-all">Proof Hash: {state.proofResult.proofHash}</p>
        </div>
      )}

      {state.scanResult && (
        <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span>Notes Scanned</span>
            <span className="font-semibold text-white">{state.scanResult.totalNotes}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Total Volume</span>
            <span className="font-semibold text-white">{formatZec(state.scanResult.totalZats)}</span>
          </div>
        </div>
      )}

      {state.encryptedResult && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span>Encrypted Payload</span>
            <code className="text-xs break-all">{state.encryptedResult.encryptedPayload}</code>
          </div>
          {state.encryptedResult.inEuint64 && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Security Zone</span>
              <span>{state.encryptedResult.inEuint64.securityZone}</span>
            </div>
          )}
        </div>
      )}

      {state.step === "complete" && (
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <p className="text-slate-300">
            Badge minted! Your encrypted tier is recorded and partners can now verify your reputation.
          </p>
        </div>
      )}
    </div>
  );
}
