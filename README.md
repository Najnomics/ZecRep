# ZecRep - Zcash Reputation Oracle on Ethereum

**Category:** Private DeFi & Trading ($3,000)  
**Hackathon:** ZYPHERPUNK x Fhenix  
**Tagline:** *"Prove Zcash activity, earn Ethereum reputation - without revealing amounts"*

[![Fhenix](https://img.shields.io/badge/Fhenix-FHE-purple)](https://fhenix.zone/)
[![Zcash](https://img.shields.io/badge/Zcash-Integration-yellow)](https://z.cash/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

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
