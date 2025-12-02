// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { ZecRepRegistry } from "../ZecRepRegistry.sol";
import { ZecRepGuards } from "../ZecRepGuards.sol";

/**
 * @title YieldAdapter
 * @notice Example yield protocol adapter that grants tier-based reward multipliers.
 *         Demonstrates how to use ZecRep for bonus yield earnings.
 * 
 * Based on README.md use cases:
 * - Base APY: 10%
 * - Bronze: 11.25% APY (1.125x multiplier)
 * - Silver: 12.5% APY (1.25x multiplier)
 * - Gold: 15% APY (1.5x multiplier)
 * - Platinum: 20% APY (2.0x multiplier)
 */
contract YieldAdapter {
    using ZecRepGuards for ZecRepRegistry;

    ZecRepRegistry public immutable zecRep;
    uint256 public constant BASE_APY_BPS = 1000; // 10% APY = 1000 basis points

    mapping(address => uint256) public deposits;
    mapping(address => uint256) public rewardsAccrued;
    mapping(address => uint256) public lastUpdateBlock;

    uint256 public totalDeposits;
    uint256 public constant BLOCKS_PER_YEAR = 2_628_000; // ~12s per block

    event Deposit(address indexed user, uint256 amount, uint256 multiplier);
    event Withdraw(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount, uint256 multiplier);

    constructor(address _zecRep) {
        require(_zecRep != address(0), "YieldAdapter: invalid registry");
        zecRep = ZecRepRegistry(_zecRep);
    }

    /**
     * @dev Calculate effective APY based on ZecRep tier.
     */
    function getEffectiveAPY(address user) public view returns (uint256 apyBps) {
        uint256 multiplier = zecRep.getYieldMultiplier(user);
        apyBps = (BASE_APY_BPS * multiplier) / 1e18;
        return apyBps;
    }

    /**
     * @dev Deposit tokens into the yield vault.
     *      All users can deposit, but tier determines rewards.
     */
    function deposit() external payable {
        require(msg.value > 0, "YieldAdapter: amount required");
        
        _updateRewards(msg.sender);
        
        deposits[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        uint256 multiplier = zecRep.getYieldMultiplier(msg.sender);
        
        emit Deposit(msg.sender, msg.value, multiplier);
    }

    /**
     * @dev Withdraw deposited tokens and claim accrued rewards.
     */
    function withdraw(uint256 amount) external {
        require(deposits[msg.sender] >= amount, "YieldAdapter: insufficient balance");
        
        _updateRewards(msg.sender);
        
        deposits[msg.sender] -= amount;
        totalDeposits -= amount;
        
        uint256 rewards = rewardsAccrued[msg.sender];
        rewardsAccrued[msg.sender] = 0;
        
        payable(msg.sender).transfer(amount + rewards);
        
        emit Withdraw(msg.sender, amount);
        if (rewards > 0) {
            uint256 multiplier = zecRep.getYieldMultiplier(msg.sender);
            emit RewardClaimed(msg.sender, rewards, multiplier);
        }
    }

    /**
     * @dev Claim accrued rewards without withdrawing principal.
     */
    function claimRewards() external {
        _updateRewards(msg.sender);
        
        uint256 rewards = rewardsAccrued[msg.sender];
        require(rewards > 0, "YieldAdapter: no rewards");
        
        rewardsAccrued[msg.sender] = 0;
        payable(msg.sender).transfer(rewards);
        
        uint256 multiplier = zecRep.getYieldMultiplier(msg.sender);
        emit RewardClaimed(msg.sender, rewards, multiplier);
    }

    /**
     * @dev Update accrued rewards for a user based on their tier multiplier.
     */
    function _updateRewards(address user) internal {
        if (deposits[user] == 0) {
            lastUpdateBlock[user] = block.number;
            return;
        }

        uint256 blocksSinceUpdate = block.number - lastUpdateBlock[user];
        if (blocksSinceUpdate == 0) return;

        uint256 apyBps = getEffectiveAPY(user);
        uint256 annualReward = (deposits[user] * apyBps) / 10000;
        uint256 blockReward = (annualReward * blocksSinceUpdate) / BLOCKS_PER_YEAR;
        
        rewardsAccrued[user] += blockReward;
        lastUpdateBlock[user] = block.number;
    }

    /**
     * @dev Get current pending rewards for a user.
     */
    function getPendingRewards(address user) external view returns (uint256) {
        if (deposits[user] == 0) return rewardsAccrued[user];

        uint256 blocksSinceUpdate = block.number - lastUpdateBlock[user];
        uint256 apyBps = getEffectiveAPY(user);
        uint256 annualReward = (deposits[user] * apyBps) / 10000;
        uint256 blockReward = (annualReward * blocksSinceUpdate) / BLOCKS_PER_YEAR;
        
        return rewardsAccrued[user] + blockReward;
    }

    /**
     * @dev Get user's effective APY percentage.
     */
    function getUserAPY(address user) external view returns (uint256) {
        return getEffectiveAPY(user);
    }
}

