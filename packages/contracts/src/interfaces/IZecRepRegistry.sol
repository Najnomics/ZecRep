// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { inEuint64 } from "@fhenixprotocol/contracts/FHE.sol";

/**
 * @title IZecRepRegistry
 * @notice Interface for ZecRep registry contracts.
 *         Allows protocols to interact with different registry implementations.
 */
interface IZecRepRegistry {
    enum TierLevel {
        NONE,
        BRONZE,
        SILVER,
        GOLD,
        PLATINUM
    }

    struct TierConfig {
        string name;
        uint64 minZats;
        uint64 maxZats;
        uint16 score;
    }

    /**
     * @dev Submit a reputation proof with encrypted total.
     */
    function submitProof(inEuint64 calldata encryptedTotal, bytes32 proofHash, uint8 tier) external;

    /**
     * @dev Get tier information for an address.
     */
    function userTier(address account) external view returns (uint8 tier, uint16 score, uint64 submittedAt);

    /**
     * @dev Check if account meets minimum tier requirement.
     */
    function meetsTier(address account, uint8 minimumTier) external view returns (bool);

    /**
     * @dev Enforce tier requirement (reverts if not met).
     */
    function enforceTier(address account, uint8 minimumTier) external view;

    /**
     * @dev Get tier configuration.
     */
    function getTier(uint8 tier) external view returns (TierConfig memory);

    /**
     * @dev Seal encrypted total for external protocol use.
     */
    function sealMyTotal(bytes calldata permission) external view returns (string memory);
}

