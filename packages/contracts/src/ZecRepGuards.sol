// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { ZecRepRegistry } from "./ZecRepRegistry.sol";

/**
 * @title ZecRepGuards
 * @notice Helper library for DeFi protocols to easily integrate ZecRep tier checks.
 *         Provides convenience functions for common access control patterns.
 * 
 * Usage examples:
 * - Lending protocols: require minimum tier for better rates
 * - DEXs: apply fee discounts based on tier
 * - DAOs: weight voting power by tier
 * - Yield protocols: grant bonus multipliers
 * 
 * Based on integration patterns from README.md use cases.
 */
library ZecRepGuards {
    error TierTooLow(uint8 required, uint8 actual);
    error NotRegistered(address account);

    /**
     * @dev Reverts if account doesn't meet minimum tier requirement.
     *      Useful for function guards that require reputation.
     */
    function requireTier(ZecRepRegistry registry, address account, uint8 minimumTier) internal view {
        uint8 actualTier = registry.tierOf(account);
        if (actualTier == 0) {
            revert NotRegistered(account);
        }
        if (!registry.meetsTier(account, minimumTier)) {
            revert TierTooLow(minimumTier, actualTier);
        }
    }

    /**
     * @dev Returns tier-based fee discount multiplier.
     *      Bronze: 0.95x (5% off), Silver: 0.90x (10% off), 
     *      Gold: 0.80x (20% off), Platinum: 0.70x (30% off)
     */
    function getFeeDiscountMultiplier(ZecRepRegistry registry, address account) internal view returns (uint256) {
        uint8 tier = registry.tierOf(account);
        if (tier == 0) return 1e18; // No discount for unregistered users
        
        if (tier == uint8(ZecRepRegistry.TierLevel.BRONZE)) return 0.95e18;
        if (tier == uint8(ZecRepRegistry.TierLevel.SILVER)) return 0.90e18;
        if (tier == uint8(ZecRepRegistry.TierLevel.GOLD)) return 0.80e18;
        if (tier == uint8(ZecRepRegistry.TierLevel.PLATINUM)) return 0.70e18;
        
        return 1e18;
    }

    /**
     * @dev Returns tier-based loan-to-value (LTV) boost.
     *      Bronze: +0%, Silver: +5%, Gold: +10%, Platinum: +20%
     */
    function getLTVBoostBps(ZecRepRegistry registry, address account) internal view returns (uint256) {
        uint8 tier = registry.tierOf(account);
        if (tier == 0) return 0;
        
        if (tier == uint8(ZecRepRegistry.TierLevel.BRONZE)) return 0;
        if (tier == uint8(ZecRepRegistry.TierLevel.SILVER)) return 500; // 5%
        if (tier == uint8(ZecRepRegistry.TierLevel.GOLD)) return 1000; // 10%
        if (tier == uint8(ZecRepRegistry.TierLevel.PLATINUM)) return 2000; // 20%
        
        return 0;
    }

    /**
     * @dev Returns tier-based governance vote multiplier.
     *      Bronze: 1.25x, Silver: 1.5x, Gold: 2x, Platinum: 3x
     */
    function getVoteMultiplier(ZecRepRegistry registry, address account) internal view returns (uint256) {
        uint8 tier = registry.tierOf(account);
        if (tier == 0) return 1e18; // No multiplier for unregistered users
        
        if (tier == uint8(ZecRepRegistry.TierLevel.BRONZE)) return 1.25e18;
        if (tier == uint8(ZecRepRegistry.TierLevel.SILVER)) return 1.5e18;
        if (tier == uint8(ZecRepRegistry.TierLevel.GOLD)) return 2e18;
        if (tier == uint8(ZecRepRegistry.TierLevel.PLATINUM)) return 3e18;
        
        return 1e18;
    }

    /**
     * @dev Returns tier-based yield multiplier.
     *      Bronze: 1.125x, Silver: 1.25x, Gold: 1.5x, Platinum: 2x
     */
    function getYieldMultiplier(ZecRepRegistry registry, address account) internal view returns (uint256) {
        uint8 tier = registry.tierOf(account);
        if (tier == 0) return 1e18; // No multiplier for unregistered users
        
        if (tier == uint8(ZecRepRegistry.TierLevel.BRONZE)) return 1.125e18;
        if (tier == uint8(ZecRepRegistry.TierLevel.SILVER)) return 1.25e18;
        if (tier == uint8(ZecRepRegistry.TierLevel.GOLD)) return 1.5e18;
        if (tier == uint8(ZecRepRegistry.TierLevel.PLATINUM)) return 2e18;
        
        return 1e18;
    }
}

