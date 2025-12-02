// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title EventHelpers
 * @notice Utility library for emitting structured events with indexed fields.
 */
library EventHelpers {
    event TierChange(
        address indexed account, uint8 indexed oldTier, uint8 indexed newTier, uint16 score
    );

    event ScoreUpdate(address indexed account, uint16 oldScore, uint16 newScore);

    function emitTierChange(address account, uint8 oldTier, uint8 newTier, uint16 score) internal {
        emit TierChange(account, oldTier, newTier, score);
    }

    function emitScoreUpdate(address account, uint16 oldScore, uint16 newScore) internal {
        emit ScoreUpdate(account, oldScore, newScore);
    }
}

