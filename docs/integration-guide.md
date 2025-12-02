# ZecRep Integration Guide

Guide for DeFi protocols integrating ZecRep reputation tiers.

## Quick Start

1. Import the `ZecRepGuards` library
2. Check tier requirements in your contracts
3. Apply tier-based benefits (fee discounts, LTV boosts, etc.)

## Contract Integration

### Basic Tier Check

```solidity
import { ZecRepRegistry } from "@zecrep/contracts/ZecRepRegistry.sol";
import { ZecRepGuards } from "@zecrep/contracts/ZecRepGuards.sol";

contract MyProtocol {
    using ZecRepGuards for ZecRepRegistry;
    
    ZecRepRegistry public immutable zecRep;
    
    constructor(address _zecRep) {
        zecRep = ZecRepRegistry(_zecRep);
    }
    
    function myFunction(address user) external {
        // Require minimum Gold tier
        zecRep.requireTier(user, uint8(ZecRepRegistry.TierLevel.GOLD));
        
        // Continue with your logic...
    }
}
```

### Apply Fee Discounts

```solidity
function calculateFee(address user, uint256 amount) external view returns (uint256) {
    uint256 baseFee = (amount * 30) / 10000; // 0.30%
    uint256 discount = zecRep.getFeeDiscountMultiplier(user);
    return (baseFee * discount) / 1e18;
}
```

### Boost Loan-to-Value

```solidity
function getMaxLoan(address user, uint256 collateral) external view returns (uint256) {
    uint256 baseLTV = 7000; // 70%
    uint256 boostBps = zecRep.getLTVBoostBps(user);
    uint256 maxLTV = baseLTV + boostBps;
    return (collateral * maxLTV) / 10000;
}
```

## SDK Integration (TypeScript)

### Check Tier

```typescript
import { AggregatorClient } from "@zecrep/sdk";

const client = new AggregatorClient("https://aggregator.zecrep.xyz");

// Get user tier
const tierData = await client.getTier(userAddress);
console.log(`${userAddress} has ${tierData.tier} tier`);

// Check if meets requirement
const canAccess = await client.meetsTier(userAddress, "GOLD");
if (!canAccess) {
  throw new Error("Gold tier required");
}
```

### Get Multipliers

```typescript
const multipliers = await client.getMultipliers(userAddress);
console.log(`Fee discount: ${multipliers.multipliers.feeDiscount}x`);
console.log(`LTV boost: ${multipliers.multipliers.ltvBoostBps} bps`);
```

## Example Integrations

See `packages/contracts/src/examples/` for complete working examples:

- **LendingAdapter**: Tier-based interest rates and LTV boosts
- **DexAdapter**: Tier-based trading fee discounts
- **DaoAdapter**: Tier-based governance vote multipliers
- **YieldAdapter**: Tier-based yield reward multipliers

## Tier Benefits Reference

| Tier | Fee Discount | LTV Boost | Vote Weight | Yield Multiplier |
|------|--------------|-----------|-------------|------------------|
| Bronze | 5% | 0% | 1.25x | 1.125x |
| Silver | 10% | 5% | 1.5x | 1.25x |
| Gold | 20% | 10% | 2x | 1.5x |
| Platinum | 30% | 20% | 3x | 2x |

## Security Considerations

1. **Always check tiers on-chain**: Don't rely solely on off-chain queries
2. **Use `requireTier` for access control**: Reverts cleanly if tier not met
3. **Cache tier lookups**: Reduce gas costs when checking multiple users
4. **Verify badge ownership**: Check `ZecRepBadge.hasBadge(address)` if needed

## Testing

Use the Foundry test helpers:

```solidity
import { FheEnabled } from "@zecrep/contracts/util/FheHelper.sol";

contract MyProtocolTest is Test, FheEnabled {
    function setUp() public {
        initializeFhe();
        // Setup your protocol with ZecRepRegistry
    }
    
    function testTierRequirement() public {
        // Test tier-based logic
    }
}
```

## Resources

- [Protocol Adapter Examples](../packages/contracts/src/examples/README.md)
- [ZecRepGuards Library](../packages/contracts/src/ZecRepGuards.sol)
- [Aggregator API Docs](../services/aggregator/README.md)

