const stats = [
  { label: "Zcash liquidity unlocked", value: "$3.5B+" },
  { label: "Encrypted proofs minted", value: "1,024" },
  { label: "Partner protocols", value: "12" },
];

const proofFlow = [
  {
    title: "1 · Generate range proof locally",
    description:
      "Choose the tier you want to prove. ZecRep analyzes shielded transactions inside your browser—raw amounts never leave your device.",
  },
  {
    title: "2 · Encrypt via Fhenix FHE",
    description:
      "We wrap the proof and range value inside Fhenix’s Cofhe stack so every on-chain comparison is homomorphically encrypted.",
  },
  {
    title: "3 · On-chain verification",
    description:
      "Smart contracts validate the ZK proof, perform encrypted ≥ comparisons, and determine the exact tier without revealing the total.",
  },
  {
    title: "4 · Mint soulbound reputation",
    description:
      "A non-transferable badge stores your tier, score, and proof hash. DeFi protocols read the tier and reward you instantly.",
  },
];

const tiers = [
  {
    name: "Bronze",
    range: "1 – 2 ZEC",
    score: "100 pts",
    perks: ["5% fee rebates", "Starter governance multiplier", "Proof refresh every 30 days"],
  },
  {
    name: "Silver",
    range: "3 – 10 ZEC",
    score: "200 pts",
    perks: ["10% fee rebates", "+5% LTV on lending markets", "Priority support across partners"],
  },
  {
    name: "Gold",
    range: "10 – 50 ZEC",
    score: "500 pts",
    perks: ["20% fee rebates", "VIP liquidation protection", "2× governance power + closed beta access"],
  },
  {
    name: "Platinum",
    range: "50+ ZEC",
    score: "1,000 pts",
    perks: ["30% fee rebates", "White-glove account manager", "Institutional APIs + revenue sharing"],
  },
];

const integrations = [
  {
    name: "Lending engines",
    highlight: "Dynamic LTV & rates based on tier thresholds.",
  },
  {
    name: "DEX & RFQ desks",
    highlight: "Programmatic maker rebates + OTC allowlists.",
  },
  {
    name: "Yield / vaults",
    highlight: "Boost multipliers and private pool access.",
  },
  {
    name: "DAOs & identity",
    highlight: "Sybil resistance with privacy-preserving voting weights.",
  },
];

const toolkit = [
  {
    label: "Foundry + Cofhe mocks",
    detail: "Deterministic simulations of encrypted math for fast CI.",
  },
  {
    label: "Type-safe SDK",
    detail: "React hooks + wagmi connectors for proof orchestration.",
  },
  {
    label: "Ready-made tasks",
    detail: "Deploy scripts for Sepolia, Arbitrum, and local Fhenix.",
  },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-slate-950 px-6 pb-24 pt-16 text-slate-100 sm:px-8 lg:px-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent blur-[120px]" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20">
        <section className="glass-panel relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-900/60 px-8 py-12 shadow-2xl">
          <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.2em] text-emerald-200/80">
            <span className="rounded-full border border-emerald-300/20 px-3 py-1 text-emerald-100">Encrypted Beta</span>
            <span>FHE powered reputation bridge</span>
          </div>

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl">
                Prove Zcash history. Earn Ethereum reputation. Stay private.
              </h1>
              <p className="text-lg text-slate-300">
                ZecRep turns shielded activity into a verifiable, tiered NFT by combining ZK range proofs with
                fully-homomorphic comparisons on Fhenix. Lenders, DEXs, and DAOs get a clean signal while your exact
                ZEC balance remains encrypted forever.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://app.zecrep.xyz"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-400/90 px-6 py-3 text-slate-950 transition hover:bg-emerald-300"
                >
                  Launch ZecRep Console
                  <span aria-hidden>↗</span>
                </a>
                <a
                  href="https://docs.zecrep.xyz"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-slate-200 transition hover:border-emerald-200/60 hover:text-white"
                >
                  Read the technical brief
                </a>
              </div>
            </div>
            <div className="grid w-full gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 md:max-w-sm">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          <div className="glass-panel rounded-3xl p-8 lg:col-span-1">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Why now</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Shielded proof, public utility</h2>
            <p className="mt-4 text-slate-300">
              Zcash users are locked out of DeFi because revealing raw flows destroys privacy. ZecRep flips the script
              with range proofs, encrypted tier logic, and a soulbound badge any protocol can trust.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-300" aria-hidden />
                Fully homomorphic comparisons keep exact amounts sealed.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-300" aria-hidden />
                Tier metadata is portable via an ERC-721 soulbound badge.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-300" aria-hidden />
                Messaged proofs include permissioned sealOutput helpers for wallets and partners.
              </li>
            </ul>
          </div>
          <div className="glass-panel rounded-3xl p-8 lg:col-span-2">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Encrypted workflow</p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {proofFlow.map((step) => (
                <div key={step.title} className="rounded-2xl border border-white/5 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">{step.title}</p>
                  <p className="mt-3 text-sm text-slate-200">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Tier system</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Range proofs mapped to clear utility</h2>
              <p className="mt-3 max-w-2xl text-slate-300">
                Each tier corresponds to a ZK-proven range. Protocols can require a minimum tier, award higher score
                multipliers, or stream custom perks without knowing how much ZEC was involved.
              </p>
            </div>
            <a
              href="https://docs.zecrep.xyz/tier-system"
              className="inline-flex items-center gap-2 text-sm text-emerald-200 transition hover:text-white"
            >
              Explore tier math
              <span aria-hidden>↗</span>
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <div key={tier.name} className="glass-panel rounded-3xl p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">{tier.name}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{tier.range}</p>
                <p className="text-sm text-slate-400">{tier.score}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-200">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="glass-panel rounded-3xl p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Plug &amp; Play</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Integration targets</h2>
            <div className="mt-6 space-y-4">
              {integrations.map((item) => (
                <div key={item.name} className="rounded-2xl border border-white/5 bg-white/5 p-5">
                  <p className="text-base font-medium text-white">{item.name}</p>
                  <p className="text-sm text-slate-300">{item.highlight}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Builder toolkit</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Ship FHE contracts like a pro</h2>
            <div className="mt-6 space-y-4">
              {toolkit.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/5 bg-white/5 p-5">
                  <p className="text-base font-medium text-white">{item.label}</p>
                  <p className="text-sm text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-5 text-sm text-emerald-100">
              Cofhe Foundry template, permission helpers, and sealOutput fixtures are already wired up inside this
              monorepo. Clone, run `forge test`, and you are ready to extend the protocol.
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Timeline</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">From hackathon win to production rollout</h2>
            </div>
            <a
              href="https://github.com/zecrep/roadmap"
              className="text-sm text-emerald-200 transition hover:text-white"
            >
              View public roadmap ↗
            </a>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Milestone 01</p>
              <p className="mt-2 text-lg font-medium text-white">Encrypted proof pipeline</p>
              <p className="text-sm text-slate-300">ZK circuits + Cofhe mocks + Foundry CI</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Milestone 02</p>
              <p className="mt-2 text-lg font-medium text-white">Mainnet partner pilots</p>
              <p className="text-sm text-slate-300">Lending + DEX rebates gated by Gold/Platinum</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Milestone 03</p>
              <p className="mt-2 text-lg font-medium text-white">Permissionless rollout</p>
              <p className="text-sm text-slate-300">SDK + aggregator API so any protocol can query tiers.</p>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Join the encrypted reputation network</p>
          <h2 className="mt-4 text-4xl font-semibold text-white">
            Ready to bridge Zcash trust into every DeFi primitive?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Whether you are a wallet, protocol, or power user, ZecRep lets you reason about private capital without
            sacrificing privacy. Spin up the contracts, integrate the SDK, and start rewarding shielded credit history.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:team@zecrep.xyz"
              className="inline-flex items-center rounded-full bg-white px-6 py-3 text-slate-900 transition hover:bg-slate-200"
            >
              Book a technical deep dive
            </a>
            <a
              href="https://discord.gg/zecrep"
              className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-white transition hover:border-emerald-200/40"
            >
              Join the Discord
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
