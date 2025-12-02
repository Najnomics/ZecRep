# Testing Guide

Comprehensive guide for testing ZecRep components.

## Contract Testing

### Running Tests

```bash
cd packages/contracts
forge test -vvv
```

### Test Coverage

```bash
forge coverage --report lcov
```

### Key Test Files

- `test/ZecRepRegistry.t.sol` - Registry and badge tests
- `test/ZecRepGuards.t.sol` - Guard library tests
- `test/ProtocolAdapters.t.sol` - Protocol integration tests

### FHE Testing

Contracts using FHE require the `FheEnabled` helper:

```solidity
contract MyTest is Test, FheEnabled {
    function setUp() public {
        initializeFhe();
    }
}
```

## Service Testing

### Aggregator Service

```bash
cd services/aggregator
pnpm test
```

### Integration Tests

```bash
# Run all service tests
pnpm --filter @zecrep/aggregator test
```

## Prover CLI Testing

```bash
cd packages/prover
pnpm test
```

### Mock Mode

The prover supports mock mode for development:

```bash
ENABLE_GRPC=false pnpm dev mock-range --address 0x... --viewing-key vk_...
```

## End-to-End Testing

### Full Pipeline Test

1. Start aggregator service
2. Run prover CLI
3. Submit proof via aggregator API
4. Verify badge minted on-chain

### Local Development

```bash
# Terminal 1: Start aggregator
pnpm --filter @zecrep/aggregator dev

# Terminal 2: Run prover
pnpm --filter @zecrep/prover dev mock-range --address 0x...

# Terminal 3: Check aggregator logs
```

## Testing with Real Networks

### Fhenix Testnet

```bash
# Deploy contracts
REGISTRY_ADDRESS=0x... pnpm --filter @zecrep/contracts script script/Deploy.s.sol:DeployZecRep

# Run prover with testnet config
FHE_GATEWAY_URL=https://api.helium.fhenix.zone \
  REGISTRY_ADDRESS=0x... \
  pnpm --filter @zecrep/prover dev mock-range
```

## Mock Services

All services support mock modes for testing:

- **lightwalletd**: Set `LIGHTWALLETD_URL` to mock endpoint
- **FHE Gateway**: Set `USE_COFHE=false` for mock encryption
- **Noir**: Proofs can be mocked without circuit execution

## CI/CD Testing

Tests run automatically on:

- Pull requests
- Commits to main/develop branches

See `.github/workflows/test.yml` for configuration.

