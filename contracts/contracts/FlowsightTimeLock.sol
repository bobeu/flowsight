// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import { TimelockController } from "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title FlowsightTimeLock
 * @dev Time-lock contract for Ecosystem & DAO Treasury allocation (350,000,000 FLOW)
 * @notice Wraps OpenZeppelin's TimelockController with Flowsight-specific configuration
 * @notice Enforces a 6-month minimum delay for all transactions
 * 
 * Roles:
 * - PROPOSER: Can queue transactions (initially team, transitioning to DAO Governance)
 * - EXECUTOR: Can execute queued transactions after delay
 * - CANCELLER: Can cancel queued transactions before execution
 * 
 * Critical Integration:
 * This contract must become the owner of:
 * - FLOWToken.sol (for pause/unpause, minting control)
 * - Governance.sol (for setting contract addresses)
 */
contract FlowsightTimeLock is TimelockController {
    /// @dev Minimum delay: 6 months (approximately 180 days)
    uint256 public constant MIN_DELAY = 180 days;

    /// @dev Reference to FLOW token contract (for informational purposes)
    address public immutable flowToken;

    /// @dev Emitted when contract is initialized
    /// @param flowTokenAddress Address of FLOW token contract
    /// @param minDelay Minimum delay for transactions
    event TimeLockInitialized(address indexed flowTokenAddress, uint256 minDelay);

    /// @dev Custom errors
    error InvalidDelay();
    error InvalidAddress();

    /**
     * @dev Constructor
     * @param minDelay Minimum delay for transactions (must be >= MIN_DELAY)
     * @param proposers Array of addresses that can propose transactions
     * @param executors Array of addresses that can execute transactions
     * @param admin Address that will have admin role (can grant/revoke roles)
     * @param _flowToken Address of FLOW token contract (for reference)
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin,
        address _flowToken
    ) TimelockController(minDelay, proposers, executors, admin) {
        if (minDelay < MIN_DELAY) revert InvalidDelay();
        if (_flowToken == address(0)) revert InvalidAddress();

        flowToken = _flowToken;

        emit TimeLockInitialized(_flowToken, minDelay);
    }


    /**
     * @dev Queue a transaction to transfer ownership of FLOWToken to this TimeLock
     * @param flowTokenAddress Address of FLOWToken contract
     * @param newOwner Address to transfer ownership to (should be this contract)
     * @notice This should be called after deployment to make TimeLock the owner of FLOWToken
     */
    function queueTransferFLOWTokenOwnership(
        address flowTokenAddress,
        address newOwner
    ) external returns (bytes32) {
        bytes memory callData = abi.encodeWithSignature("transferOwnership(address)", newOwner);
        return this.schedule(flowTokenAddress, 0, callData, bytes32(0), bytes32(0), MIN_DELAY);
    }

    /**
     * @dev Queue a transaction to transfer ownership of Governance to this TimeLock
     * @param governanceAddress Address of Governance contract
     * @param newOwner Address to transfer ownership to (should be this contract)
     * @notice This should be called after deployment to make TimeLock the owner of Governance
     */
    function queueTransferGovernanceOwnership(
        address governanceAddress,
        address newOwner
    ) external returns (bytes32) {
        bytes memory callData = abi.encodeWithSignature("transferOwnership(address)", newOwner);
        return this.schedule(governanceAddress, 0, callData, bytes32(0), bytes32(0), MIN_DELAY);
    }

    /**
     * @dev Queue a transaction to pause FLOWToken
     * @param flowTokenAddress Address of FLOWToken contract
     * @notice Only executable after MIN_DELAY has passed
     */
    function queuePauseFLOWToken(address flowTokenAddress) external returns (bytes32) {
        bytes memory callData = abi.encodeWithSignature("pause()");
        return this.schedule(flowTokenAddress, 0, callData, bytes32(0), bytes32(0), MIN_DELAY);
    }

    /**
     * @dev Queue a transaction to unpause FLOWToken
     * @param flowTokenAddress Address of FLOWToken contract
     * @notice Only executable after MIN_DELAY has passed
     */
    function queueUnpauseFLOWToken(address flowTokenAddress) external returns (bytes32) {
        bytes memory callData = abi.encodeWithSignature("unpause()");
        return this.schedule(flowTokenAddress, 0, callData, bytes32(0), bytes32(0), MIN_DELAY);
    }

    /**
     * @dev Queue a transaction to set contract addresses in Governance
     * @param governanceAddress Address of Governance contract
     * @param curatorStaking Address of CuratorStaking contract
     * @param flowTokenContract Address of FLOWToken contract
     * @param whaleAlertBidding Address of WhaleAlertBidding contract
     * @notice Only executable after MIN_DELAY has passed
     */
    function queueSetGovernanceContractAddresses(
        address governanceAddress,
        address curatorStaking,
        address flowTokenContract,
        address whaleAlertBidding
    ) external returns (bytes32) {
        bytes memory callData = abi.encodeWithSignature(
            "setContractAddresses(address,address,address)",
            curatorStaking,
            flowTokenContract,
            whaleAlertBidding
        );
        return this.schedule(governanceAddress, 0, callData, bytes32(0), bytes32(0), MIN_DELAY);
    }
}

