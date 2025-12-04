"use client";

import { useMemo, useState } from "react";
import { AggregatorClient } from "@zecrep/sdk";
import { ProofWizard } from "../../components/ProofWizard";
import { JobHistory } from "../../components/JobHistory";
import { TierHistory } from "../../components/TierHistory";
import { AGGREGATOR_URL } from "../../lib/constants";

/**
 * ZecRep Console - Main application interface for users to:
 * - Connect Zcash/Ethereum wallets
 * - Run proof wizard (scan → proof → encrypt → mint)
 * - View tier status and perks
 * - Manage permissions for partners
 */

export default function ConsolePage() {
  const [ethereumConnected, setEthereumConnected] = useState(false);
  const [zcashConnected, setZcashConnected] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [viewingKey, setViewingKey] = useState("");
  const [address, setAddress] = useState("");
  const aggregatorClient = useMemo(() => new AggregatorClient(AGGREGATOR_URL), []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white">ZecRep Console</h1>
          <p className="mt-2 text-slate-400">
            Prove your Zcash activity and mint your reputation NFT
          </p>
        </div>

        {!showWizard ? (
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
                  onClick={() => setShowWizard(true)}
                  className="w-full rounded-lg bg-emerald-500 px-6 py-3 text-white hover:bg-emerald-600"
                >
                  Continue to Proof Wizard
                </button>
              )}
            </div>
          </div>
        ) : (
          <ProofWizard
            client={aggregatorClient}
            viewingKey={viewingKey}
            onViewingKeyChange={setViewingKey}
            address={address}
            onAddressChange={setAddress}
            onComplete={() => {
              setShowWizard(false);
              setEthereumConnected(false);
              setZcashConnected(false);
            }}
          />
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <JobHistory client={aggregatorClient} address={address} />
          <TierHistory client={aggregatorClient} address={address} />
        </div>
      </div>
    </main>
  );
}

