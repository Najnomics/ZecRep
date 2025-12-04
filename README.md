# ZecRep - Zcash Reputation Oracle on Ethereum

**Category:** Private DeFi & Trading ($3,000)  
**Hackathon:** ZYPHERPUNK x Fhenix  
**Tagline:** *"Prove Zcash activity, earn Ethereum reputation - without revealing amounts"*

[![Fhenix](https://img.shields.io/badge/Fhenix-FHE-purple)](https://fhenix.zone/)
[![Zcash](https://img.shields.io/badge/Zcash-Integration-yellow)](https://z.cash/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🤝 Fhenix + Zcash Implementation

- **Zcash**: We derive ZIP-32 unified viewing keys, stream Sapling + Orchard notes via lightwalletd gRPC, cache scans on disk, and turn accumulated zatoshis into Noir range proofs that only reveal which tier band (Bronze–Platinum) a user qualifies for.
- **Fhenix / Cofhe**: Each range proof output is passed through the Cofhe gateway to produce an `inEuint64` ciphertext. On-chain, `ZecRepRegistry` uses Fhenix’s `FHE.gte` helpers so tier comparisons happen over encrypted data; the exact totals never appear on L1.
- **Bridge**: The aggregator service binds both worlds—calling the prover for Zcash attestations, calling Cofhe for encryption, and pushing soulbound badge updates + guard hooks to Ethereum protocols.

---

## 🧾 Project Description

ZecRep is a privacy-preserving reputation oracle that lets Zcash users convert shielded-wallet history into an on-chain tier badge any Ethereum protocol can trust. By combining ZK range proofs, FHE comparisons, and a job-oriented aggregator, we unlock credit-style utility for shielded capital without exposing balances or flows.

## ❗ Problem Statement

- Zcash users must reveal their entire shielded history to access DeFi credit lines, governance boosts, or fee rebates.
- Protocols lack a trustworthy way to measure private capital while staying compliant with on-chain guardrails.
- Existing identity or reputation systems either leak exact asset amounts or rely on opaque, centralized attesters.

## ✅ Solution Overview

1. **Deterministic Scan + Proof** – The prover scans lightwalletd for Sapling/Orchard notes, memoizes results locally, and generates Noir range proofs that only reveal which ZEC range the user belongs to.
2. **Encrypted Comparison via FHE** – The range proof output is encrypted with Fhenix Cofhe. Smart contracts run `FHE.gte` comparisons to check tiers without decrypting totals.
3. **Aggregator + SDK** – A Fastify aggregator orchestrates async jobs, exposes REST + SDK endpoints, enforces guards, and records Prometheus metrics so frontends can monitor job lifecycle.
4. **Soulbound Badge + Guards** – `ZecRepBadge` mints a non-transferable tier NFT while `ZecRepGuards` give protocols a single `requireTier` hook for gating perks and fee schedules.

---

## 🧭 Flow Charts

### User Journey (Console POV)

```mermaid
flowchart LR
    A[Connect Shielded Wallet] --> B[Paste Viewing Key + 0x Address]
    B --> C[Submit Proof Job via Web Console]
    C --> D[Aggregator Job Created (202 Accepted)]
    D --> E[Proof Wizard Polls Job Status]
    E --> F{Job Completed?}
    F -- Yes --> G[Encrypted Tier + Proof Hash Returned]
    G --> H[Badge + Tier Dashboard Updates]
    F -- Retry/Error --> I[User Sees Error + Retry CTA]
```

### Technical Pipeline

```mermaid
flowchart TD
    VK[Zcash Viewing Key] -->|scanShieldedActivity| P1(Prover Pipeline)
    subgraph Prover
        P1 --> C1[Disk Scan Cache]
        C1 -->|cache miss| LWD[lightwalletd mock/grpc]
        LWD --> RP[Noir Range Proof]
        RP --> FHE[Fhenix Cofhe Encrypt]
        FHE --> Artifact[Proof Artifact (tier, totalZats, cipher)]
    end
    Artifact --> AGG[Aggregator Service]
    subgraph Aggregator
        AGG --> Storage[(Postgres/Memory Jobs)]
        AGG --> Metrics[(Prometheus)]
        AGG --> Webhooks[(Partner Callbacks)]
    end
    AGG --> SDK[@zecrep/sdk]
    SDK --> Web[Next.js Console (useProofWizard)]
    AGG --> Contracts[ZecRepBadge & Guards]
    Contracts --> Protocols[DeFi Integrations]
```

---

## 📋 Quick Links

- **[Integration Guide](./docs/integration-guide.md)** - For DeFi protocols integrating ZecRep
- **[Proof Pipeline Docs](./docs/proof-pipeline.md)** - Technical details on scanning and proving
- **[Roadmap](./docs/roadmap.md)** - Implementation progress and next steps
- **[Protocol Examples](./packages/contracts/src/examples/)** - Working adapter contracts

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10.17.1+
- Foundry (for contract development)

### Installation

```bash
# Clone the repository
git clone https://github.com/zecrep/zecrep.git
cd zecrep

# Install dependencies
pnpm install

# Build all packages
pnpm turbo build
```

### Run Services

```bash
# Start aggregator service
pnpm --filter @zecrep/aggregator dev

# Start web frontend
pnpm --filter @zecrep/web dev

# Run contract tests
pnpm --filter @zecrep/contracts test
```

### Docker Deployment

```bash
# Start all services with Docker Compose
docker-compose up
```

---

## 🏗️ Architecture

### Monorepo Structure

```
├── apps/
│   └── web/              # Next.js frontend console
├── packages/
│   ├── contracts/        # Solidity contracts (Foundry)
│   ├── prover/           # Proof pipeline CLI (Noir + Cofhe)
│   └── sdk/              # TypeScript SDK
├── services/
│   └── aggregator/       # Fastify API service
└── docs/                 # Documentation
```

### Core Components

1. **Smart Contracts** (`packages/contracts`)
   - `ZecRepRegistry`: Core reputation registry with FHE tier logic
   - `ZecRepBadge`: Soulbound ERC-721 NFT for reputation badges
   - `ZecRepGuards`: Helper library for protocol integrations
   - Example adapters: Lending, DEX, DAO, Yield

2. **Proof Pipeline** (`packages/prover`)
   - Zcash shielded activity scanning (lightwalletd integration)
   - Zero-knowledge range proofs (Noir circuits)
   - FHE encryption via Cofhe/Fhenix gateway
   - CLI for proof generation and submission

3. **Aggregator Service** (`services/aggregator`)
   - Job orchestration for async proof processing
   - Tier query endpoints
   - Guard enforcement helpers
   - Integration with Cofhe gateway

4. **Web Console** (`apps/web`)
   - User-friendly proof wizard
   - Wallet connectivity (Zcash + Ethereum)
   - Tier status dashboard
   - Badge management

---

## 🔌 Integration

### For DeFi Protocols

```solidity
import { ZecRepGuards } from "@zecrep/contracts/ZecRepGuards.sol";

contract MyProtocol {
    using ZecRepGuards for ZecRepRegistry;
    
    ZecRepRegistry public immutable zecRep;
    
    function myFunction(address user) external {
        // Require Gold tier or above
        zecRep.requireTier(user, uint8(ZecRepRegistry.TierLevel.GOLD));
        
        // Apply tier-based fee discount
        uint256 discount = zecRep.getFeeDiscountMultiplier(user);
        uint256 fee = baseFee * discount / 1e18;
    }
}
```

See [Integration Guide](./docs/integration-guide.md) for complete examples.

### Using the SDK

```typescript
import { AggregatorClient } from "@zecrep/sdk";

const client = new AggregatorClient("https://aggregator.zecrep.xyz");
const tierData = await client.getTier(userAddress);
console.log(`Tier: ${tierData.tier}, Score: ${tierData.score}`);
```

---

## 🧪 Development

### Contracts

```bash
# Run tests
pnpm --filter @zecrep/contracts test

# Deploy to local network
pnpm --filter @zecrep/contracts script script/Deploy.s.sol:DeployZecRep
```

### Prover CLI

```bash
# Generate proof (mock mode)
pnpm --filter @zecrep/prover dev run \
  --address 0x... \
  --viewing-key vk_...

# Poll job status
pnpm --filter @zecrep/prover dev jobs:tail --id <job-id>
```

### Services

```bash
# Aggregator
pnpm --filter @zecrep/aggregator dev

# Frontend
pnpm --filter @zecrep/web dev
```

---

## 📊 Tier System

| Tier | Range | Score | Fee Discount | LTV Boost | Vote Weight | Yield Multiplier |
|------|-------|-------|--------------|-----------|-------------|------------------|
| Bronze | 1-2 ZEC | 100 | 5% | 0% | 1.25x | 1.125x |
| Silver | 3-10 ZEC | 200 | 10% | 5% | 1.5x | 1.25x |
| Gold | 10-50 ZEC | 500 | 20% | 10% | 2x | 1.5x |
| Platinum | 50+ ZEC | 1000 | 30% | 20% | 3x | 2x |

---

## 🔒 Privacy Guarantees

- **Exact amounts never revealed**: Only range proofs are published
- **Encrypted on-chain storage**: FHE ciphertext stored, never decrypted
- **Local proof generation**: Zcash transactions analyzed on your device
- **Tier-only disclosure**: Protocols see tier, not exact amounts

---

## 📚 Documentation

- [Integration Guide](./docs/integration-guide.md) - DeFi protocol integration
- [Proof Pipeline](./docs/proof-pipeline.md) - Technical proof generation flow
- [Roadmap](./docs/roadmap.md) - Implementation progress
- [Context Survey](./docs/context-survey.md) - Reference repository notes

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

**Built for ZYPHERPUNK x Fhenix Hackathon**

*Making DeFi accessible to Zcash users without compromising privacy*
