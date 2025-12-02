"use client";

import { useState } from "react";

/**
 * ZecRep Console - Main application interface for users to:
 * - Connect Zcash/Ethereum wallets
 * - Run proof wizard (scan → proof → encrypt → mint)
 * - View tier status and perks
 * - Manage permissions for partners
 */

export default function ConsolePage() {
  const [step, setStep] = useState<"connect" | "scan" | "prove" | "mint" | "complete">("connect");
  const [ethereumConnected, setEthereumConnected] = useState(false);
  const [zcashConnected, setZcashConnected] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white">ZecRep Console</h1>
          <p className="mt-2 text-slate-400">
            Prove your Zcash activity and mint your reputation NFT
          </p>
        </div>

        {step === "connect" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8">
            <h2 className="text-xl font-medium text-white mb-4">Connect Wallets</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="font-medium text-white">Ethereum Wallet</p>
                  <p className="text-sm text-slate-400">Connect to receive your badge NFT</p>
                </div>
                <button
                  onClick={() => setEthereumConnected(true)}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
                >
                  {ethereumConnected ? "Connected" : "Connect"}
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="font-medium text-white">Zcash Wallet</p>
                  <p className="text-sm text-slate-400">Connect to scan your shielded activity</p>
                </div>
                <button
                  onClick={() => setZcashConnected(true)}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  {zcashConnected ? "Connected" : "Connect"}
                </button>
              </div>
              {ethereumConnected && zcashConnected && (
                <button
                  onClick={() => setStep("scan")}
                  className="w-full rounded-lg bg-emerald-500 px-6 py-3 text-white hover:bg-emerald-600"
                >
                  Continue to Proof Wizard
                </button>
              )}
            </div>
          </div>
        )}

        {step === "scan" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8">
            <h2 className="text-xl font-medium text-white mb-4">Scan Shielded Activity</h2>
            <p className="text-slate-400 mb-6">
              Analyzing your Zcash transactions locally. Your exact amounts never leave your device.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-sm text-slate-300">Scanning shielded notes...</span>
              </div>
              <button
                onClick={() => setStep("prove")}
                className="w-full rounded-lg bg-emerald-500 px-6 py-3 text-white hover:bg-emerald-600"
              >
                Continue (Mock: Found 15.7 ZEC total)
              </button>
            </div>
          </div>
        )}

        {step === "prove" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8">
            <h2 className="text-xl font-medium text-white mb-4">Select Tier to Prove</h2>
            <p className="text-slate-400 mb-6">
              Choose which tier you want to prove. Your exact amount stays hidden.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {["BRONZE", "SILVER", "GOLD", "PLATINUM"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setStep("mint")}
                  className="rounded-lg border border-white/10 bg-white/5 p-6 text-left hover:border-emerald-500/50 hover:bg-white/10 transition"
                >
                  <p className="font-medium text-white">{tier}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {tier === "BRONZE" && "1-2 ZEC"}
                    {tier === "SILVER" && "3-10 ZEC"}
                    {tier === "GOLD" && "10-50 ZEC"}
                    {tier === "PLATINUM" && "50+ ZEC"}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "mint" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8">
            <h2 className="text-xl font-medium text-white mb-4">Generate Proof & Mint NFT</h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Generating zero-knowledge proof...</p>
                <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                  <div className="h-2 w-3/4 animate-pulse rounded-full bg-emerald-400" />
                </div>
              </div>
              <button
                onClick={() => setStep("complete")}
                className="w-full rounded-lg bg-emerald-500 px-6 py-3 text-white hover:bg-emerald-600"
              >
                Mint Badge NFT (Mock)
              </button>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="rounded-2xl border border-emerald-500/50 bg-slate-900/50 p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-medium text-white mb-2">Badge Minted Successfully!</h2>
            <p className="text-slate-400 mb-6">
              Your ZecRep badge is now in your wallet. Show it to DeFi protocols to unlock tier benefits.
            </p>
            <button
              onClick={() => {
                setStep("connect");
                setEthereumConnected(false);
                setZcashConnected(false);
              }}
              className="rounded-lg border border-white/20 px-6 py-3 text-white hover:border-emerald-500/50"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

