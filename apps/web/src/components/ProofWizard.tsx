"use client";

import { useState } from "react";
import { TierBadge } from "./TierBadge.js";

type WizardStep = "scan" | "prove" | "encrypt" | "submit" | "complete";

interface ProofWizardProps {
  onComplete?: () => void;
}

export function ProofWizard({ onComplete }: ProofWizardProps) {
  const [step, setStep] = useState<WizardStep>("scan");
  const [tier, setTier] = useState<string | null>(null);

  const handleScan = () => {
    // TODO: Implement actual scanning
    setTimeout(() => {
      setStep("prove");
    }, 2000);
  };

  const handleProve = () => {
    // TODO: Implement actual proof generation
    setTimeout(() => {
      setTier("GOLD");
      setStep("encrypt");
    }, 3000);
  };

  const handleEncrypt = () => {
    // TODO: Implement actual encryption
    setTimeout(() => {
      setStep("submit");
    }, 2000);
  };

  const handleSubmit = () => {
    // TODO: Implement actual submission
    setTimeout(() => {
      setStep("complete");
      onComplete?.();
    }, 2000);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8">
      {step === "scan" && (
        <div>
          <h2 className="text-xl font-medium text-white mb-4">Scan Shielded Activity</h2>
          <p className="text-slate-400 mb-6">
            Analyzing your Zcash transactions locally. Your exact amounts never leave your device.
          </p>
          <button
            onClick={handleScan}
            className="w-full rounded-lg bg-emerald-500 px-6 py-3 text-white hover:bg-emerald-600 transition"
          >
            Start Scan
          </button>
        </div>
      )}

      {step === "prove" && (
        <div>
          <h2 className="text-xl font-medium text-white mb-4">Generate Range Proof</h2>
          <p className="text-slate-400 mb-6">
            Creating a zero-knowledge proof to verify your tier without revealing the exact amount.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-sm text-slate-300">Generating proof...</span>
            </div>
            <button
              onClick={handleProve}
              className="w-full rounded-lg bg-emerald-500 px-6 py-3 text-white hover:bg-emerald-600 transition"
            >
              Generate Proof
            </button>
          </div>
        </div>
      )}

      {step === "encrypt" && tier && (
        <div>
          <h2 className="text-xl font-medium text-white mb-4">Encrypt Result</h2>
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
              <span className="text-slate-400">Tier</span>
              <TierBadge tier={tier as any} />
            </div>
            <p className="text-slate-400 text-sm">
              Encrypting your tier using FHE for on-chain storage.
            </p>
          </div>
          <button
            onClick={handleEncrypt}
            className="w-full rounded-lg bg-emerald-500 px-6 py-3 text-white hover:bg-emerald-600 transition"
          >
            Encrypt
          </button>
        </div>
      )}

      {step === "submit" && (
        <div>
          <h2 className="text-xl font-medium text-white mb-4">Submit to Registry</h2>
          <p className="text-slate-400 mb-6">
            Submitting your encrypted proof to the ZecRep registry on Ethereum.
          </p>
          <button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-emerald-500 px-6 py-3 text-white hover:bg-emerald-600 transition"
          >
            Submit & Mint Badge
          </button>
        </div>
      )}

      {step === "complete" && (
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-medium text-white mb-2">Badge Minted Successfully!</h2>
          {tier && (
            <div className="flex justify-center mb-4">
              <TierBadge tier={tier as any} size="lg" />
            </div>
          )}
          <p className="text-slate-400 mb-6">
            Your ZecRep badge is now in your wallet. Show it to DeFi protocols to unlock tier benefits.
          </p>
        </div>
      )}
    </div>
  );
}

