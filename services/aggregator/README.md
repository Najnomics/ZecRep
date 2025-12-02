# ZecRep Aggregator Service

Service responsible for:

- ingesting compact blocks / lightwalletd signals to compute shielded volume statistics,
- orchestrating range-proof jobs and encrypted submissions,
- exposing HTTP endpoints for the frontend / partner protocols.

## Commands

```bash
# install deps from monorepo root
pnpm install

# run locally with auto reload
pnpm --filter @zecrep/aggregator dev

# typecheck & lint
pnpm --filter @zecrep/aggregator typecheck
pnpm --filter @zecrep/aggregator lint

# build production bundle
pnpm --filter @zecrep/aggregator build
pnpm --filter @zecrep/aggregator start
```

## Env

See `src/config/schema.ts` for required variables. Copy `.env.example` to `.env` and adjust before running againt real nodes.

## HTTP Surface

| Route | Method | Description |
| --- | --- | --- |
| `/health` | `GET` | Liveness + current config snapshot (port/log level) |
| `/` | `GET` | Basic service banner/version |
| `/api/reputation/tier?address=0x...` | `GET` | Returns the cached tier snapshot for an Ethereum address |
| `/api/jobs/range` | `POST` | Creates a mock range-proof job (returns job id + status) |
| `/api/jobs/range/:id` | `GET` | Poll job status (pending/completed) |

### Tier response (mocked for now)

```json
{
  "data": {
    "address": "0xabc…123",
    "tier": "GOLD",
    "score": 500,
    "encryptedTotal": "0xmockcafe",
    "volumeZats": 41000000,
    "updatedAt": "2025-12-01T15:04:05.000Z"
  }
}
```

- `tier` / `score` align with the on-chain badge.
- `encryptedTotal` will eventually mirror the ciphertext stored in `ZecRepRegistry`.
- `volumeZats` is expressed in zatoshis; convert by dividing by `1e8`.

### Upcoming extensions

- `POST /api/reputation/submit`: proxy to Cofhe jobs to start a new encrypted proof.
- `GET /api/reputation/guards/:tier`: convenience endpoint that mirrors the on-chain `enforceTier` checks.
- Webhook publishing so partner protocols receive tier upgrades in real time.

