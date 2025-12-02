// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { Test } from "forge-std/src/Test.sol";
import { ZecRepRegistry } from "../src/ZecRepRegistry.sol";
import { ZecRepGuards } from "../src/ZecRepGuards.sol";
import { FheEnabled } from "../util/FheHelper.sol";

contract ZecRepGuardsTest is Test, FheEnabled {
    ZecRepRegistry registry;
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
        registry.badge().setTierURI(uint8(ZecRepRegistry.TierLevel.BRONZE), "ipfs://bronze");
        registry.badge().setTierURI(uint8(ZecRepRegistry.TierLevel.SILVER), "ipfs://silver");
        registry.badge().setTierURI(uint8(ZecRepRegistry.TierLevel.GOLD), "ipfs://gold");
        registry.badge().setTierURI(uint8(ZecRepRegistry.TierLevel.PLATINUM), "ipfs://platinum");
        vm.stopPrank();
    }

    function _tier(string memory name, uint64 min, uint64 max, uint16 score)
        private
        pure
        returns (ZecRepRegistry.TierConfigInput memory)
    {
        return ZecRepRegistry.TierConfigInput({name: name, minZats: min, maxZats: max, score: score});
    }

    function testRequireTier() public {
        vm.prank(alice);
        registry.submitProof(encrypt64(12 * ONE_ZEC), keccak256("gold"), uint8(ZecRepRegistry.TierLevel.GOLD));

        // Should not revert for valid tier
        ZecRepGuards.requireTier(registry, alice, uint8(ZecRepRegistry.TierLevel.SILVER));
        ZecRepGuards.requireTier(registry, alice, uint8(ZecRepRegistry.TierLevel.GOLD));

        // Should revert for insufficient tier - but meetsTier returns false, so we need to check the actual revert
        // meetsTier returns false, so we should hit TierTooLow
        vm.expectRevert();
        ZecRepGuards.requireTier(registry, alice, uint8(ZecRepRegistry.TierLevel.PLATINUM));
    }

    function testRequireTierNotRegistered() public {
        // meetsTier returns false for unregistered users, which causes requireTier to check tierOf
        // and revert with NotRegistered when tier is 0
        vm.expectRevert(abi.encodeWithSelector(ZecRepGuards.NotRegistered.selector, bob));
        ZecRepGuards.requireTier(registry, bob, uint8(ZecRepRegistry.TierLevel.BRONZE));
    }

    function testFeeDiscountMultiplier() public {
        // No tier = no discount
        assertEq(ZecRepGuards.getFeeDiscountMultiplier(registry, bob), 1e18);

        // Bronze = 5% discount
        vm.prank(bob);
        registry.submitProof(encrypt64(1 * ONE_ZEC), keccak256("bronze"), uint8(ZecRepRegistry.TierLevel.BRONZE));
        assertEq(ZecRepGuards.getFeeDiscountMultiplier(registry, bob), 0.95e18);

        // Gold = 20% discount
        vm.prank(alice);
        registry.submitProof(encrypt64(12 * ONE_ZEC), keccak256("gold"), uint8(ZecRepRegistry.TierLevel.GOLD));
        assertEq(ZecRepGuards.getFeeDiscountMultiplier(registry, alice), 0.80e18);
    }

    function testLTVBoost() public {
        // No tier = no boost
        assertEq(ZecRepGuards.getLTVBoostBps(registry, bob), 0);

        // Silver = 5% boost
        vm.prank(bob);
        registry.submitProof(encrypt64(5 * ONE_ZEC), keccak256("silver"), uint8(ZecRepRegistry.TierLevel.SILVER));
        assertEq(ZecRepGuards.getLTVBoostBps(registry, bob), 500);

        // Platinum = 20% boost
        vm.prank(alice);
        registry.submitProof(encrypt64(100 * ONE_ZEC), keccak256("platinum"), uint8(ZecRepRegistry.TierLevel.PLATINUM));
        assertEq(ZecRepGuards.getLTVBoostBps(registry, alice), 2000);
    }

    function testVoteMultiplier() public {
        // No tier = 1x
        assertEq(ZecRepGuards.getVoteMultiplier(registry, bob), 1e18);

        // Gold = 2x
        vm.prank(bob);
        registry.submitProof(encrypt64(12 * ONE_ZEC), keccak256("gold"), uint8(ZecRepRegistry.TierLevel.GOLD));
        assertEq(ZecRepGuards.getVoteMultiplier(registry, bob), 2e18);

        // Platinum = 3x
        vm.prank(alice);
        registry.submitProof(encrypt64(100 * ONE_ZEC), keccak256("platinum"), uint8(ZecRepRegistry.TierLevel.PLATINUM));
        assertEq(ZecRepGuards.getVoteMultiplier(registry, alice), 3e18);
    }

    function testYieldMultiplier() public {
        // No tier = 1x
        assertEq(ZecRepGuards.getYieldMultiplier(registry, bob), 1e18);

        // Silver = 1.25x
        vm.prank(bob);
        registry.submitProof(encrypt64(5 * ONE_ZEC), keccak256("silver"), uint8(ZecRepRegistry.TierLevel.SILVER));
        assertEq(ZecRepGuards.getYieldMultiplier(registry, bob), 1.25e18);

        // Gold = 1.5x
        vm.prank(alice);
        registry.submitProof(encrypt64(12 * ONE_ZEC), keccak256("gold"), uint8(ZecRepRegistry.TierLevel.GOLD));
        assertEq(ZecRepGuards.getYieldMultiplier(registry, alice), 1.5e18);
    }
}

