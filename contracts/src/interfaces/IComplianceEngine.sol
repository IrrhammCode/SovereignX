// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ICompliance} from "./ICompliance.sol";

/// @title IComplianceEngine — Cleanverse CCP bridge interface
interface IComplianceEngine is ICompliance {
    function ccpEnabled() external view returns (bool);
    function setCCPEnabled(bool enabled) external;
    function recordCCPValidation(address from, address to, uint256 amount, bool passed, bytes32 attestationHash)
        external;
    function lastCCPAttestation(address from, address to) external view returns (bytes32);
}
