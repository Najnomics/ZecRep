// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title ZecRepErrors
 * @notice Centralized error definitions for ZecRep contracts.
 */
library ZecRepErrors {
    error InvalidAddress();
    error InvalidTier();
    error TierNotConfigured();
    error TierRequirementNotMet(uint8 required, uint8 actual);
    error NotRegistered(address account);
    error ProofAlreadyExists(address account);
    error InvalidProofHash();
    error Unauthorized();
    error InvalidConfiguration();
    error TierArrayLengthMismatch();
}

