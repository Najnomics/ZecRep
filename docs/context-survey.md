# Context Survey

High-level notes from the reference repositories and docs shipped in `CONTEXT/`. These pointers drive the roadmap work so we stay aligned with existing tooling.

## `CONTEXT/cofhe-docs`

- The Docusaurus site hosts all CoFHE developer material. The Quick Start guide (`docs/devdocs/quick-start/index.md`) walks through the Hardhat starter, Cofhe plugin, mock contracts, and cofhejs client library needed for encrypted operations.
- Tutorials such as `docs/devdocs/tutorials/adding-FHE-to-existing-contract.md` and `.../Your-First-FHE-Contract.md` show how to migrate Solidity state to encrypted `euint*` types and properly call `FHE.allowThis/allowSender`.
- Architecture docs (`docs/devdocs/architecture/*`) clarify how symbolic execution, async Cofhe jobs, and permissions fit together—important for the proof pipeline + aggregator we need to build.

## `CONTEXT/fhenix-docs`

- Mirrors the broader Fhenix Layer-2 documentation. Sections like `docs/devdocs/Setting Up Your Environment/Foundry.md` describe the Foundry template that mocks the FHE precompiles, which we already rely on inside `packages/contracts`.
- Tooling references (fhenix-hardhat-plugin, cofhejs versions) plus the component compatibility matrix (`docs/devdocs/pay-attention/component-compatibility.md`) help pin exact versions when we wire the real proof orchestration.

## `CONTEXT/lightwallet-protocol`

- Contains the proto definitions for `CompactTxStreamer` (see `walletrpc/service.proto`). These RPCs (`GetBlockRange`, `GetAddressUtxos`, etc.) are the interface our aggregator must hit when ingesting Zcash shielded data.

## `CONTEXT/lightwalletd`

- Backend described in `README.md`: runs alongside `zcashd`, exposes the `CompactTxStreamer` gRPC service, and offers scripts/Makefiles for Docker/K8s deployments. It also documents caching, TLS, and the `darksidewalletd` testing mode.
- This repo provides insight into metrics, deployment patterns, and testing harnesses that our ingestion service should integrate with (or wrap).

## `CONTEXT/protocol.z.cash`

- Source for the Zcash protocol static site. Minimal code, but reinforces where the canonical specs live and how the docs site is structured if we need to link into spec sections from our own docs.

## `CONTEXT/zcash`

- Full `zcashd` node implementation. README plus `/doc` directory cover consensus rules, build instructions, threat models, etc. Given we’re bridging shielded history, this repo is the ground truth for how Sapling/Orchard transactions behave.

## `CONTEXT/zcash_spec`

- Rust crate containing low-level types shared across specs (Sapling/Orchard). Useful when we need deterministic key derivation or note handling inside the proof generator.

## `CONTEXT/zcash-docs`

- Translated end-user documentation (mining guides, Sprout user guide). Less critical for backend logic, but handy if we produce multilingual material or need to reference legacy wallet behavior.

## `CONTEXT/zcash-explorer`

- Phoenix (Elixir) app for a Zcash block explorer. Provides examples of how to visualize chain data and can inspire the analytics/dashboard portion of our roadmap.

## `CONTEXT/zip32`

- Rust implementation of ZIP-32 (shielded HD wallets). Relevant for local proof generation because we may need to derive viewing keys to scan user data without exposing spending keys.

## `CONTEXT/zips`

- Canonical ZIP repository: contains ZIP-0 (process), ZIP-317 (fee mechanism), ZIP-224/225 (Orchard + v5 transactions), etc. We’ll reference these when defining the circuit constraints (e.g., range proofs) and when aligning with future NU upgrades.

---

With these references cataloged, we can now organize the roadmap so each workstream cites the appropriate upstream spec or toolkit.

