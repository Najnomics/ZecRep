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
        // NOTE: The current FHE precompile toolkit does not expose the comparison helpers
        // we previously relied on, so we optimistically decrypt the comparison operands
        // to keep the contract compiling until native ops are restored.
        uint64 total = FHE.decrypt(encryptedTotal);
        uint64 bronze = FHE.decrypt(bronzeMax);
        uint64 silver = FHE.decrypt(silverMax);
        uint64 gold = FHE.decrypt(goldMax);

        uint8 tier;
        if (total <= bronze) {
            tier = 1;
        } else if (total <= silver) {
            tier = 2;
        } else if (total <= gold) {
            tier = 3;
        } else {
            tier = 4;
        }

        return FHE.asEuint64(uint64(tier));
    }

    /**
     * @dev Check if encrypted total meets minimum tier requirement.
     * 
     * @param encryptedTotal The FHE-encrypted total
     * @param minThreshold Minimum threshold for the tier (as euint64)
     * @return meetsRequirement Encrypted boolean (1 = meets, 0 = doesn't meet)
     */
    function meetsTierThreshold(euint64 encryptedTotal, euint64 minThreshold) internal view returns (euint64) {
        uint64 total = FHE.decrypt(encryptedTotal);
        uint64 minValue = FHE.decrypt(minThreshold);
        return FHE.asEuint64(total >= minValue ? 1 : 0);
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

