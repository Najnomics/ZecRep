// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { FHE, euint64 } from "@fhenixprotocol/contracts/FHE.sol";

/**
 * @title ZecRepTierLogic
 * @notice Library for encrypted tier comparison logic using FHE operations.
 *         This library performs tier determination on encrypted totals without decryption.
 */
library ZecRepTierLogic {
    using FHE for euint64;

    error InvalidTierThreshold();

    /**
     * @dev Determine tier from encrypted total using FHE comparisons.
     *      Compares encrypted total against tier thresholds without decrypting.
     * 
     * @param encryptedTotal The FHE-encrypted total in zatoshis
     * @param bronzeMax Maximum value for Bronze tier (in zatoshis, as euint64)
     * @param silverMax Maximum value for Silver tier (in zatoshis, as euint64)
     * @param goldMax Maximum value for Gold tier (in zatoshis, as euint64)
     * @return tier 1=Bronze, 2=Silver, 3=Gold, 4=Platinum
     */
    function determineTierEncrypted(
        euint64 encryptedTotal,
        euint64 bronzeMax,
        euint64 silverMax,
        euint64 goldMax
    ) internal view returns (euint64) {
        // Validate thresholds are in ascending order
        if (!bronzeMax.lt(silverMax).decrypt()) {
            revert InvalidTierThreshold();
        }
        if (!silverMax.lt(goldMax).decrypt()) {
            revert InvalidTierThreshold();
        }

        // Encrypted comparisons to determine tier
        // Note: This returns encrypted tier values that can be used in FHE operations
        // In practice, we may need to decrypt the tier for on-chain storage
        
        // Check if total <= bronzeMax -> tier 1
        euint64 isBronze = encryptedTotal.lte(bronzeMax).select(euint64.wrap(1), euint64.wrap(0));
        
        // Check if total <= silverMax (and > bronzeMax) -> tier 2
        euint64 isSilver = encryptedTotal.lte(silverMax).select(euint64.wrap(1), euint64.wrap(0));
        euint64 isSilverOnly = isSilver.sub(isBronze); // Only silver, not bronze
        euint64 tier2 = isSilverOnly.gt(euint64.wrap(0)).select(euint64.wrap(2), euint64.wrap(0));
        
        // Check if total <= goldMax (and > silverMax) -> tier 3
        euint64 isGold = encryptedTotal.lte(goldMax).select(euint64.wrap(1), euint64.wrap(0));
        euint64 isGoldOnly = isGold.sub(isSilver); // Only gold, not silver or bronze
        euint64 tier3 = isGoldOnly.gt(euint64.wrap(0)).select(euint64.wrap(3), euint64.wrap(0));
        
        // Otherwise -> tier 4 (Platinum)
        euint64 isPlatinum = encryptedTotal.gt(goldMax).select(euint64.wrap(4), euint64.wrap(0));
        
        // Combine tiers (only one will be non-zero)
        return tier2.add(tier3).add(isPlatinum).add(isBronze);
    }

    /**
     * @dev Check if encrypted total meets minimum tier requirement.
     * 
     * @param encryptedTotal The FHE-encrypted total
     * @param minThreshold Minimum threshold for the tier (as euint64)
     * @return meetsRequirement Encrypted boolean (1 = meets, 0 = doesn't meet)
     */
    function meetsTierThreshold(euint64 encryptedTotal, euint64 minThreshold) internal view returns (euint64) {
        return encryptedTotal.gte(minThreshold);
    }

    /**
     * @dev Get tier multiplier based on tier level (for fee discounts, etc).
     *      Returns multiplier as fixed-point number (1e18 = 1x, 8e17 = 0.8x).
     * 
     * @param tier The tier level (1-4)
     * @return multiplier Tier-based multiplier in fixed-point format
     */
    function getTierMultiplier(uint8 tier) internal pure returns (uint256) {
        if (tier == 1) return 95e16; // Bronze: 0.95x (5% discount)
        if (tier == 2) return 9e17; // Silver: 0.90x (10% discount)
        if (tier == 3) return 8e17; // Gold: 0.80x (20% discount)
        if (tier == 4) return 7e17; // Platinum: 0.70x (30% discount)
        return 1e18; // Default: no discount
    }
}

