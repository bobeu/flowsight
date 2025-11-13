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
    
    /// @dev Struct to store proposal information
    struct Proposal {
        uint256 id;                 // Proposal ID
        address proposer;           // Address that created the proposal
        string title;               // Proposal title
        string description;        // Proposal description
        uint256 startBlock;         // Block when voting starts
        uint256 endBlock;           // Block when voting ends
        uint256 forVotes;           // Total votes for
        uint256 againstVotes;       // Total votes against
        ProposalState state;        // Current state
        bool executed;              // Whether proposal has been executed
        mapping(address => bool) hasVoted; // Track who has voted
    }
    
    /// @dev Struct to return proposal information (without mapping)
    struct ProposalInfo {
        uint256 id;                 // Proposal ID
        address proposer;           // Address that created the proposal
        string title;               // Proposal title
        string description;        // Proposal description
        uint256 startBlock;         // Block when voting starts
        uint256 endBlock;           // Block when voting ends
        uint256 forVotes;           // Total votes for
        uint256 againstVotes;       // Total votes against
        ProposalState state;        // Current state
        bool executed;              // Whether proposal has been executed
    }
    
    /// @dev Mapping from proposal ID to Proposal
    mapping(uint256 => Proposal) public proposals;
    
    /// @dev Total number of proposals
    uint256 public proposalCount;
    
    /// @dev List of all proposal IDs
    uint256[] public proposalIds;
    
    /**
     * @dev Emitted when a new proposal is created
     * @param proposalId Proposal ID
     * @param proposer Address that created the proposal
     * @param title Proposal title
     */
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
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
        require(_flowToken != address(0), "Governance: Invalid token address");
        flowToken = IERC20(_flowToken);
    }
    
    /**
     * @dev Create a new proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param votingPeriod Voting period in blocks
     * @notice Proposer must hold at least MIN_PROPOSAL_THRESHOLD tokens
     */
    function createProposal(
        string memory title,
        string memory description,
        uint256 votingPeriod
    ) external whenNotPaused returns (uint256) {
        require(
            flowToken.balanceOf(msg.sender) >= MIN_PROPOSAL_THRESHOLD,
            "Governance: Insufficient tokens to create proposal"
        );
        require(
            votingPeriod >= MIN_VOTING_PERIOD,
            "Governance: Voting period too short"
        );
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.startBlock = block.number;
        proposal.endBlock = block.number + votingPeriod;
        proposal.state = ProposalState.Active;
        proposal.executed = false;
        
        proposalIds.push(proposalId);
        
        emit ProposalCreated(proposalId, msg.sender, title);
        
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
        
        require(
            proposal.state == ProposalState.Active,
            "Governance: Proposal not active"
        );
        require(
            block.number >= proposal.startBlock && block.number <= proposal.endBlock,
            "Governance: Voting period not active"
        );
        require(
            !proposal.hasVoted[msg.sender],
            "Governance: Already voted"
        );
        
        // Get voting power (token balance at proposal start)
        // For simplicity, using current balance. In production, use snapshot
        uint256 votingPower = flowToken.balanceOf(msg.sender);
        require(votingPower > 0, "Governance: No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }
        
        emit VoteCast(proposalId, msg.sender, support, votingPower);
        
        // Update proposal state if voting period ended
        if (block.number >= proposal.endBlock) {
            _updateProposalState(proposalId);
        }
    }
    
    /**
     * @dev Execute a proposal (only owner for MVP)
     * @param proposalId Proposal ID
     * @notice In production, this would execute on-chain actions
     */
    function executeProposal(uint256 proposalId) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        
        require(
            proposal.state == ProposalState.Succeeded,
            "Governance: Proposal not succeeded"
        );
        require(!proposal.executed, "Governance: Already executed");
        
        proposal.executed = true;
        proposal.state = ProposalState.Executed;
        
        // TODO: Execute proposal actions (e.g., update contract parameters)
        
        emit ProposalExecuted(proposalId);
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
            title: proposal.title,
            description: proposal.description,
            startBlock: proposal.startBlock,
            endBlock: proposal.endBlock,
            forVotes: proposal.forVotes,
            againstVotes: proposal.againstVotes,
            state: proposal.state,
            executed: proposal.executed
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

