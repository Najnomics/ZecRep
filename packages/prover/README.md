# ZecRep Prover CLI

Scaffolding for the local proof pipeline described in the roadmap. The CLI will eventually:

1. scan the user’s shielded history via lightwalletd (`CONTEXT/lightwalletd` + `lightwallet-protocol/walletrpc/service.proto`);
2. build a range proof that total activity falls inside one of the ZecRep tiers;
3. wrap the result using cofhejs / Fhenix (`CONTEXT/cofhe-docs` tutorials) before hitting the registry contract.

Current status: baseline config + command surface so we can iterate incrementally.

## Commands

```bash
# run from repo root
pnpm install
pnpm --filter @zecrep/prover dev -- --help
```

## Planned pipeline

| Stage | Description | Notes |
| --- | --- | --- |
| `scan` | fetch Sapling/Orchard notes using viewing keys | relies on ZIP-32 derivation + lightwalletd |
| `range-proof` | feed totals into the ZK circuit | circuit implementation TBD (Noir/Halo2/etc) |
| `encrypt` | encrypt via Cofhe gateway | uses cofhejs + aggregator job queue |
| `submit` | send encrypted payload + proof hash to `ZecRepRegistry` | final on-chain step |

See `docs/roadmap.md` for the detailed backlog.

