# ZecRep Delivery Roadmap

Concrete steps to close the gaps called out in the README, with references back to the context docs that define expected behavior.

## 1. Proof Pipeline

- **Circuit specs**: implement range proofs that certify total activity in 4 bins (Bronze/Silver/Gold/Platinum). Use ZIP references (e.g., `CONTEXT/zips/zips/zip-0225.rst` for v5 tx structure) to ensure we parse Sapling/Orchard notes correctly.
- **Local prover**: build a CLI/worker that scans Zcash history via lightwalletd (`CONTEXT/lightwalletd` + `lightwallet-protocol/walletrpc/service.proto`) using ZIP-32 key derivation (`CONTEXT/zip32`) to find relevant notes, then feeds the circuit.
- **FHE wrapping**: invoke cofhejs + Cofhe gateway (`CONTEXT/cofhe-docs/docs/devdocs/quick-start/index.md`) to encrypt the proven range before submitting to Ethereum.
- **Job orchestration**: integrate with Fhenix/Cofhe async model (tutorials in `CONTEXT/cofhe-docs/docs/devdocs/tutorials/*`) so the frontend and aggregator can monitor proof status.

## 2. FHE Smart Contracts

- **Tier comparison logic**: move from plaintext tier updates to encrypted comparisons (using the `FHE.gte`/`select` APIs documented in `CONTEXT/cofhe-docs/docs/devdocs/fhe-library/*`). Contracts will accept ciphertext totals and compute the tier on-chain.
- **Metadata & art**: implement dynamic metadata URIs (possibly hosting assets similar to `apps/web/public/og-card.svg`) and store per-tier image descriptors.
- **Permit support**: wire the registry + badge to accept EIP-712 permits for `sealoutput`, following the `Permissioned.sol` patterns and the Cofhe tutorials on sealing.

## 3. ZecRep Console (Frontend)

- Wallet connectivity (Zcash + Ethereum) via cofhejs hooks and standard Web3 connectors.
- Guided UX for scanning, proof generation, encryption, and NFT minting (copying flows from `CONTEXT/cofhe-docs/docs/devdocs/tutorials/adding-FHE-to-existing-contract.md`).
- Surfacing tier perks, upgrade history, and `sealoutput` tooling for partners.
- Embed guard helper checks (`meetsTier`, `enforceTier`) so protocols can simulate gating logic straight from the UI.

## 4. Aggregator Service

- Replace mock endpoints with real ingestion: subscribe to `lightwalletd` for compact blocks, cache note commitments, and expose derived stats.
- Add a proof job queue that coordinates with the Cofhe gateway (per `cofhe-docs` architecture) and persists job status.
- Build webhook + REST endpoints for partners (lending, DEX, DAO) so they can query / subscribe to tier updates.

## 5. Protocol Integrations

- **Lending adapter**: solidity or off-chain module that adjusts LTV + rates using badge tiers.
- **DEX rebates**: feed tier info into fee calculation logic.
- **Yield multipliers & DAO governance**: sample contracts demonstrating multiplier logic built on top of `meetsTier`.
- Documentation + code samples mirroring the use cases listed in the README.

## 6. Deployment & Monitoring

- Define Docker images, docker-compose, and K8s manifests similar to `CONTEXT/lightwalletd/docker` and `.../kubernetes`.
- Observability stack (Prometheus/Grafana) with dashboards for proof pipeline throughput, aggregator health, contract events, etc.
- CI/CD pipelines (GitHub Actions) covering tests, lint, proof artifact builds, and deploy promotions.

## 7. Docs & SDKs

- Stand up a docs site (Docusaurus, matching `CONTEXT/cofhe-docs` conventions) that hosts integration guides, API references, and tutorials.
- Publish a TypeScript SDK (wrapping cofhejs workflows, aggregator endpoints, and guard helpers) plus a Foundry template repo for Solidity integrators.

## 8. Metrics & Analytics

- Implement analytics ingestion (subgraph or custom indexer) to track minted NFTs, range distributions, partner usage, and the KPIs cited in the README (e.g., 100 NFTs, $1M activity).
- Build dashboard views (drawing inspiration from `CONTEXT/zcash-explorer`) and wire them into the console + docs.

---

Each epic above will turn into smaller issues/PRs. As we implement them we should cite the upstream context files to show compliance with the relevant specs.

