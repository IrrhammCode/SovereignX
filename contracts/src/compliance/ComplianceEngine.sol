// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IComplianceEngine} from "../interfaces/IComplianceEngine.sol";
import {IIdentityRegistry} from "../interfaces/IIdentityRegistry.sol";

/// @title ComplianceEngine — Cleanverse CCP rules enforced on-chain
/// @dev Off-chain Cleanverse API validates; attestation hash recorded by COMPLIANCE_AGENT.
///      On failure, canTransfer returns false → token reverts → withFailureStateSafety locks assets.
contract ComplianceEngine is Initializable, AccessControlUpgradeable, UUPSUpgradeable, IComplianceEngine {
    bytes32 public constant COMPLIANCE_AGENT_ROLE = keccak256("COMPLIANCE_AGENT_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @dev Minimum CVI tier for SOVX transfers (Cleanverse tier mapping)
    uint8 public minTier;
    bool public ccpEnabled;
    address public identityRegistry;

    mapping(address => bool) private _boundTokens;
    mapping(bytes32 => bytes32) private _ccpAttestations;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address admin, address registry_, uint8 minTier_) external initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(COMPLIANCE_AGENT_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        identityRegistry = registry_;
        minTier = minTier_;
        ccpEnabled = true;
    }

    function setIdentityRegistry(address registry_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        identityRegistry = registry_;
    }

    function setMinTier(uint8 tier_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        minTier = tier_;
    }

    function setCCPEnabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        ccpEnabled = enabled;
    }

    function bindToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _boundTokens[token] = true;
        emit ComplianceBound(token);
    }

    function unbindToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _boundTokens[token] = false;
    }

    /// @notice ERC-3643 compliance hook — called before every transfer/mint/burn
    function canTransfer(address from, address to, uint256 amount) external view returns (bool) {
        if (amount == 0) return false;
        if (!ccpEnabled) return true;

        IIdentityRegistry registry = IIdentityRegistry(identityRegistry);

        // Mint path: from == address(0)
        if (from == address(0)) {
            return _onlyVerifiedReceiver(registry, to);
        }

        // Burn path: to == address(0)
        if (to == address(0)) {
            return _onlyVerifiedSender(registry, from);
        }

        return _withComplianceRules(registry, from, to, amount);
    }

    function transferred(address, address, uint256) external pure {
        // Post-transfer hook — no state mutation for parallelization safety on Monad
    }

    function created(address to, uint256 amount) external {
        if (!_boundTokens[msg.sender]) revert UnboundToken();
        if (amount == 0) revert ZeroAmount();
        IIdentityRegistry registry = IIdentityRegistry(identityRegistry);
        if (!_onlyVerifiedReceiver(registry, to)) revert ReceiverNotVerified();
    }

    function destroyed(address from, uint256 amount) external {
        if (!_boundTokens[msg.sender]) revert UnboundToken();
        if (amount == 0) revert ZeroAmount();
        IIdentityRegistry registry = IIdentityRegistry(identityRegistry);
        if (!_onlyVerifiedSender(registry, from)) revert SenderNotVerified();
    }

    function recordCCPValidation(address from, address to, uint256 amount, bool passed, bytes32 attestationHash)
        external
        onlyRole(COMPLIANCE_AGENT_ROLE)
    {
        bytes32 key = keccak256(abi.encodePacked(from, to, amount, block.number));
        _ccpAttestations[key] = attestationHash;
        if (!passed) {
            emit CCPCheckFailed(from, to, amount, attestationHash);
        }
    }

    function lastCCPAttestation(address from, address to) external view returns (bytes32) {
        return _ccpAttestations[keccak256(abi.encodePacked(from, to, 0, block.number))];
    }

    // ── Internal compliance modifiers (logic) ────────────────────────────────

    function _onlyVerifiedSender(IIdentityRegistry registry, address sender) internal view returns (bool) {
        if (registry.isSanctioned(sender)) return false;
        if (!registry.isVerified(sender)) return false;
        (, uint8 tier,,,) = registry.getIdentity(sender);
        if (tier < minTier) return false;
        return true;
    }

    function _onlyVerifiedReceiver(IIdentityRegistry registry, address receiver) internal view returns (bool) {
        if (registry.isSanctioned(receiver)) return false;
        if (!registry.isVerified(receiver)) return false;
        return true;
    }

    function _withComplianceRules(IIdentityRegistry registry, address from, address to, uint256)
        internal
        view
        returns (bool)
    {
        if (!_onlyVerifiedSender(registry, from)) return false;
        if (!_onlyVerifiedReceiver(registry, to)) return false;
        return true;
    }

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}

    error UnboundToken();
    error ZeroAmount();
    error ReceiverNotVerified();
    error SenderNotVerified();
}
