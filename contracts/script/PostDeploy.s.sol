// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {SovereignXTBill} from "../src/token/SovereignXTBill.sol";

/// @title PostDeploy — seed demo SOVX supply after deployment
contract PostDeploy is Script {
    uint256 constant FRACTION = 10_000_000; // $10

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address sovx = vm.envAddress("SOVX_TOKEN_ADDRESS");
        address recipient = vm.envOr("SEED_RECIPIENT", vm.addr(deployerKey));

        vm.startBroadcast(deployerKey);

        SovereignXTBill token = SovereignXTBill(sovx);
        // Mint 100 fractions ($1,000) to demo wallet — requires recipient CVI on-chain
        token.mint(recipient, FRACTION * 100);

        vm.stopBroadcast();

        console2.log("Minted 1000 USD SOVX to", recipient);
    }
}
