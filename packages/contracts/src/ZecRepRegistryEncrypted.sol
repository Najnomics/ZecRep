// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Permissioned, Permission } from "@fhenixprotocol/contracts/access/Permissioned.sol";
import { FHE, euint64, inEuint64 } from "@fhenixprotocol/contracts/FHE.sol";
import { ZecRepTierLogic } from "./ZecRepTierLogic.sol";
import { ZecRepBadge } from "./ZecRepBadge.sol";

/**
 * @title ZecRepRegistryEncrypted
 * @notice Enhanced registry that determines tier on-chain using encrypted comparisons.
 *         This is an experimental upgrade path that performs tier determination
 *         without storing plaintext tier values.
 * 
 * NOTE: This contract demonstrates encrypted tier logic. The current production
 * registry (ZecRepRegistry) stores plaintext tiers for efficiency. This version
 * shows how fully encrypted tier determination could work.
 */
contract ZecRepRegistryEncrypted is AccessControl, Permissioned {
    using FHE for euint64;
    using ZecRepTierLogic for euint64;

    bytes32 public constant TIER_ADMIN_ROLE = keccak256("TIER_ADMIN_ROLE");
    bytes32 public constant PROOF_VERIFIER_ROLE = keccak256("PROOF_VERIFIER_ROLE");

    struct TierConfig {
        string name;
        euint64 minZats; // Encrypted thresholds
        euint64 maxZats;
        uint16 score;
    }

    struct EncryptedProofRecord {
        euint64 encryptedTotal;
        euint64 encryptedTier; // Encrypted tier (1-4)
        uint64 submittedAt;
        bytes32 proofHash;
        uint16 score; // Score is public (derived from tier)
    }

    uint64 public constant ZATOSHI = 1e8;

    ZecRepBadge public immutable badge;

    mapping(uint8 tier => TierConfig) private _tiers;
    mapping(address account => EncryptedProofRecord) private _records;

    // Encrypted tier thresholds (initialized in constructor)
    euint64 private bronzeMax;
    euint64 private silverMax;
    euint64 private goldMax;

    event TierConfigured(uint8 indexed tier, string name, uint16 score);
    event ProofSubmitted(address indexed account, bytes32 proofHash, uint64 submittedAt);

    constructor(
        address admin,
        uint64 _bronzeMax,
        uint64 _silverMax,
        uint64 _goldMax
    ) {
        require(admin != address(0), "ZecRepRegistryEncrypted: admin required");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(TIER_ADMIN_ROLE, admin);

        badge = new ZecRepBadge(admin, address(this));

        // Initialize encrypted tier thresholds
        // These are public constants that can be compared against
        bronzeMax = FHE.asEuint64(_bronzeMax);
        silverMax = FHE.asEuint64(_silverMax);
        goldMax = FHE.asEuint64(_goldMax);
    }

    /**
     * @dev Submit encrypted total and determine tier on-chain using FHE comparisons.
     *      This is more expensive than storing plaintext tiers but provides stronger privacy.
     */
    function submitProofEncrypted(
        inEuint64 calldata encryptedTotal,
        bytes32 proofHash
    ) external {
        euint64 ciphertext = FHE.asEuint64(encryptedTotal);
        EncryptedProofRecord storage record = _records[msg.sender];

        // Determine tier using encrypted comparisons
        euint64 encryptedTier = ZecRepTierLogic.determineTierEncrypted(
            ciphertext,
            bronzeMax,
            silverMax,
            goldMax
        );

        record.encryptedTotal = ciphertext;
        record.encryptedTier = encryptedTier;
        record.submittedAt = uint64(block.timestamp);
        record.proofHash = proofHash;

        // Decrypt tier to get score and mint badge
        // Note: In a fully encrypted system, we'd need to decrypt only for badge minting
        uint8 tier = uint8(FHE.decrypt(encryptedTier));
        require(tier >= 1 && tier <= 4, "ZecRepRegistryEncrypted: invalid tier");

        // Get score from tier config
        TierConfig memory config = _tiers[tier];
        require(config.score > 0, "ZecRepRegistryEncrypted: tier not configured");
        record.score = config.score;

        badge.mintOrUpdate(msg.sender, tier, config.score);

        emit ProofSubmitted(msg.sender, proofHash, record.submittedAt);
    }

    /**
     * @dev Configure tier metadata (name and score).
     */
    function configureTier(uint8 tier, string calldata name, uint16 score) external onlyRole(TIER_ADMIN_ROLE) {
        require(tier >= 1 && tier <= 4, "ZecRepRegistryEncrypted: invalid tier");
        require(bytes(name).length > 0, "ZecRepRegistryEncrypted: name required");
        require(score > 0, "ZecRepRegistryEncrypted: score required");

        _tiers[tier].name = name;
        _tiers[tier].score = score;

        emit TierConfigured(tier, name, score);
    }

    /**
     * @dev Get encrypted tier for an account (requires permission to decrypt).
     */
    function getEncryptedTier(address account, Permission calldata permission)
        external
        view
        onlyPermitted(permission, account)
        returns (uint8)
    {
        EncryptedProofRecord memory record = _records[account];
        require(record.encryptedTier.isInitialized(), "ZecRepRegistryEncrypted: no proof");
        return uint8(FHE.decrypt(record.encryptedTier));
    }
}

