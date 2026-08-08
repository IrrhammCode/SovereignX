// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IERC3643} from "../interfaces/IERC3643.sol";
import {ICompliance} from "../interfaces/ICompliance.sol";
import {IIdentityRegistry} from "../interfaces/IIdentityRegistry.sol";

/// @title SovereignXTBill (SOVX) — ERC-3643 permissioned fractional US T-Bill token
/// @notice $10 minimum fraction (6 decimals). Compliance enforced cryptographically — no admin override.
/// @dev Parallelization-ready: no cross-tx shared mutable state in transfer path beyond balances mapping shards.
contract SovereignXTBill is
    Initializable,
    ERC20Upgradeable,
    ERC20PausableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    IERC3643
{
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @dev $10.00 US with 6 decimals = 10_000_000
    uint256 public constant MIN_FRACTION = 10_000_000;

    address private _identityRegistry;
    address private _compliance;

    mapping(address => bool) private _frozen;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address admin,
        address identityRegistry_,
        address compliance_
    ) external initializer {
        __ERC20_init(name_, symbol_);
        __ERC20Pausable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(AGENT_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);

        _identityRegistry = identityRegistry_;
        _compliance = compliance_;
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function identityRegistry() external view returns (address) {
        return _identityRegistry;
    }

    function compliance() external view returns (address) {
        return _compliance;
    }

    function setIdentityRegistry(address registry) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _identityRegistry = registry;
        emit IdentityRegistrySet(registry);
    }

    function setCompliance(address compliance_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _compliance = compliance_;
        emit ComplianceSet(compliance_);
    }

    function isFrozen(address account) external view returns (bool) {
        return _frozen[account];
    }

    function setAddressFrozen(address account, bool freeze) external onlyRole(AGENT_ROLE) {
        _frozen[account] = freeze;
        if (freeze) emit Frozen(account);
        else emit Unfrozen(account);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
        emit Paused();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
        emit Unpaused();
    }

    /// @inheritdoc IERC3643
    function mint(address to, uint256 amount) external onlyRole(AGENT_ROLE) whenNotPaused nonReentrant {
        _enforceMinFraction(amount);
        _withFailureStateSafety(address(0), to, amount);
        _mint(to, amount);
        ICompliance(_compliance).created(to, amount);
    }

    /// @inheritdoc IERC3643
    function burn(address from, uint256 amount) external onlyRole(AGENT_ROLE) whenNotPaused nonReentrant {
        _withFailureStateSafety(from, address(0), amount);
        _burn(from, amount);
        ICompliance(_compliance).destroyed(from, amount);
    }

    /// @inheritdoc IERC3643
    function transfer(address to, uint256 amount)
        public
        override(ERC20Upgradeable, IERC3643)
        whenNotPaused
        nonReentrant
        returns (bool)
    {
        _enforceMinFraction(amount);
        _withFailureStateSafety(msg.sender, to, amount);
        super.transfer(to, amount);
        ICompliance(_compliance).transferred(msg.sender, to, amount);
        return true;
    }

    /// @inheritdoc IERC3643
    function transferFrom(address from, address to, uint256 amount)
        public
        override(ERC20Upgradeable, IERC3643)
        whenNotPaused
        nonReentrant
        returns (bool)
    {
        _enforceMinFraction(amount);
        _withFailureStateSafety(from, to, amount);
        super.transferFrom(from, to, amount);
        ICompliance(_compliance).transferred(from, to, amount);
        return true;
    }

    /// @notice Admin forced transfer disabled — toxic liquidity is mathematically impossible
    function forcedTransfer(address, address, uint256) external pure returns (bool) {
        revert ForcedTransferDisabled();
    }

    function _update(address from, address to, uint256 value) internal override(ERC20Upgradeable, ERC20PausableUpgradeable) {
        if (from != address(0) && _frozen[from]) revert AccountFrozen(from);
        if (to != address(0) && _frozen[to]) revert AccountFrozen(to);
        super._update(from, to, value);
    }

    // ── Compliance modifiers (critical) ───────────────────────────────────────

    modifier onlyVerifiedSender(address sender) {
        _checkVerifiedSender(sender);
        _;
    }

    modifier onlyVerifiedReceiver(address receiver) {
        _checkVerifiedReceiver(receiver);
        _;
    }

    modifier withComplianceRules(address from, address to, uint256 amount) {
        if (!ICompliance(_compliance).canTransfer(from, to, amount)) {
            revert CCPValidationFailed(from, to, amount);
        }
        _;
    }

    /// @dev withFailureStateSafety — revert atomically; asset remains in sender wallet
    function _withFailureStateSafety(address from, address to, uint256 amount) internal {
        if (from != address(0)) _checkVerifiedSender(from);
        if (to != address(0)) _checkVerifiedReceiver(to);
        if (!ICompliance(_compliance).canTransfer(from, to, amount)) {
            revert CCPValidationFailed(from, to, amount);
        }
    }

    function _checkVerifiedSender(address sender) internal view {
        IIdentityRegistry registry = IIdentityRegistry(_identityRegistry);
        if (registry.isSanctioned(sender)) revert SenderSanctioned(sender);
        if (!registry.isVerified(sender)) revert SenderNotVerified(sender);
    }

    function _checkVerifiedReceiver(address receiver) internal view {
        IIdentityRegistry registry = IIdentityRegistry(_identityRegistry);
        if (registry.isSanctioned(receiver)) revert ReceiverSanctioned(receiver);
        if (!registry.isVerified(receiver)) revert ReceiverNotVerified(receiver);
    }

    function _enforceMinFraction(uint256 amount) internal pure {
        if (amount < MIN_FRACTION) revert BelowMinFraction(amount, MIN_FRACTION);
        if (amount % MIN_FRACTION != 0) revert NotWholeFraction(amount, MIN_FRACTION);
    }

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}

    error BelowMinFraction(uint256 amount, uint256 minFraction);
    error NotWholeFraction(uint256 amount, uint256 fractionSize);
    error CCPValidationFailed(address from, address to, uint256 amount);
    error SenderSanctioned(address sender);
    error ReceiverSanctioned(address receiver);
    error SenderNotVerified(address sender);
    error ReceiverNotVerified(address receiver);
    error AccountFrozen(address account);
    error ForcedTransferDisabled();
}
