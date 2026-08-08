// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ICompliance — ERC-3643 compliance module interface
interface ICompliance {
    event ComplianceBound(address indexed token);
    event CCPCheckFailed(address indexed from, address indexed to, uint256 amount, bytes32 reason);

    function bindToken(address token) external;
    function unbindToken(address token) external;
    function canTransfer(address from, address to, uint256 amount) external view returns (bool);
    function transferred(address from, address to, uint256 amount) external;
    function created(address to, uint256 amount) external;
    function destroyed(address from, uint256 amount) external;
}
