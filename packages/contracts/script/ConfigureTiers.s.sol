// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { Script, console } from "forge-std/Script.sol";
import { ZecRepRegistry } from "../src/ZecRepRegistry.sol";

/**
 * @title ConfigureTiers
 * @notice Script to update tier configurations after deployment.
 * 
 * Usage:
 *   forge script script/ConfigureTiers.s.sol:ConfigureTiers \
 *     --rpc-url $RPC_URL \
 *     --sig "run(address)" $REGISTRY_ADDRESS \
 *     --broadcast
 */
contract ConfigureTiers is Script {
    function run(address registryAddress) external {
        address admin = vm.addr(vm.envUint("PRIVATE_KEY"));
        vm.startBroadcast(admin);

        ZecRepRegistry registry = ZecRepRegistry(registryAddress);

        // Example: Update Gold tier configuration
        ZecRepRegistry.TierConfigInput memory newGold = ZecRepRegistry.TierConfigInput({
            name: "Gold",
            minZats: 11 * 100_000_000,
            maxZats: 55 * 100_000_000, // Updated max
            score: 750 // Updated score
        });

        registry.configureTier(uint8(ZecRepRegistry.TierLevel.GOLD), newGold);
        console.log("Gold tier updated");

        vm.stopBroadcast();
    }
}

