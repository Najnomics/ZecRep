// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { ZecRepRegistry } from "../ZecRepRegistry.sol";
import { ZecRepGuards } from "../ZecRepGuards.sol";

/**
 * @title LendingAdapter
 * @notice Example lending protocol adapter that uses ZecRep tier system.
 *         Demonstrates how to apply tier-based interest rates and LTV boosts.
 * 
 * Based on README.md use cases:
 * - Bronze: 9.5% APR (5% discount from base 10%)
 * - Silver: 9.0% APR (10% discount)
 * - Gold: 8.0% APR (20% discount)
 * - Platinum: 7.0% APR (30% discount)
 */
contract LendingAdapter {
    using ZecRepGuards for ZecRepRegistry;

    ZecRepRegistry public immutable zecRep;
    uint256 public constant BASE_RATE_BPS = 1000; // 10% APR = 1000 basis points

    mapping(address => uint256) public borrowBalance;

    event LoanIssued(address indexed borrower, uint256 amount, uint256 rateBps, uint256 ltvBoostBps);
    event LoanRepaid(address indexed borrower, uint256 amount);

    constructor(address _zecRep) {
        require(_zecRep != address(0), "LendingAdapter: invalid registry");
        zecRep = ZecRepRegistry(_zecRep);
    }

    /**
     * @dev Calculate interest rate based on ZecRep tier.
     *      Uses fee discount multiplier from ZecRepGuards.
     */
    function calculateInterestRate(address borrower) public view returns (uint256 rateBps) {
        uint256 discountMultiplier = zecRep.getFeeDiscountMultiplier(borrower);
        // Apply discount: base rate * multiplier (e.g., 0.80 for 20% discount)
        rateBps = (BASE_RATE_BPS * discountMultiplier) / 1e18;
        return rateBps;
    }

    /**
     * @dev Issue a loan with tier-based rate and LTV boost.
     *      Requires minimum Silver tier for access.
     */
    function borrow(address borrower, uint256 amount, uint256 collateralValue) external {
        // Require minimum Silver tier
        zecRep.requireTier(borrower, uint8(ZecRepRegistry.TierLevel.SILVER));

        uint256 rateBps = calculateInterestRate(borrower);
        uint256 ltvBoostBps = zecRep.getLTVBoostBps(borrower);
        
        // Calculate maximum loan amount with LTV boost
        uint256 baseLTV = 7000; // 70% base LTV
        uint256 maxLoan = (collateralValue * (baseLTV + ltvBoostBps)) / 10000;
        
        require(amount <= maxLoan, "LendingAdapter: exceeds max LTV");

        borrowBalance[borrower] += amount;
        
        emit LoanIssued(borrower, amount, rateBps, ltvBoostBps);
    }

    /**
     * @dev Repay a loan.
     */
    function repay(address borrower, uint256 amount) external {
        require(borrowBalance[borrower] >= amount, "LendingAdapter: insufficient balance");
        borrowBalance[borrower] -= amount;
        emit LoanRepaid(borrower, amount);
    }

    /**
     * @dev Get borrower's effective APR percentage.
     */
    function getBorrowerAPR(address borrower) external view returns (uint256) {
        return calculateInterestRate(borrower);
    }
}

