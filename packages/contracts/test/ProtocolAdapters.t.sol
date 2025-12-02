// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { Test } from "forge-std/src/Test.sol";
import { ZecRepRegistry } from "../src/ZecRepRegistry.sol";
import { ZecRepGuards } from "../src/ZecRepGuards.sol";
import { LendingAdapter } from "../src/examples/LendingAdapter.sol";
import { DexAdapter } from "../src/examples/DexAdapter.sol";
import { DaoAdapter } from "../src/examples/DaoAdapter.sol";
import { YieldAdapter } from "../src/examples/YieldAdapter.sol";
import { FheEnabled } from "../util/FheHelper.sol";

/**
 * Integration tests for protocol adapter examples.
 * Verifies that adapters correctly use ZecRepGuards for tier-based logic.
 */
contract ProtocolAdaptersTest is Test, FheEnabled {
    ZecRepRegistry registry;
    LendingAdapter lending;
    DexAdapter dex;
    DaoAdapter dao;
    YieldAdapter yield;

    address admin = address(0x1);
    address alice = address(0x2);
    address bob = address(0x3);

    uint64 constant ONE_ZEC = 100_000_000;

    function setUp() public {
        initializeFhe();

        ZecRepRegistry.TierConfigInput[] memory tiers = new ZecRepRegistry.TierConfigInput[](4);
        tiers[0] = _tier("Bronze", 1 * ONE_ZEC, 2 * ONE_ZEC, 100);
        tiers[1] = _tier("Silver", 3 * ONE_ZEC, 10 * ONE_ZEC, 200);
        tiers[2] = _tier("Gold", 11 * ONE_ZEC, 50 * ONE_ZEC, 500);
        tiers[3] = _tier("Platinum", 51 * ONE_ZEC, 1000 * ONE_ZEC, 1000);

        registry = new ZecRepRegistry(admin, tiers);

        // Set tier URIs for badge minting
        vm.startPrank(admin);
        registry.badge().setTierURI(1, "ipfs://bronze");
        registry.badge().setTierURI(2, "ipfs://silver");
        registry.badge().setTierURI(3, "ipfs://gold");
        registry.badge().setTierURI(4, "ipfs://platinum");
        vm.stopPrank();

        // Deploy adapters
        lending = new LendingAdapter(address(registry));
        dex = new DexAdapter(address(registry));
        dao = new DaoAdapter(address(registry));
        yield = new YieldAdapter(address(registry));
    }

    function _tier(string memory name, uint64 min, uint64 max, uint16 score)
        private
        pure
        returns (ZecRepRegistry.TierConfigInput memory)
    {
        return ZecRepRegistry.TierConfigInput({name: name, minZats: min, maxZats: max, score: score});
    }

    function testLendingAdapterTierRequirements() public {
        // Alice gets Gold tier
        vm.prank(alice);
        registry.submitProof(encrypt64(12 * ONE_ZEC), keccak256("gold"), uint8(ZecRepRegistry.TierLevel.GOLD));

        // Alice can borrow (Silver required, has Gold)
        lending.borrow(alice, 1000, 10000);
        assertEq(lending.borrowBalance(alice), 1000);

        // Bob has no tier, should fail
        vm.expectRevert();
        lending.borrow(bob, 1000, 10000);
    }

    function testDexAdapterFeeDiscounts() public {
        // Alice gets Gold tier
        vm.prank(alice);
        registry.submitProof(encrypt64(12 * ONE_ZEC), keccak256("gold"), uint8(ZecRepRegistry.TierLevel.GOLD));

        uint256 feeBps = dex.getTraderFeeBps(alice);
        assertEq(feeBps, 24); // 0.30% * 0.80 = 0.24%
    }

    function testDaoAdapterVoteMultipliers() public {
        // Alice gets Gold tier
        vm.prank(alice);
        registry.submitProof(encrypt64(12 * ONE_ZEC), keccak256("gold"), uint8(ZecRepRegistry.TierLevel.GOLD));

        // Create proposal
        uint256 proposalId = dao.createProposal("Test proposal", 7 days);

        // Vote with Gold tier multiplier
        vm.prank(alice);
        dao.vote(proposalId, true);

        // Check vote weight (base 100 * 2x = 200)
        uint256 voteWeight = dao.getVoteWeight(alice, 100);
        assertEq(voteWeight, 200);
    }

    function testYieldAdapterMultipliers() public {
        // Alice gets Gold tier
        vm.prank(alice);
        registry.submitProof(encrypt64(12 * ONE_ZEC), keccak256("gold"), uint8(ZecRepRegistry.TierLevel.GOLD));

        // Deposit
        vm.deal(alice, 10 ether);
        vm.prank(alice);
        yield.deposit{value: 10 ether}();

        uint256 apy = yield.getUserAPY(alice);
        assertEq(apy, 1500); // 10% * 1.5x = 15% = 1500 bps
    }
}

