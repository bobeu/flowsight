// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Governance
 * @dev Governance contract for FlowSight platform
 * @notice Allows $FLOW token holders to vote on key platform decisions
 * @notice Voting power is proportional to token holdings
 * 
 * Key Features:
 * - Create proposals for platform decisions
 * - Vote with $FLOW tokens (weighted by holdings)
 * - Execute proposals after voting period
 * - Snapshot-based voting (no gas costs for voting)
 */
contract Governance is Ownable, ReentrancyGuard, Pausable {
    /// @dev Reference to FLOW token contract
    IERC20 public immutable flowToken;
    
    /// @dev Minimum voting period (e.g., 3 days)
    uint256 public constant MIN_VOTING_PERIOD = 3 days;
    
    /// @dev Minimum proposal threshold (e.g., 10,000 FLOW)
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 10_000 * 10**18;
    
    /// @dev Proposal states
    enum ProposalState {
        Pending,    // Proposal created, voting not started
        Active,     // Voting is active
        Succeeded,  // Proposal passed
        Defeated,   // Proposal failed
        Executed    // Proposal executed
    }
    
    /// @dev Proposal types
    enum ProposalType {
        GENERAL,        // General governance proposal
        CURATOR_REPORT  // Curator reporting proposal
    }
    
    /// @dev Struct to store proposal information
    struct Proposal {
        uint256 id;                 // Proposal ID
        address proposer;           // Address that created the proposal
        ProposalType proposalType;  // Type of proposal
        string title;               // Proposal title
        string description;        // Proposal description
        uint256 startBlock;         // Block when voting starts
        uint256 endBlock;           // Block when voting ends
        uint256 forVotes;           // Total votes for
        uint256 againstVotes;       // Total votes against
        ProposalState state;        // Current state
        bool executed;              // Whether proposal has been executed
        address targetContract;     // Target contract for execution (if applicable)
        bytes callData;             // Calldata for execution (if applicable)
        uint256 reportId;           // Report ID (for CURATOR_REPORT type)
        mapping(address => bool) hasVoted; // Track who has voted
    }
    
    /// @dev Struct to return proposal information (without mapping)
    struct ProposalInfo {
        uint256 id;                 // Proposal ID
        address proposer;           // Address that created the proposal
        ProposalType proposalType;  // Type of proposal
        string title;               // Proposal title
        string description;        // Proposal description
        uint256 startBlock;         // Block when voting starts
        uint256 endBlock;           // Block when voting ends
        uint256 forVotes;           // Total votes for
        uint256 againstVotes;       // Total votes against
        ProposalState state;        // Current state
        bool executed;              // Whether proposal has been executed
        address targetContract;     // Target contract for execution
        bytes callData;             // Calldata for execution
        uint256 reportId;           // Report ID (for CURATOR_REPORT type)
    }
    
    /// @dev Mapping from proposal ID to Proposal
    mapping(uint256 => Proposal) public proposals;
    
    /// @dev Total number of proposals
    uint256 public proposalCount;
    
    /// @dev List of all proposal IDs
    uint256[] public proposalIds;
    
    /// @dev Reference to CuratorStaking contract
    address public curatorStaking;
    
    /// @dev Reference to FLOWToken contract
    address public flowTokenContract;
    
    /// @dev Reference to WhaleAlertBidding contract
    address public whaleAlertBidding;
    
    /// @dev Custom errors
    error InsufficientTokensToCreateProposal();
    error VotingPeriodTooShort();
    error ProposalNotSucceeded();
    error AlreadyExecuted();
    error InvalidContractAddress();
    error ExecutionFailed();
    error InvalidProposalId();
    error ProposalNotActive();
    error VotingPeriodNotActive();
    error AlreadyVoted();
    error NoVotingPower();
    
    /**
     * @dev Emitted when a new proposal is created
     * @param proposalId Proposal ID
     * @param proposer Address that created the proposal
     * @param proposalType Type of proposal
     * @param title Proposal title
     */
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        ProposalType proposalType,
        string title
    );
    
    /**
     * @dev Emitted when a vote is cast
     * @param proposalId Proposal ID
     * @param voter Address that voted
     * @param support Whether vote is for (true) or against (false)
     * @param votes Number of votes (weighted by token holdings)
     */
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votes
    );
    
    /**
     * @dev Emitted when a proposal is executed
     * @param proposalId Proposal ID
     */
    event ProposalExecuted(uint256 indexed proposalId);
    
    /**
     * @dev Constructor
     * @param _flowToken Address of the FLOW token contract
     * @param initialOwner Address that will own the contract
     */
    constructor(address _flowToken, address initialOwner) Ownable(initialOwner) {
        if (_flowToken == address(0)) revert InvalidContractAddress();
        flowToken = IERC20(_flowToken);
    }
    
    /**
     * @dev Create a new proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param votingPeriod Voting period in blocks
     * @param proposalType Type of proposal
     * @param targetContract Target contract address (for execution proposals)
     * @param callData Calldata for execution (for execution proposals)
     * @param reportId Report ID (for CURATOR_REPORT type)
     * @notice Proposer must hold at least MIN_PROPOSAL_THRESHOLD tokens
     */
    function createProposal(
        string memory title,
        string memory description,
        uint256 votingPeriod,
        ProposalType proposalType,
        address targetContract,
        bytes memory callData,
        uint256 reportId
    ) external whenNotPaused returns (uint256) {
        if (flowToken.balanceOf(_msgSender()) < MIN_PROPOSAL_THRESHOLD) {
            revert InsufficientTokensToCreateProposal();
        }
        if (votingPeriod < MIN_VOTING_PERIOD) {
            revert VotingPeriodTooShort();
        }
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.proposer = _msgSender();
        proposal.proposalType = proposalType;
        proposal.title = title;
        proposal.description = description;
        proposal.startBlock = block.number;
        proposal.endBlock = block.number + votingPeriod;
        proposal.state = ProposalState.Active;
        proposal.executed = false;
        proposal.targetContract = targetContract;
        proposal.callData = callData;
        proposal.reportId = reportId;
        
        proposalIds.push(proposalId);
        
        emit ProposalCreated(proposalId, _msgSender(), proposalType, title);
        
        return proposalId;
    }
    
    /**
     * @dev Helper function to convert address to string
     */
    function _addressToString(address addr) internal pure returns (string memory) {
        bytes memory data = abi.encodePacked(addr);
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(2 + data.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < data.length; i++) {
            str[2+i*2] = alphabet[uint256(uint8(data[i] >> 4))];
            str[3+i*2] = alphabet[uint256(uint8(data[i] & 0x0f))];
        }
        return string(str);
    }
    
    /**
     * @dev Create a curator report proposal (only CuratorStaking contract can call)
     * @param curator Address of the reported curator
     * @param reporter Address of the reporter
     * @param reason Reason for reporting
     * @param reportId Report ID from CuratorStaking
     * @return proposalId The created proposal ID
     */
    function createCuratorReportProposal(
        address curator,
        address reporter,
        string memory reason,
        uint256 reportId
    ) external whenNotPaused returns (uint256) {
        // Only CuratorStaking contract can call this function
        if (_msgSender() != curatorStaking) {
            revert InvalidContractAddress(); // Reuse error for unauthorized caller
        }
        
        string memory title = string(abi.encodePacked("Curator Report: ", _addressToString(curator)));
        string memory description = string(abi.encodePacked(
            "Report against curator: ", _addressToString(curator),
            "\nReporter: ", _addressToString(reporter),
            "\nReason: ", reason
        ));
        
        // Inline proposal creation logic to avoid forward reference
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.proposer = curatorStaking; // Set proposer as curatorStaking contract
        proposal.proposalType = ProposalType.CURATOR_REPORT;
        proposal.title = title;
        proposal.description = description;
        proposal.startBlock = block.number;
        proposal.endBlock = block.number + MIN_VOTING_PERIOD;
        proposal.state = ProposalState.Active;
        proposal.executed = false;
        proposal.targetContract = curatorStaking;
        proposal.callData = "";
        proposal.reportId = reportId;
        
        proposalIds.push(proposalId);
        
        emit ProposalCreated(proposalId, curatorStaking, ProposalType.CURATOR_REPORT, title);
        
        return proposalId;
    }
    
    /**
     * @dev Vote on a proposal
     * @param proposalId Proposal ID
     * @param support Whether vote is for (true) or against (false)
     * @notice Voting power is based on token balance at proposal start block
     */
    function vote(uint256 proposalId, bool support) external whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.id != proposalId) revert InvalidProposalId();
        if (proposal.state != ProposalState.Active) revert ProposalNotActive();
        
        if (block.number < proposal.startBlock || block.number > proposal.endBlock) {
            revert VotingPeriodNotActive();
        }
        if (proposal.hasVoted[_msgSender()]) revert AlreadyVoted();
        
        // Get voting power (token balance at proposal start)
        // For simplicity, using current balance. In production, use snapshot
        uint256 votingPower = flowToken.balanceOf(_msgSender());
        if (votingPower == 0) revert NoVotingPower();
        
        proposal.hasVoted[_msgSender()] = true;
        
        if (support) {
            unchecked {
                proposal.forVotes += votingPower;
            }
        } else {
            unchecked {
                proposal.againstVotes += votingPower;
            }
        }
        
        emit VoteCast(proposalId, _msgSender(), support, votingPower);
        
        // Update proposal state if voting period ended
        if (block.number >= proposal.endBlock) {
            _updateProposalState(proposalId);
        }
    }
    
    /**
     * @dev Set contract addresses (only owner)
     */
    function setContractAddresses(
        address _curatorStaking,
        address _flowTokenContract,
        address _whaleAlertBidding
    ) external onlyOwner {
        if (_curatorStaking == address(0) || _flowTokenContract == address(0)) {
            revert InvalidContractAddress();
        }
        curatorStaking = _curatorStaking;
        flowTokenContract = _flowTokenContract;
        whaleAlertBidding = _whaleAlertBidding;
    }
    
    /**
     * @dev Execute a proposal
     * @param proposalId Proposal ID
     * @notice Executes on-chain actions based on proposal type
     */
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.id != proposalId) revert InvalidProposalId();
        if (proposal.state != ProposalState.Succeeded) revert ProposalNotSucceeded();
        if (proposal.executed) revert AlreadyExecuted();
        
        proposal.executed = true;
        proposal.state = ProposalState.Executed;
        
        // Execute based on proposal type
        if (proposal.proposalType == ProposalType.CURATOR_REPORT) {
            // For curator reports, the resolution is handled separately via resolveReport
            // This execution just marks the proposal as executed
        } else if (proposal.targetContract != address(0) && proposal.callData.length > 0) {
            // Execute arbitrary call on target contract
            (bool success, ) = proposal.targetContract.call(proposal.callData);
            if (!success) revert ExecutionFailed();
        }
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Execute owner function on CuratorStaking contract
     * @param functionSelector Function selector
     * @param data Encoded function parameters
     */
    function executeCuratorStakingFunction(
        bytes4 functionSelector,
        bytes memory data
    ) external onlyOwner {
        if (curatorStaking == address(0)) revert InvalidContractAddress();
        
        bytes memory callData = abi.encodePacked(functionSelector, data);
        (bool success, ) = curatorStaking.call(callData);
        if (!success) revert ExecutionFailed();
    }
    
    /**
     * @dev Execute owner function on FLOWToken contract
     * @param functionSelector Function selector
     * @param data Encoded function parameters
     */
    function executeFLOWTokenFunction(
        bytes4 functionSelector,
        bytes memory data
    ) external onlyOwner {
        if (flowTokenContract == address(0)) revert InvalidContractAddress();
        
        bytes memory callData = abi.encodePacked(functionSelector, data);
        (bool success, ) = flowTokenContract.call(callData);
        if (!success) revert ExecutionFailed();
    }
    
    /**
     * @dev Execute owner function on WhaleAlertBidding contract
     * @param functionSelector Function selector
     * @param data Encoded function parameters
     */
    function executeWhaleAlertBiddingFunction(
        bytes4 functionSelector,
        bytes memory data
    ) external onlyOwner {
        if (whaleAlertBidding == address(0)) revert InvalidContractAddress();
        
        bytes memory callData = abi.encodePacked(functionSelector, data);
        (bool success, ) = whaleAlertBidding.call(callData);
        if (!success) revert ExecutionFailed();
    }
    
    /**
     * @dev Update proposal state based on votes
     * @param proposalId Proposal ID
     */
    function _updateProposalState(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        
        if (block.number < proposal.endBlock) {
            return; // Voting still active
        }
        
        if (proposal.forVotes > proposal.againstVotes) {
            proposal.state = ProposalState.Succeeded;
        } else {
            proposal.state = ProposalState.Defeated;
        }
    }
    
    /**
     * @dev Get proposal details
     * @param proposalId Proposal ID
     * @return proposalInfo Struct containing all proposal information
     */
    function getProposal(uint256 proposalId) external view returns (ProposalInfo memory proposalInfo) {
        Proposal storage proposal = proposals[proposalId];
        
        proposalInfo = ProposalInfo({
            id: proposal.id,
            proposer: proposal.proposer,
            proposalType: proposal.proposalType,
            title: proposal.title,
            description: proposal.description,
            startBlock: proposal.startBlock,
            endBlock: proposal.endBlock,
            forVotes: proposal.forVotes,
            againstVotes: proposal.againstVotes,
            state: proposal.state,
            executed: proposal.executed,
            targetContract: proposal.targetContract,
            callData: proposal.callData,
            reportId: proposal.reportId
        });
    }
    
    /**
     * @dev Get all proposal IDs
     * @return Array of all proposal IDs
     */
    function getAllProposals() external view returns (uint256[] memory) {
        return proposalIds;
    }
    
    /**
     * @dev Check if user has voted on a proposal
     * @param proposalId Proposal ID
     * @param voter Voter address
     * @return Whether the voter has voted
     */
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
    
    /**
     * @dev Pause contract (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}

