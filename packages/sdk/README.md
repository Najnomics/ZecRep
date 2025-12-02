# @zecrep/sdk

TypeScript SDK for integrating ZecRep reputation tiers into your applications.

## Installation

```bash
pnpm add @zecrep/sdk
# or
npm install @zecrep/sdk
# or
yarn add @zecrep/sdk
```

## Usage

### Aggregator Client

```typescript
import { AggregatorClient } from "@zecrep/sdk";

const client = new AggregatorClient("https://aggregator.zecrep.xyz");

// Get user tier
const tierData = await client.getTier("0x...");
console.log(`Tier: ${tierData.tier}, Score: ${tierData.score}`);

// Check tier requirement
const canAccess = await client.meetsTier("0x...", "GOLD");
if (!canAccess) {
  throw new Error("Gold tier required");
}

// Get tier multipliers
const multipliers = await client.getMultipliers("0x...");
console.log(`Fee discount: ${multipliers.multipliers.feeDiscount}x`);
```

### Submit Proof Job

```typescript
const job = await client.submitRangeJob({
  address: "0x...",
  viewingKey: "vk_...",
  tier: "GOLD",
});

// Poll job status
const status = await client.getJobStatus(job.id);
console.log(`Job status: ${status.status}`);
```

## API Reference

### AggregatorClient

#### `getTier(address: string): Promise<TierData>`
Fetch tier information for an Ethereum address.

#### `meetsTier(address: string, minimumTier: string): Promise<boolean>`
Check if an address meets a minimum tier requirement.

#### `submitRangeJob(input: ProofInput): Promise<RangeJob>`
Submit a range proof job for processing.

#### `getJobStatus(jobId: string): Promise<RangeJob>`
Poll job status by ID.

#### `getMultipliers(address: string)`
Get tier-based multipliers (fee discount, LTV boost, etc.).

## Types

See [types.ts](./src/types.ts) for complete type definitions.

## Examples

- [Integration Guide](../../docs/integration-guide.md)
- [Protocol Adapters](../../packages/contracts/src/examples/)

## License

MIT

