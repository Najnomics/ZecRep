// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { Test } from "forge-std/src/Test.sol";

import { ZecRepRegistry } from "../src/ZecRepRegistry.sol";
import { ZecRepBadge } from "../src/ZecRepBadge.sol";
import { FheEnabled } from "../util/FheHelper.sol";
import { PermissionHelper } from "../util/PermissionHelper.sol";
import { Permission } from "@fhenixprotocol/contracts/access/Permissioned.sol";
import { inEuint64 } from "@fhenixprotocol/contracts/FHE.sol";

contract ZecRepRegistryTest is Test, FheEnabled {
    uint256 private constant ALICE_KEY = 0xA11CE;
    uint256 private constant BOB_KEY = 0xB0B;
    uint64 private constant ONE_ZEC = 1e8;

    address private admin;
    address private alice;
    address private bob;

    ZecRepRegistry private registry;
    ZecRepBadge private badge;
    PermissionHelper private permissionHelper;

    function setUp() public {
        initializeFhe();
        admin = vm.addr(0xF00D);
        alice = vm.addr(ALICE_KEY);
        bob = vm.addr(BOB_KEY);

        ZecRepRegistry.TierConfigInput[] memory tiers = new ZecRepRegistry.TierConfigInput[](4);
        tiers[0] = _tier("Bronze", 1 * ONE_ZEC, 2 * ONE_ZEC, 100);
        tiers[1] = _tier("Silver", 3 * ONE_ZEC, 10 * ONE_ZEC, 200);
        tiers[2] = _tier("Gold", 10 * ONE_ZEC, 50 * ONE_ZEC, 500);
        tiers[3] = _tier("Platinum", 50 * ONE_ZEC, 500 * ONE_ZEC, 1000);

        registry = new ZecRepRegistry(admin, tiers);
        badge = registry.badge();
        permissionHelper = new PermissionHelper(address(registry));

        vm.startPrank(admin);
        badge.setTierURI(1, "ipfs://bronze");
        badge.setTierURI(2, "ipfs://silver");
        badge.setTierURI(3, "ipfs://gold");
        badge.setTierURI(4, "ipfs://platinum");
        vm.stopPrank();
    }

    function testSubmitProofStoresRecordAndMintsBadge() public {
        bytes32 proofHash = keccak256("proof-1");
        inEuint64 memory encryptedTotal = encrypt64(12 * ONE_ZEC);

        vm.prank(alice);
        registry.submitProof(encryptedTotal, proofHash, uint8(ZecRepRegistry.TierLevel.GOLD));

        (uint8 tier, uint16 score, uint64 submittedAt) = registry.userTier(alice);
        assertEq(tier, uint8(ZecRepRegistry.TierLevel.GOLD));
        assertEq(score, 500);
        assertGt(submittedAt, 0);

        uint256 tokenId = uint256(uint160(alice));
        assertEq(badge.ownerOf(tokenId), alice);
        assertEq(badge.tokenTier(tokenId), tier);
        assertEq(registry.totalParticipants(), 1);
        assertEq(registry.totalProofs(), 1);
    }

    function testSubmitProofTwiceUpgradesBadge() public {
        vm.startPrank(alice);
        registry.submitProof(encrypt64(2 * ONE_ZEC), keccak256("bronze"), uint8(ZecRepRegistry.TierLevel.BRONZE));
        registry.submitProof(encrypt64(60 * ONE_ZEC), keccak256("platinum"), uint8(ZecRepRegistry.TierLevel.PLATINUM));
        vm.stopPrank();

        uint256 tokenId = uint256(uint160(alice));
        assertEq(badge.tokenTier(tokenId), uint8(ZecRepRegistry.TierLevel.PLATINUM));
        assertEq(badge.tokenScore(tokenId), 1000);
        assertEq(registry.totalParticipants(), 1);
        assertEq(registry.totalProofs(), 2);
    }

    function testSealTotalRequiresPermission() public {
        vm.prank(alice);
        registry.submitProof(encrypt64(15 * ONE_ZEC), keccak256("gold"), uint8(ZecRepRegistry.TierLevel.GOLD));

        Permission memory permission = permissionHelper.generatePermission(ALICE_KEY);

        vm.prank(alice);
        string memory sealedForSelf = registry.sealMyTotal(permission);
        assertGt(bytes(sealedForSelf).length, 0);

        vm.prank(bob);
        string memory sealedForProtocol = registry.sealTotalWithPermission(alice, permission);
        assertEq(sealedForProtocol, sealedForSelf);
    }

    function testSoulboundBadgeCannotTransfer() public {
        vm.prank(alice);
        registry.submitProof(encrypt64(4 * ONE_ZEC), keccak256("silver"), uint8(ZecRepRegistry.TierLevel.SILVER));

        vm.expectRevert(ZecRepBadge.Soulbound.selector);
        vm.prank(alice);
        badge.transferFrom(alice, bob, uint256(uint160(alice)));
    }

    function testConfigureTierOnlyAdmin() public {
        ZecRepRegistry.TierConfigInput memory updated = _tier("Gold", 11 * ONE_ZEC, 55 * ONE_ZEC, 750);

        vm.expectRevert();
        vm.prank(alice);
        registry.configureTier(uint8(ZecRepRegistry.TierLevel.GOLD), updated);

        vm.prank(admin);
        registry.configureTier(uint8(ZecRepRegistry.TierLevel.GOLD), updated);

        ZecRepRegistry.TierConfig memory config = registry.getTier(uint8(ZecRepRegistry.TierLevel.GOLD));
        assertEq(config.score, 750);
        assertEq(config.maxZats, 55 * ONE_ZEC);
    }

    function _tier(
        string memory name,
        uint64 minZats,
        uint64 maxZats,
        uint16 score
    )
        private
        pure
        returns (ZecRepRegistry.TierConfigInput memory)
    {
        return ZecRepRegistry.TierConfigInput({ name: name, minZats: minZats, maxZats: maxZats, score: score });
    }
}

