# Proof Pipeline Decisions

Guiding choices for the ZecRep prover implementation so we can deliver an end‑to‑end encrypted proof workflow.

## Circuit stack

- **Noir**: we will implement the tier range circuit in Noir (Aztec’s Rust-based DSL) because it strikes a balance between ergonomics and performance, and compiles down to highly optimized Barretenberg proofs that can be verified in Solidity. A placeholder circuit now lives in `packages/prover/noir`, compiled via `pnpm --filter @zecrep/prover noir:build`.
- Range buckets (Bronze/Silver/Gold/Platinum) will be enforced via simple `assert_leq` constraints over the sum of shielded notes. Future tiers can be added by extending the constants in the circuit.
- Outputs: public signals include the address commitment + tier bucket; proof will be verified off-chain prior to FHE encryption, and later on-chain via a verifier contract once integrated.

## Data ingestion

- **lightwalletd gRPC** (`CONTEXT/lightwallet-protocol/walletrpc/service.proto`) will supply Sapling/Orchard note data. The prover CLI will:
  - derive unified viewing keys via ZIP-32 (see `CONTEXT/zip32`);
  - call `GetBlockRange` + `GetAddressUtxos` to aggregate the user’s totals without exposing spend keys;
  - cache results locally to avoid rescanning on every proof request.

## Encryption layer

- After generating the Noir proof and determining the tier, the prover will encrypt the result using `cofhejs` (`CONTEXT/cofhe-docs/docs/devdocs/quick-start/index.md`) so only the ZecRep registry contract can operate on the ciphertext.
- The aggregator service will orchestrate Cofhe/Fhenix jobs and relay status updates back to the CLI + frontend.

## Submission flow

1. CLI scans activity → produces witness.
2. Noir circuit outputs tier and proof.
3. Cofhe encryption produces the encrypted payload.
4. Aggregator job API stores job metadata and forwards the payload to the smart contracts.

This document will evolve as we wire each component. Refer back to `docs/roadmap.md` for epic-level tasks.

