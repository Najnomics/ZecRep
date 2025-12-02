# Environment Setup Guide

Complete guide for configuring all ZecRep services.

## Aggregator Service

Create `services/aggregator/.env`:

```bash
PORT=4100
LOG_LEVEL=info
ZCASH_LIGHTWALLETD_URL=https://lightwalletd.example.net
FHE_GATEWAY_URL=https://api.helium.fhenix.zone
REGISTRY_ADDRESS=0x0000000000000000000000000000000000000000
```

**Required Variables:**
- `PORT`: Server port (default: 4100)
- `LOG_LEVEL`: Logging level (trace|debug|info|warn|error|fatal)
- `ZCASH_LIGHTWALLETD_URL`: lightwalletd gRPC endpoint
- `FHE_GATEWAY_URL`: Fhenix FHE gateway URL
- `REGISTRY_ADDRESS`: Deployed ZecRepRegistry contract address

## Prover CLI

Create `.env` in project root or set environment variables:

```bash
LIGHTWALLETD_URL=https://lightwalletd.example.net
FHE_GATEWAY_URL=https://api.helium.fhenix.zone
AGGREGATOR_URL=http://localhost:4100
REGISTRY_ADDRESS=0x0000000000000000000000000000000000000000
LOG_LEVEL=info

# Optional pipeline settings
ENABLE_NOIR_PROOFS=false
ENABLE_FHE_ENCRYPTION=true
MAX_NOTES_TO_SCAN=1000
BLOCK_SCAN_RANGE=1000
PROOF_TIMEOUT=300
ENCRYPTION_TIMEOUT=60
```

**Required Variables:**
- `LIGHTWALLETD_URL`: lightwalletd endpoint
- `FHE_GATEWAY_URL`: Fhenix FHE gateway
- `AGGREGATOR_URL`: Aggregator service URL
- `REGISTRY_ADDRESS`: Registry contract address

**Optional Variables:**
- `ENABLE_NOIR_PROOFS`: Enable real Noir proving (default: false)
- `ENABLE_FHE_ENCRYPTION`: Enable real FHE encryption (default: true)
- `MAX_NOTES_TO_SCAN`: Maximum notes to scan per request
- `BLOCK_SCAN_RANGE`: Block height range to scan
- `PROOF_TIMEOUT`: Proof generation timeout (seconds)
- `ENCRYPTION_TIMEOUT`: Encryption timeout (seconds)

## Web Application

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_AGGREGATOR_URL=http://localhost:4100
NEXT_PUBLIC_REGISTRY_ADDRESS=0x0000000000000000000000000000000000000000
```

**Required Variables:**
- `NEXT_PUBLIC_AGGREGATOR_URL`: Aggregator service URL (client-accessible)
- `NEXT_PUBLIC_REGISTRY_ADDRESS`: Registry contract address

## Contract Deployment

Create `.env` in `packages/contracts/` or set environment variables:

```bash
PRIVATE_KEY=0x...
RPC_URL=https://api.helium.fhenix.zone
REGISTRY_ADDRESS=0x0000000000000000000000000000000000000000
BADGE_ADDRESS=0x0000000000000000000000000000000000000000
```

**Required Variables:**
- `PRIVATE_KEY`: Deployer private key (without 0x prefix)
- `RPC_URL`: Fhenix RPC endpoint

## Development vs Production

### Development
- Use mock services (lightwalletd mock endpoint)
- Disable real Noir proving
- Use localhost URLs
- Set `LOG_LEVEL=debug` for verbose output

### Production
- Use real lightwalletd endpoint
- Enable Noir proving
- Use production URLs
- Set `LOG_LEVEL=info` or `warn`
- Use environment-specific registry addresses

## Quick Start

```bash
# Copy example env files
cp services/aggregator/env.example services/aggregator/.env
cp apps/web/.env.example apps/web/.env.local  # if exists

# Update values as needed
# Then run services
pnpm --filter @zecrep/aggregator dev
pnpm --filter @zecrep/web dev
```

## Security Notes

- Never commit `.env` files to version control
- Use different keys/addresses for development and production
- Rotate keys regularly
- Store production secrets in a secure vault (e.g., AWS Secrets Manager)

