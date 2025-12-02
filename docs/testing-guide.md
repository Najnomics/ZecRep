# Testing Guide

Comprehensive testing guide for the ZecRep project.

## Contract Testing

### Running Tests

```bash
# Run all contract tests
pnpm --filter @zecrep/contracts test

# Run specific test file
pnpm --filter @zecrep/contracts test --match-path "**/ZecRepRegistry.t.sol"

# Run with gas reporting
pnpm --filter @zecrep/contracts test --gas-report

# Run with verbose output
pnpm --filter @zecrep/contracts test -vvv
```

### Test Structure

Contract tests use Foundry's testing framework:

```solidity
contract MyTest is Test, FheEnabled {
    function setUp() public {
        initializeFhe();
        // Setup test environment
    }
    
    function testSomething() public {
        // Test logic
    }
}
```

### Mocking FHE Operations

Use the `FheEnabled` contract for FHE testing:

```solidity
import { FheEnabled } from "../util/FheHelper.sol";

contract MyTest is Test, FheEnabled {
    function setUp() public {
        initializeFhe();
    }
    
    function testWithFHE() public {
        inEuint64 memory encrypted = encrypt64(100);
        // Test with encrypted values
    }
}
```

## Service Testing

### Aggregator Service

```bash
# Run aggregator tests
pnpm --filter @zecrep/aggregator test

# Run with watch mode
pnpm --filter @zecrep/aggregator test:watch
```

### Prover CLI

```bash
# Run prover tests
pnpm --filter @zecrep/prover test

# Test specific module
pnpm --filter @zecrep/prover test src/pipeline/scan.test.ts
```

## Integration Testing

### End-to-End Flow

1. **Local Setup**
   ```bash
   # Start aggregator
   pnpm --filter @zecrep/aggregator dev
   
   # In another terminal, start prover
   pnpm --filter @zecrep/prover dev run --address 0x... --viewing-key vk_...
   ```

2. **Mock Services**
   - Use mock lightwalletd endpoint
   - Use mock FHE gateway
   - Test with deterministic data

### Contract Integration

```bash
# Deploy to local network
pnpm --filter @zecrep/contracts script script/Deploy.s.sol:DeployZecRep

# Run integration tests
pnpm --filter @zecrep/contracts test --match-contract "Integration"
```

## Test Coverage

### Generate Coverage Reports

```bash
# Contracts
pnpm --filter @zecrep/contracts test --gas-report

# Services
pnpm --filter @zecrep/aggregator test:coverage
pnpm --filter @zecrep/prover test:coverage
```

## Mock Data

### Deterministic Test Data

For consistent testing, use deterministic mock data:

- Viewing keys: Use fixed seeds for ZIP-32 derivation
- Block ranges: Use specific height ranges
- Tier thresholds: Use constants from `TIER_THRESHOLDS`

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clean State**: Reset state between tests
3. **Edge Cases**: Test boundaries and error conditions
4. **Gas Optimization**: Monitor gas usage in tests
5. **FHE Testing**: Use mocked FHE for faster tests

## Continuous Integration

Tests run automatically in CI on:
- Pull requests
- Commits to main/develop
- Nightly builds

See `.github/workflows/test.yml` for CI configuration.
