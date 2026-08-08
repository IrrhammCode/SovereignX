// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {SovereignXProxy} from "../src/proxy/SovereignXProxy.sol";
import {IdentityRegistry} from "../src/registry/IdentityRegistry.sol";
import {ComplianceEngine} from "../src/compliance/ComplianceEngine.sol";
import {SovereignXTBill} from "../src/token/SovereignXTBill.sol";
import {DividendDistributor} from "../src/dividend/DividendDistributor.sol";

/// @title Deploy — SovereignX full stack deployment for Monad testnet/mainnet
contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        address cvaToken = vm.envOr("CVA_STABLECOIN_ADDRESS", address(0x534b2f3A21130d7a60830c2Df862319e593943A3));

        vm.startBroadcast(deployerKey);

        // 1. IdentityRegistry (UUPS)
        IdentityRegistry registryImpl = new IdentityRegistry();
        SovereignXProxy registryProxy = new SovereignXProxy(
            address(registryImpl),
            abi.encodeCall(IdentityRegistry.initialize, (deployer))
        );
        IdentityRegistry registry = IdentityRegistry(address(registryProxy));

        // 2. ComplianceEngine (UUPS)
        ComplianceEngine complianceImpl = new ComplianceEngine();
        SovereignXProxy complianceProxy = new SovereignXProxy(
            address(complianceImpl),
            abi.encodeCall(ComplianceEngine.initialize, (deployer, address(registry), uint8(1)))
        );
        ComplianceEngine compliance = ComplianceEngine(address(complianceProxy));

        // 3. SovereignXTBill SOVX (UUPS)
        SovereignXTBill tokenImpl = new SovereignXTBill();
        SovereignXProxy tokenProxy = new SovereignXProxy(
            address(tokenImpl),
            abi.encodeCall(
                SovereignXTBill.initialize,
                ("SovereignX T-Bill", "SOVX", deployer, address(registry), address(compliance))
            )
        );
        SovereignXTBill sovx = SovereignXTBill(address(tokenProxy));

        // 4. DividendDistributor (UUPS)
        DividendDistributor dividendImpl = new DividendDistributor();
        SovereignXProxy dividendProxy = new SovereignXProxy(
            address(dividendImpl),
            abi.encodeCall(
                DividendDistributor.initialize,
                (deployer, cvaToken, address(registry), address(sovx))
            )
        );

        compliance.bindToken(address(sovx));

        vm.stopBroadcast();

        console2.log("IdentityRegistry:", address(registry));
        console2.log("ComplianceEngine:", address(compliance));
        console2.log("SovereignXTBill:", address(sovx));
        console2.log("DividendDistributor:", address(dividendProxy));
    }
}
