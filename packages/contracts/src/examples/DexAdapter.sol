// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { ZecRepRegistry } from "../ZecRepRegistry.sol";
import { ZecRepGuards } from "../ZecRepGuards.sol";

/**
 * @title DexAdapter
 * @notice Example DEX adapter that applies tier-based fee discounts.
 *         Demonstrates how to use ZecRep for trading fee reductions.
 * 
 * Based on README.md use cases:
 * - Base fee: 0.30%
 * - Bronze: 0.285% (5% off)
 * - Silver: 0.270% (10% off)
 * - Gold: 0.240% (20% off)
 * - Platinum: 0.210% (30% off)
 */
contract DexAdapter {
    using ZecRepGuards for ZecRepRegistry;

    ZecRepRegistry public immutable zecRep;
    uint256 public constant BASE_FEE_BPS = 30; // 0.30% = 30 basis points

    mapping(address => uint256) public totalVolumeTraded;
    mapping(address => uint256) public totalFeesPaid;

    event TradeExecuted(
        address indexed trader,
        uint256 volume,
        uint256 feeAmount,
        uint256 feeBps,
        uint8 tier
    );

    constructor(address _zecRep) {
        require(_zecRep != address(0), "DexAdapter: invalid registry");
        zecRep = ZecRepRegistry(_zecRep);
    }

    /**
     * @dev Calculate trading fee based on ZecRep tier.
     */
    function calculateTradingFee(address trader) public view returns (uint256 feeBps) {
        uint256 discountMultiplier = zecRep.getFeeDiscountMultiplier(trader);
        feeBps = (BASE_FEE_BPS * discountMultiplier) / 1e18;
        return feeBps;
    }

    /**
     * @dev Execute a trade with tier-based fee discount.
     *      No minimum tier required - all users benefit from their tier.
     */
    function executeTrade(address trader, uint256 tradeAmount) external {
        uint256 feeBps = calculateTradingFee(trader);
        uint256 feeAmount = (tradeAmount * feeBps) / 10000;
        
        uint8 tier = zecRep.tierOf(trader);
        
        totalVolumeTraded[trader] += tradeAmount;
        totalFeesPaid[trader] += feeAmount;
        
        emit TradeExecuted(trader, tradeAmount, feeAmount, feeBps, tier);
    }

    /**
     * @dev Get trader's effective fee rate in basis points.
     */
    function getTraderFeeBps(address trader) external view returns (uint256) {
        return calculateTradingFee(trader);
    }

    /**
     * @dev Get total savings from tier discounts for a trader.
     */
    function getTotalSavings(address trader) external view returns (uint256) {
        uint256 baseFees = (totalVolumeTraded[trader] * BASE_FEE_BPS) / 10000;
        return baseFees - totalFeesPaid[trader];
    }
}

