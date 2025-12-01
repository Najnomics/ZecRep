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

