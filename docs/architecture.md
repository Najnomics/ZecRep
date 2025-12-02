# ZecRep Architecture

## Overview

ZecRep is a privacy-preserving reputation oracle that bridges Zcash shielded activity into Ethereum DeFi without revealing exact transaction amounts.

## System Components

### 1. Smart Contracts (`packages/contracts`)

- **ZecRepRegistry**: Core registry managing reputation proofs and badge minting
- **ZecRepBadge**: Soulbound ERC-721 NFTs representing user tiers
- **ZecRepGuards**: Library for DeFi protocol integrations
- **Protocol Adapters**: Example contracts for lending, DEX, DAO, and yield protocols

### 2. Aggregator Service (`services/aggregator`)

Fastify-based API service that:
- Orchestrates range proof jobs
- Provides tier query endpoints
- Enforces tier requirements for protocols
- Exposes Prometheus metrics

### 3. Prover CLI (`packages/prover`)

Local proof pipeline that:
- Scans Zcash shielded activity (via lightwalletd)
- Generates zero-knowledge range proofs (Noir)
- Encrypts proofs using FHE (Fhenix Cofhe)
- Submits jobs to aggregator

### 4. Web Application (`apps/web`)

Next.js frontend providing:
- User dashboard for tier status
- Proof wizard flow
- Wallet integration (MetaMask)
- Badge visualization

### 5. TypeScript SDK (`packages/sdk`)

Client library for:
- Aggregator API integration
- Tier queries and validation
- Job submission and polling

## Data Flow

```
User Wallet
    ↓
[Prover CLI]
    ├─> Scan shielded notes (lightwalletd)
    ├─> Generate ZK range proof (Noir)
    └─> Encrypt proof (FHE)
         ↓
[Aggregator Service]
    └─> Job orchestration
         ↓
[Smart Contracts]
    ├─> Verify ZK proof
    ├─> Compare encrypted total (FHE)
    └─> Mint/update badge NFT
         ↓
[DeFi Protocols]
    └─> Read tier → Apply benefits
```

## Privacy Guarantees

1. **Local Scanning**: Shielded activity is scanned locally, never sent to servers
2. **Zero-Knowledge Proofs**: Only range membership is proven (e.g., "10-50 ZEC"), not exact amount
3. **Fully Homomorphic Encryption**: On-chain comparisons work on encrypted values
4. **Soulbound NFTs**: Badges are non-transferable to prevent reputation trading

## Tier System

- **Bronze**: 1-2 ZEC
- **Silver**: 3-10 ZEC
- **Gold**: 10-50 ZEC
- **Platinum**: 50+ ZEC

Each tier grants different multipliers:
- Fee discounts (5-30%)
- LTV boosts (0-10% BPS)
- Governance power (1-2x)
- Yield multipliers (1.125-2.0x)

## Technology Stack

- **Blockchain**: Ethereum (via Fhenix network for FHE support)
- **Zcash Integration**: lightwalletd gRPC service
- **ZKP Framework**: Noir
- **FHE**: Fhenix Cofhe stack
- **Frontend**: Next.js 16, Tailwind CSS
- **Backend**: Fastify, TypeScript
- **Smart Contracts**: Solidity 0.8.25, Foundry
- **Monorepo**: pnpm workspaces, Turbo

## Security Considerations

- **Access Control**: OpenZeppelin roles for registry management
- **Permissioned Contracts**: Fhenix permission system for FHE operations
- **Input Validation**: Zod schemas for API endpoints
- **Error Handling**: Structured error types throughout
- **Testing**: Comprehensive Foundry tests for contracts

## Deployment

See [README.md](../README.md) for deployment instructions.

## Future Enhancements

- Real lightwalletd integration (gRPC client)
- Production Noir circuits
- IPFS metadata storage for badges
- Analytics dashboards
- Multi-chain support

