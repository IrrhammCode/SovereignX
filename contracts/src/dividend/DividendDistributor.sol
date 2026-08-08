// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IIdentityRegistry} from "../interfaces/IIdentityRegistry.sol";

/// @title DividendDistributor — CVA stablecoin payouts to verified CVI wallets only
/// @dev Dividends distributed exclusively via Cleanverse Verified Assets (CVA / A-Token)
contract DividendDistributor is Initializable, AccessControlUpgradeable, ReentrancyGuardUpgradeable, UUPSUpgradeable {
    using SafeERC20 for IERC20;

    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    IERC20 public cvaToken;
    address public identityRegistry;
    address public sovxToken;

    uint256 public totalDistributed;
    mapping(address => uint256) public claimedByWallet;
    mapping(uint256 => bytes32) public distributionRoot;

    event DividendDeposited(address indexed depositor, uint256 amount);
    event DividendDistributed(uint256 indexed epoch, address indexed recipient, uint256 amount);
    event BatchDistributed(uint256 indexed epoch, uint256 recipientCount, uint256 totalAmount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address admin,
        address cvaToken_,
        address identityRegistry_,
        address sovxToken_
    ) external initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DISTRIBUTOR_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
        cvaToken = IERC20(cvaToken_);
        identityRegistry = identityRegistry_;
        sovxToken = sovxToken_;
    }

    function depositCVADividends(uint256 amount) external onlyRole(DISTRIBUTOR_ROLE) nonReentrant {
        cvaToken.safeTransferFrom(msg.sender, address(this), amount);
        emit DividendDeposited(msg.sender, amount);
    }

    /// @notice Distribute CVA dividends to verified CVI holders
    function distributeDividends(uint256 epoch, address[] calldata recipients, uint256[] calldata amounts)
        external
        onlyRole(DISTRIBUTOR_ROLE)
        nonReentrant
    {
        if (recipients.length != amounts.length) revert LengthMismatch();
        IIdentityRegistry registry = IIdentityRegistry(identityRegistry);

        uint256 batchTotal;
        for (uint256 i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            uint256 amount = amounts[i];
            if (amount == 0) continue;

            if (!registry.isVerified(recipient)) revert RecipientNotVerified(recipient);
            if (registry.isSanctioned(recipient)) revert RecipientSanctioned(recipient);

            cvaToken.safeTransfer(recipient, amount);
            claimedByWallet[recipient] += amount;
            batchTotal += amount;
            emit DividendDistributed(epoch, recipient, amount);
        }

        totalDistributed += batchTotal;
        distributionRoot[epoch] = keccak256(abi.encodePacked(epoch, batchTotal, block.timestamp));
        emit BatchDistributed(epoch, recipients.length, batchTotal);
    }

    function cvaBalance() external view returns (uint256) {
        return cvaToken.balanceOf(address(this));
    }

    function _authorizeUpgrade(address) internal override onlyRole(UPGRADER_ROLE) {}

    error LengthMismatch();
    error RecipientNotVerified(address recipient);
    error RecipientSanctioned(address recipient);
}
