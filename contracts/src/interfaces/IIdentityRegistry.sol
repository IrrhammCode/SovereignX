// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IIdentityRegistry — CVI (Cleanverse Verified Identity) on-chain mirror
interface IIdentityRegistry {
    enum CVIStatus {
        None,
        Pending,
        Verified,
        Expired,
        Sanctioned,
        Frozen
    }

    event IdentityRegistered(address indexed wallet, bytes32 cviHash, uint256 expirationTime);
    event IdentityUpdated(address indexed wallet, CVIStatus status);
    event IdentityRevoked(address indexed wallet, string reason);

    function registerIdentity(
        address wallet,
        bytes32 cviHash,
        uint8 tier,
        uint256 expirationTime,
        bytes2 countryCode
    ) external;

    function updateStatus(address wallet, CVIStatus status) external;
    function revokeIdentity(address wallet, string calldata reason) external;

    function isVerified(address wallet) external view returns (bool);
    function isSanctioned(address wallet) external view returns (bool);
    function contains(address wallet) external view returns (bool);
    function getCVIStatus(address wallet) external view returns (CVIStatus);
    function getIdentity(address wallet)
        external
        view
        returns (bytes32 cviHash, uint8 tier, uint256 expirationTime, bytes2 countryCode, CVIStatus status);
}
