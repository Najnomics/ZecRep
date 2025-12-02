// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { Script, console } from "forge-std/Script.sol";
import { ZecRepRegistry } from "../src/ZecRepRegistry.sol";
import { ZecRepBadge } from "../src/ZecRepBadge.sol";

/**
 * @title DeployZecRep
 * @notice Deployment script for ZecRep contracts.
 * 
 * Usage:
 *   forge script script/Deploy.s.sol:DeployZecRep --rpc-url $RPC_URL --broadcast --verify
 */
contract DeployZecRep is Script {
    function run() external {
        address deployer = vm.addr(vm.envUint("PRIVATE_KEY"));
        vm.startBroadcast(deployer);

        // Initial tier configuration matching README.md
        ZecRepRegistry.TierConfigInput[] memory tiers = new ZecRepRegistry.TierConfigInput[](4);
        tiers[0] = ZecRepRegistry.TierConfigInput({
            name: "Bronze",
            minZats: 1 * 100_000_000, // 1 ZEC
            maxZats: 2 * 100_000_000, // 2 ZEC
            score: 100
        });
        tiers[1] = ZecRepRegistry.TierConfigInput({
            name: "Silver",
            minZats: 3 * 100_000_000, // 3 ZEC
            maxZats: 10 * 100_000_000, // 10 ZEC
            score: 200
        });
        tiers[2] = ZecRepRegistry.TierConfigInput({
            name: "Gold",
            minZats: 11 * 100_000_000, // 11 ZEC
            maxZats: 50 * 100_000_000, // 50 ZEC
            score: 500
        });
        tiers[3] = ZecRepRegistry.TierConfigInput({
            name: "Platinum",
            minZats: 51 * 100_000_000, // 51 ZEC
            maxZats: 1000 * 100_000_000, // 1000 ZEC
            score: 1000
        });

        ZecRepRegistry registry = new ZecRepRegistry(deployer, tiers);
        ZecRepBadge badge = registry.badge();

        console.log("ZecRepRegistry deployed at:", address(registry));
        console.log("ZecRepBadge deployed at:", address(badge));

        // Set tier URIs (update with actual IPFS/metadata URLs)
        badge.setTierURI(1, "ipfs://bronze-metadata");
        badge.setTierURI(2, "ipfs://silver-metadata");
        badge.setTierURI(3, "ipfs://gold-metadata");
        badge.setTierURI(4, "ipfs://platinum-metadata");

        vm.stopBroadcast();
    }
}
