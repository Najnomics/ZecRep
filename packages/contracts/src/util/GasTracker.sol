// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title GasTracker
 * @notice Utility library for tracking gas usage in tests and production.
 */
library GasTracker {
    uint256 private constant GAS_START = type(uint256).max;

    function start() internal view returns (uint256) {
        return gasleft();
    }

    function stop(uint256 startGas) internal view returns (uint256) {
        return startGas - gasleft();
    }
}

