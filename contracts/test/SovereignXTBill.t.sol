// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SovereignXProxy} from "../src/proxy/SovereignXProxy.sol";
import {IdentityRegistry} from "../src/registry/IdentityRegistry.sol";
import {ComplianceEngine} from "../src/compliance/ComplianceEngine.sol";
import {SovereignXTBill} from "../src/token/SovereignXTBill.sol";
import {IIdentityRegistry} from "../src/interfaces/IIdentityRegistry.sol";

contract SovereignXTBillTest is Test {
    IdentityRegistry registry;
    ComplianceEngine compliance;
    SovereignXTBill sovx;

    address admin = makeAddr("admin");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address sanctioned = makeAddr("sanctioned");

    uint256 constant FRACTION = 10_000_000; // $10

    function setUp() public {
        vm.startPrank(admin);

        IdentityRegistry registryImpl = new IdentityRegistry();
        registry = IdentityRegistry(
            address(new SovereignXProxy(address(registryImpl), abi.encodeCall(IdentityRegistry.initialize, (admin))))
        );

        ComplianceEngine complianceImpl = new ComplianceEngine();
        compliance = ComplianceEngine(
            address(
                new SovereignXProxy(
                    address(complianceImpl),
                    abi.encodeCall(ComplianceEngine.initialize, (admin, address(registry), uint8(1)))
                )
            )
        );

        SovereignXTBill tokenImpl = new SovereignXTBill();
        sovx = SovereignXTBill(
            address(
                new SovereignXProxy(
                    address(tokenImpl),
                    abi.encodeCall(
                        SovereignXTBill.initialize,
                        ("SovereignX T-Bill", "SOVX", admin, address(registry), address(compliance))
                    )
                )
            )
        );

        compliance.bindToken(address(sovx));
        vm.stopPrank();
    }

    function _registerVerified(address wallet) internal {
        vm.prank(admin);
        registry.registerIdentity(
            wallet,
            keccak256(abi.encodePacked(wallet, "cvi")),
            3,
            block.timestamp + 365 days,
            bytes2("US")
        );
    }

    function test_MintAndTransferBetweenVerified() public {
        _registerVerified(alice);
        _registerVerified(bob);

        vm.prank(admin);
        sovx.mint(alice, FRACTION * 10);

        vm.prank(alice);
        sovx.transfer(bob, FRACTION * 2);

        assertEq(sovx.balanceOf(bob), FRACTION * 2);
        assertEq(sovx.balanceOf(alice), FRACTION * 8);
    }

    function test_RevertTransferToUnverifiedReceiver() public {
        _registerVerified(alice);

        vm.prank(admin);
        sovx.mint(alice, FRACTION);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(SovereignXTBill.ReceiverNotVerified.selector, bob)
        );
        sovx.transfer(bob, FRACTION);
    }

    function test_RevertTransferFromSanctionedSender() public {
        _registerVerified(alice);
        _registerVerified(bob);
        _registerVerified(sanctioned);

        vm.prank(admin);
        sovx.mint(sanctioned, FRACTION);

        vm.prank(admin);
        registry.revokeIdentity(sanctioned, "OFAC match");

        vm.prank(sanctioned);
        vm.expectRevert(
            abi.encodeWithSelector(SovereignXTBill.SenderSanctioned.selector, sanctioned)
        );
        sovx.transfer(bob, FRACTION);
    }

    function test_RevertBelowMinFraction() public {
        _registerVerified(alice);

        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(SovereignXTBill.BelowMinFraction.selector, FRACTION / 2, FRACTION)
        );
        sovx.mint(alice, FRACTION / 2);
    }

    function test_FailureStateSafetyPreservesBalance() public {
        _registerVerified(alice);

        vm.prank(admin);
        sovx.mint(alice, FRACTION * 5);

        uint256 before = sovx.balanceOf(alice);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(SovereignXTBill.ReceiverNotVerified.selector, bob)
        );
        sovx.transfer(bob, FRACTION);

        assertEq(sovx.balanceOf(alice), before, "asset locked in compliant wallet");
    }

    function test_ForcedTransferDisabled() public {
        vm.expectRevert(SovereignXTBill.ForcedTransferDisabled.selector);
        sovx.forcedTransfer(alice, bob, FRACTION);
    }

    function test_ComplianceCanTransferReturnsFalseForSanctioned() public {
        _registerVerified(sanctioned);
        vm.prank(admin);
        registry.updateStatus(sanctioned, IIdentityRegistry.CVIStatus.Sanctioned);

        assertFalse(compliance.canTransfer(sanctioned, alice, FRACTION));
    }
}
