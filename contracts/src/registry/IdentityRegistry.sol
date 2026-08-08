// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IIdentityRegistry} from "../interfaces/IIdentityRegistry.sol";

/// @title IdentityRegistry — on-chain CVI store synced from Cleanverse A-Pass
/// @dev Only COMPLIANCE_AGENT role (backend oracle) may mutate after off-chain Cleanverse verification
contract IdentityRegistry is Initializable, AccessControlUpgradeable, UUPSUpgradeable, IIdentityRegistry {
    bytes32 public constant COMPLIANCE_AGENT_ROLE = keccak256("COMPLIANCE_AGENT_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    struct Identity {
        bytes32 cviHash;
        uint8 tier;
        uint256 expirationTime;
        bytes2 countryCode;
        CVIStatus status;
        bool exists;
    }

    mapping(address => Identity) private _identities;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address admin) external initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(COMPLIANCE_AGENT_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
    }

    function registerIdentity(
        address wallet,
        bytes32 cviHash,
        uint8 tier,
        uint256 expirationTime,
        bytes2 countryCode
    ) external onlyRole(COMPLIANCE_AGENT_ROLE) {
        if (wallet == address(0)) revert InvalidWallet();
        _identities[wallet] = Identity({
            cviHash: cviHash,
            tier: tier,
            expirationTime: expirationTime,
            countryCode: countryCode,
            status: CVIStatus.Verified,
            exists: true
        });
        emit IdentityRegistered(wallet, cviHash, expirationTime);
    }

    function updateStatus(address wallet, CVIStatus status) external onlyRole(COMPLIANCE_AGENT_ROLE) {
        if (!_identities[wallet].exists) revert IdentityNotFound();
        _identities[wallet].status = status;
        emit IdentityUpdated(wallet, status);
    }

    function revokeIdentity(address wallet, string calldata reason) external onlyRole(COMPLIANCE_AGENT_ROLE) {
        if (!_identities[wallet].exists) revert IdentityNotFound();
        _identities[wallet].status = CVIStatus.Sanctioned;
        emit IdentityRevoked(wallet, reason);
    }

    function isVerified(address wallet) public view returns (bool) {
        Identity storage id = _identities[wallet];
        if (!id.exists) return false;
        if (id.status != CVIStatus.Verified) return false;
        if (block.timestamp > id.expirationTime) return false;
        return true;
    }

    function isSanctioned(address wallet) public view returns (bool) {
        Identity storage id = _identities[wallet];
        if (!id.exists) return false;
        return id.status == CVIStatus.Sanctioned || id.status == CVIStatus.Frozen;
    }

    function contains(address wallet) external view returns (bool) {
        return _identities[wallet].exists;
    }

    function getCVIStatus(address wallet) external view returns (CVIStatus) {
        return _identities[wallet].status;
    }

    function getIdentity(address wallet)
        external
        view
        returns (bytes32 cviHash, uint8 tier, uint256 expirationTime, bytes2 countryCode, CVIStatus status)
    {
        Identity storage id = _identities[wallet];
        return (id.cviHash, id.tier, id.expirationTime, id.countryCode, id.status);
    }

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}

    error InvalidWallet();
    error IdentityNotFound();
}
