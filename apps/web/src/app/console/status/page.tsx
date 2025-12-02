"use client";

/**
 * ZecRep Status Page - View current tier, badges, and perks
 */

export default function StatusPage() {
  // Mock data - will be replaced with real queries
  const badge = {
    tier: "GOLD",
    score: 500,
    range: "10-50 ZEC",
    mintedAt: "2024-12-01",
    tokenId: "0x742d...",
  };

  const perks = [
    { name: "Fee Discount", value: "20%", description: "Applied across all integrated protocols" },
    { name: "LTV Boost", value: "+10%", description: "Higher loan-to-value on lending platforms" },
    { name: "Vote Weight", value: "2x", description: "Double voting power in DAOs" },
    { name: "Yield Multiplier", value: "1.5x", description: "Boosted rewards in yield protocols" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white">My ZecRep Status</h1>
          <p className="mt-2 text-slate-400">View your reputation tier and unlockable perks</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/60 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">🥇</div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">{badge.tier} Tier</h2>
                  <p className="text-slate-400">Score: {badge.score} points</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                <p>Proven Range: {badge.range}</p>
                <p>Badge NFT: {badge.tokenId}</p>
                <p>Minted: {badge.mintedAt}</p>
              </div>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
              <p className="text-xs uppercase tracking-wide text-emerald-200">Active</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Tier Perks</h3>
            <div className="space-y-4">
              {perks.map((perk) => (
                <div key={perk.name} className="rounded-lg border border-white/5 bg-white/5 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-white">{perk.name}</p>
                    <p className="text-emerald-400 font-semibold">{perk.value}</p>
                  </div>
                  <p className="text-sm text-slate-400">{perk.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Upgrade Path</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                <div>
                  <p className="font-medium text-white">Current: Gold</p>
                  <p className="text-xs text-slate-400">10-50 ZEC range</p>
                </div>
                <span className="text-emerald-400">✓</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                <div>
                  <p className="font-medium text-white">Next: Platinum</p>
                  <p className="text-xs text-slate-400">50+ ZEC range</p>
                </div>
                <span className="text-slate-500">→</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Prove additional activity to upgrade your tier and unlock more perks.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

