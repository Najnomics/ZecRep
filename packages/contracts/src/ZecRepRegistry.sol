// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Permissioned, Permission } from "@fhenixprotocol/contracts/access/Permissioned.sol";
import { FHE, euint64, inEuint64 } from "@fhenixprotocol/contracts/FHE.sol";

import { ZecRepBadge } from "./ZecRepBadge.sol";

/**
 * @title ZecRepRegistry
 * @notice Receives encrypted reputation proofs and mints the corresponding soulbound badge.
 *         The contract does not decrypt any value onchain; instead, it stores the ciphertext
 *         and offers sealOutput helpers so that users can share their totals with protocols.
 */
contract ZecRepRegistry is AccessControl, Permissioned {
    using FHE for euint64;

    bytes32 public constant TIER_ADMIN_ROLE = keccak256("TIER_ADMIN_ROLE");
    error TierRequirementNotMet(uint8 required, uint8 actual);

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

    struct TierConfigInput {
        string name;
        uint64 minZats;
        uint64 maxZats;
        uint16 score;
    }

    struct ProofRecord {
        euint64 encryptedTotal;
        uint64 submittedAt;
        bytes32 proofHash;
        uint8 tier;
        uint16 score;
    }

    uint64 public constant ZATOSHI = 1e8;

    ZecRepBadge public immutable badge;

    uint256 public totalParticipants;
    uint256 public totalProofs;
    uint8 public highestTier;

    mapping(uint8 tier => TierConfig) private _tiers;
    mapping(address account => ProofRecord) private _records;

    event TierConfigured(uint8 indexed tier, string name, uint64 minZats, uint64 maxZats, uint16 score);
    event ProofSubmitted(
        address indexed account, uint8 indexed tier, uint16 score, bytes32 proofHash, uint64 submittedAt
    );

    constructor(address admin, TierConfigInput[] memory initialTiers) {
        require(admin != address(0), "ZecRepRegistry: admin required");
        require(initialTiers.length <= type(uint8).max, "ZecRepRegistry: too many tiers");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(TIER_ADMIN_ROLE, admin);

        badge = new ZecRepBadge(admin, address(this));
        uint8 tiersLength = uint8(initialTiers.length);
        for (uint8 i = 0; i < tiersLength; ++i) {
            _setTierInternal(i + 1, initialTiers[i]);
        }
    }

    /**
     * @dev Submit the encrypted total activity together with a proof hash and target tier.
     *      The caller is responsible for generating a valid proof off-chain.
     */
    function submitProof(inEuint64 calldata encryptedTotal, bytes32 proofHash, uint8 tier) external {
        require(tier != uint8(TierLevel.NONE), "ZecRepRegistry: invalid tier");
        TierConfig memory config = _tiers[tier];
        require(config.score != 0, "ZecRepRegistry: unknown tier");

        euint64 ciphertext = FHE.asEuint64(encryptedTotal);
        ProofRecord storage record = _records[msg.sender];

        if (!record.encryptedTotal.isInitialized()) {
            totalParticipants += 1;
        }

        record.encryptedTotal = ciphertext;
        record.submittedAt = uint64(block.timestamp);
        record.proofHash = proofHash;
        record.tier = tier;
        record.score = config.score;

        totalProofs += 1;
        badge.mintOrUpdate(msg.sender, tier, config.score);

        emit ProofSubmitted(msg.sender, tier, config.score, proofHash, record.submittedAt);
    }

    /**
     * @dev Seals the encrypted total for the caller. The accompanying permission must be signed by the caller.
     */
    function sealMyTotal(Permission calldata permission) external view onlySender(permission) returns (string memory) {
        return _sealForAccount(msg.sender, permission);
    }

    /**
     * @dev Allows an external protocol to request a sealed total if the user provided permission.
     */
    function sealTotalWithPermission(
        address account,
        Permission calldata permission
    )
        external
        view
        onlyPermitted(permission, account)
        returns (string memory)
    {
        return _sealForAccount(account, permission);
    }

    function getTier(uint8 tier) external view returns (TierConfig memory) {
        return _tiers[tier];
    }

    function getUserProof(address account) external view returns (ProofRecord memory) {
        return _records[account];
    }

    function userTier(address account) external view returns (uint8 tier, uint16 score, uint64 submittedAt) {
        ProofRecord memory record = _records[account];
        return (record.tier, record.score, record.submittedAt);
    }

    function tierOf(address account) public view returns (uint8) {
        return _records[account].tier;
    }

    function meetsTier(address account, uint8 minimumTier) public view returns (bool) {
        require(minimumTier != 0 && minimumTier <= highestTier, "ZecRepRegistry: invalid minimum tier");
        uint8 tier = _records[account].tier;
        return tier != 0 && tier >= minimumTier;
    }

    function isGoldOrAbove(address account) external view returns (bool) {
        return meetsTier(account, uint8(TierLevel.GOLD));
    }

    function enforceTier(address account, uint8 minimumTier) external view {
        if (!meetsTier(account, minimumTier)) {
            revert TierRequirementNotMet(minimumTier, _records[account].tier);
        }
    }

    function configureTier(uint8 tier, TierConfigInput calldata newConfig) external onlyRole(TIER_ADMIN_ROLE) {
        _setTierInternal(tier, newConfig);
    }

    function _sealForAccount(address account, Permission calldata permission) private view returns (string memory) {
        ProofRecord memory record = _records[account];
        require(record.encryptedTotal.isInitialized(), "ZecRepRegistry: proof missing");
        return FHE.sealoutput(record.encryptedTotal, permission.publicKey);
    }

    function _setTierInternal(uint8 tier, TierConfigInput memory newConfig) private {
        require(tier != 0, "ZecRepRegistry: tier zero");
        require(bytes(newConfig.name).length != 0, "ZecRepRegistry: tier name required");
        require(newConfig.score > 0, "ZecRepRegistry: score required");
        require(newConfig.minZats < newConfig.maxZats, "ZecRepRegistry: invalid range");

        TierConfig storage config = _tiers[tier];
        config.name = newConfig.name;
        config.minZats = newConfig.minZats;
        config.maxZats = newConfig.maxZats;
        config.score = newConfig.score;
        if (tier > highestTier) {
            highestTier = tier;
        }

        emit TierConfigured(tier, newConfig.name, newConfig.minZats, newConfig.maxZats, newConfig.score);
    }
}

