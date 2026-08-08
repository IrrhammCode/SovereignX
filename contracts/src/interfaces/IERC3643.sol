// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IERC3643 — Permissioned Security Token (T-REX compatible subset)
/// @notice SovereignX implements ERC-3643 for fractionalized US T-Bill tokens (SOVX)
interface IERC3643 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event IdentityRegistrySet(address indexed registry);
    event ComplianceSet(address indexed compliance);
    event Frozen(address indexed account);
    event Unfrozen(address indexed account);
    event Paused();
    event Unpaused();

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);

    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function forcedTransfer(address from, address to, uint256 amount) external returns (bool);

    function pause() external;
    function unpause() external;
    function setAddressFrozen(address account, bool freeze) external;
    function isFrozen(address account) external view returns (bool);

    function identityRegistry() external view returns (address);
    function compliance() external view returns (address);
    function setIdentityRegistry(address registry) external;
    function setCompliance(address compliance) external;

    function paused() external view returns (bool);
}
