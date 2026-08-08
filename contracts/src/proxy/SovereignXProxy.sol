// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/// @title SovereignXProxy — UUPS proxy wrapper for upgradeable SovereignX contracts
contract SovereignXProxy is ERC1967Proxy {
    constructor(address implementation, bytes memory initData) ERC1967Proxy(implementation, initData) {}
}
