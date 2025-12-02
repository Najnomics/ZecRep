# ZecRep Protocol Adapter Examples

Example Solidity contracts demonstrating how to integrate ZecRep reputation tiers into DeFi protocols.

## Overview

These adapters show real-world integration patterns from the ZecRep README use cases:

- **LendingAdapter**: Tier-based interest rates and LTV boosts
- **DexAdapter**: Tier-based trading fee discounts
- **DaoAdapter**: Tier-based governance vote multipliers
- **YieldAdapter**: Tier-based yield reward multipliers

## Usage

Each adapter imports and uses the `ZecRepGuards` library which provides helper functions for:

- `requireTier()` - Revert if user doesn't meet minimum tier
- `getFeeDiscountMultiplier()` - Get fee discount (0.95x to 0.70x)
- `getLTVBoostBps()` - Get loan-to-value boost (0 to 20%)
- `getVoteMultiplier()` - Get governance vote weight (1x to 3x)
- `getYieldMultiplier()` - Get yield multiplier (1x to 2x)

## Integration Pattern

```solidity
import { ZecRepRegistry } from "../ZecRepRegistry.sol";
import { ZecRepGuards } from "../ZecRepGuards.sol";

contract MyProtocol {
    using ZecRepGuards for ZecRepRegistry;
    
    ZecRepRegistry public immutable zecRep;
    
    constructor(address _zecRep) {
        zecRep = ZecRepRegistry(_zecRep);
    }
    
    function myFunction(address user) external {
        // Require minimum tier
        zecRep.requireTier(user, uint8(ZecRepRegistry.TierLevel.GOLD));
        
        // Get tier-based multiplier
        uint256 discount = zecRep.getFeeDiscountMultiplier(user);
        
        // Use multiplier in your logic
        uint256 fee = baseFee * discount / 1e18;
    }
}
```

## Tier Benefits

| Tier | Fee Discount | LTV Boost | Vote Multiplier | Yield Multiplier |
|------|--------------|-----------|-----------------|------------------|
| Bronze | 5% | 0% | 1.25x | 1.125x |
| Silver | 10% | 5% | 1.5x | 1.25x |
| Gold | 20% | 10% | 2x | 1.5x |
| Platinum | 30% | 20% | 3x | 2x |

## Examples

### Lending Protocol

```solidity
// Calculate interest rate with tier discount
uint256 rate = calculateInterestRate(borrower); // 10% → 8% for Gold tier

// Apply LTV boost
uint256 maxLoan = collateral * (baseLTV + ltvBoost) / 10000; // +10% for Gold
```

### DEX Trading

```solidity
// Apply fee discount
uint256 fee = tradeAmount * baseFee * discountMultiplier / 1e18; // 0.30% → 0.24% for Gold
```

### DAO Governance

```solidity
// Weight votes by tier
uint256 voteWeight = baseVotes * voteMultiplier / 1e18; // 100 → 200 for Gold
```

### Yield Farming

```solidity
// Boost yield rewards
uint256 apy = baseAPY * yieldMultiplier / 1e18; // 10% → 15% for Gold
```

## Testing

See the main contract test suite for examples of how these adapters would be tested with mock FHE operations.

## Production Considerations

1. **Registry Address**: Pass the deployed `ZecRepRegistry` address to constructor
2. **Access Control**: Add your own access control patterns as needed
3. **Upgradeability**: Consider proxy patterns if you need upgradability
4. **Gas Optimization**: Cache tier lookups when possible in loops

## References

- [ZecRep README](../../../../README.md) - Full project documentation
- [ZecRepGuards](../ZecRepGuards.sol) - Helper library implementation
- [ZecRepRegistry](../ZecRepRegistry.sol) - Core registry contract

