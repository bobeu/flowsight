// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CuratorStaking
 * @dev Staking contract for FlowSight Curators
 * @notice Allows users to stake FLOW tokens to become Curators
 * @notice Implements slashing mechanism for malicious or inaccurate data tagging
 * 
 * Key Features:
 * - Initial minimum staking requirement: 10,000 FLOW
 * - Slashing mechanism for bad actors (5% of staked amount)
 * - Reward distribution from API revenue
 * - Governance voting rights based on stake
 */
contract CuratorStaking is Ownable, ReentrancyGuard, Pausable {
    /// @dev Reference to FLOW token contract
    IERC20 public immutable flowToken;
    
    /// @dev Minimum amount required to become a Curator (defaults to 10,000 FLOW)
    /// @notice Can be updated by owner via setMinStake function
    uint256 public MIN_STAKE = 10_000 * 10**18;
    
    /// @dev Slashing percentage in basis points (default: 500 = 5%)
    uint256 public SLASH_PERCENTAGE = 500;
    
    /// @dev Get basis points denominator (10000 = 100%)
    function BASIS_POINTS() internal pure returns (uint256) {
        return 10_000;
    }
    
    /// @dev Struct to store curator information
    struct CuratorInfo {
        uint256 stakedAmount;      // Amount of FLOW staked
        uint256 stakedAt;          // Timestamp when staking started
        bool isActive;              // Whether curator is currently active
        uint256 totalSlashCount;   // Number of times slashed
        uint256 totalRewards;       // Total rewards earned
    }
    
    /// @dev Mapping from curator address to their info
    mapping(address => CuratorInfo) public curators;
    
    /// @dev Total amount staked across all curators
    uint256 public totalStaked;
    
    /// @dev Total amount slashed (burned)
    uint256 public totalSlashed;
    
    /// @dev Reward pool for distribution
    uint256 public rewardPool;
    
    /// @dev List of all curator addresses
    address[] public curatorList;
    
    /// @dev Mapping to check if address is in curator list
    mapping(address => bool) public isInCuratorList;
    
    /**
     * @dev Emitted when a user stakes FLOW tokens
     * @param curator Address of the curator
     * @param amount Amount staked
     */
    event Staked(address indexed curator, uint256 amount);
    
    /**
     * @dev Emitted when a curator unstakes
     * @param curator Address of the curator
     * @param amount Amount unstaked
     */
    event Unstaked(address indexed curator, uint256 amount);
    
    /**
     * @dev Emitted when a curator is slashed
     * @param curator Address of the curator
     * @param amount Amount slashed (burned)
     * @param reason Reason for slashing
     */
    event Slashed(address indexed curator, uint256 amount, string reason);
    
    /**
     * @dev Emitted when rewards are distributed
     * @param curator Address of the curator
     * @param amount Amount of rewards distributed
     */
    event RewardsDistributed(address indexed curator, uint256 amount);
    
    /**
     * @dev Emitted when reward pool is funded
     * @param amount Amount added to reward pool
     */
    event RewardPoolFunded(uint256 amount);
    
    /**
     * @dev Emitted when minimum stake is updated
     * @param oldMinStake Previous minimum stake amount
     * @param newMinStake New minimum stake amount
     */
    event MinStakeUpdated(uint256 oldMinStake, uint256 newMinStake);
    
    /**
     * @dev Emitted when slash percentage is updated
     * @param oldSlashPercentage Previous slash percentage
     * @param newSlashPercentage New slash percentage
     */
    event SlashPercentageUpdated(uint256 oldSlashPercentage, uint256 newSlashPercentage);
    
    /**
     * @dev Emitted when a curator is reported
     * @param reportId Report ID
     * @param reporter Address of the reporter
     * @param curator Address of the reported curator
     * @param proposalId Governance proposal ID created
     * @param reporterStake Amount staked by reporter
     * @param reason Reason for reporting
     */
    event CuratorReported(
        uint256 indexed reportId,
        address indexed reporter,
        address indexed curator,
        uint256 proposalId,
        uint256 reporterStake,
        string reason
    );
    
    /**
     * @dev Emitted when a report is resolved
     * @param reportId Report ID
     * @param resolution Resolution type (PENALIZE or CLEAR)
     * @param curatorSlashAmount Amount slashed from curator (if penalized)
     * @param reporterSlashAmount Amount slashed from reporter (if cleared)
     */
    event ReportResolved(
        uint256 indexed reportId,
        Resolution resolution,
        uint256 curatorSlashAmount,
        uint256 reporterSlashAmount
    );
    
    /// @dev Resolution types for reports
    enum Resolution {
        PENALIZE,  // Curator is penalized, reporter gets stake back
        CLEAR      // Curator is cleared, reporter is slashed
    }
    
    /// @dev Struct to store report information
    struct Report {
        uint256 reportId;
        address reporter;
        address curator;
        uint256 proposalId;
        uint256 reporterStake;
        string reason;
        bool resolved;
        uint256 reportedAt;
    }
    
    /// @dev Mapping from report ID to Report
    mapping(uint256 => Report) public reports;
    
    /// @dev Mapping from curator address to active report ID (0 if no active report)
    mapping(address => uint256) public activeReport;
    
    /// @dev Mapping from reporter address to their staked amount for reporting
    mapping(address => uint256) public reporterStakes;
    
    /// @dev Total number of reports (starts at 1 to avoid ID 0)
    uint256 public reportCount = 1;
    
    /// @dev Reference to Governance contract
    address public governance;
    
    /**
     * @dev Constructor
     * @param _flowToken Address of the FLOW token contract
     * @param _governance Address of the Governance contract (will be owner)
     */
    constructor(address _flowToken, address _governance) Ownable(_governance) {
        if (_flowToken == address(0)) revert InvalidTokenAddress();
        if (_governance == address(0)) revert InvalidGovernanceAddress();
        flowToken = IERC20(_flowToken);
        governance = _governance;
    }
    
    /// @dev Custom errors for gas optimization
    error InvalidTokenAddress();
    error InvalidGovernanceAddress();
    error AmountBelowMinimum();
    error TransferFailed();
    error NotACurator();
    error InvalidAmount();
    error InsufficientStakedAmount();
    error WouldFallBelowMinimumStake();
    error NotAnActiveCurator();
    error NoStakeToSlash();
    error InvalidSlashPercentage();
    error InsufficientRewardPool();
    error RewardTransferFailed();
    error MinStakeMustBeGreaterThanZero();
    error CuratorNotReported();
    error ReportAlreadyResolved();
    error InsufficientBalanceForReporting();
    error CuratorAlreadyReported();
    error InvalidProposalId();
    error InvalidResolution();
    error CannotReportYourself();
    
    /**
     * @dev Stake FLOW tokens to become a Curator
     * @param amount Amount of FLOW tokens to stake (must be >= MIN_STAKE)
     * @notice If already a curator, adds to existing stake
     * @notice Cannot stake if curator has an active report
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        address sender = _msgSender();
        CuratorInfo storage curator = curators[sender];
        
        // If not an active curator, must stake at least MIN_STAKE
        if (!curator.isActive && amount < MIN_STAKE) {
            revert AmountBelowMinimum();
        }
        
        // Check if curator has active report (cannot add stake while reported)
        if (activeReport[sender] != 0) {
            revert CuratorAlreadyReported();
        }
        
        if (!flowToken.transferFrom(sender, address(this), amount)) {
            revert TransferFailed();
        }
        
        if(!curator.isActive) {
            curator.isActive = true;
            curator.stakedAt = block.timestamp;
            if(!isInCuratorList[sender]) {
                curatorList.push(sender);
                isInCuratorList[sender] = true;
            }
        }
        
        unchecked {
            curator.stakedAmount += amount;
            totalStaked += amount;
        }
        
        emit Staked(sender, amount);
    }
    
    /**
     * @dev Unstake FLOW tokens (only if not reported)
     * @param amount Amount to unstake
     * @notice Curator must maintain minimum stake or unstake all
     * @notice Cannot unstake if curator has an active report
     */
    function unstake(uint256 amount) external nonReentrant whenNotPaused {
        address sender = _msgSender();
        CuratorInfo storage curator = curators[sender];
        
        if (!curator.isActive) revert NotACurator();
        if (amount == 0) revert InvalidAmount();
        if (amount > curator.stakedAmount) revert InsufficientStakedAmount();
        
        // Cannot unstake if there's an active report
        if (activeReport[sender] != 0) {
            revert CuratorAlreadyReported();
        }
        
        uint256 remainingStake = curator.stakedAmount - amount;
        
        // If unstaking all, deactivate curator
        if(remainingStake == 0) {
            curator.isActive = false;
        } else {
            // Must maintain minimum stake
            if (remainingStake < MIN_STAKE) {
                revert WouldFallBelowMinimumStake();
            }
        }
        
        curator.stakedAmount = remainingStake;
        
        unchecked {
            totalStaked -= amount;
        }
        
        if (!flowToken.transfer(sender, amount)) {
            revert TransferFailed();
        }
        
        emit Unstaked(sender, amount);
    }
    
    /**
     * @dev Distribute rewards to a curator
     * @param curator Address of the curator
     * @param amount Amount of rewards to distribute
     * @notice Only owner (governance) can distribute rewards
     */
    function distributeRewards(address curator, uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        if (amount > rewardPool) revert InsufficientRewardPool();
        if (!curators[curator].isActive) revert NotAnActiveCurator();
        
        unchecked {
            rewardPool -= amount;
            curators[curator].totalRewards += amount;
        }
        
        if (!flowToken.transfer(curator, amount)) {
            revert RewardTransferFailed();
        }
        
        emit RewardsDistributed(curator, amount);
    }
    
    /**
     * @dev Distribute rewards to multiple curators
     * @param curatorsArray Array of curator addresses
     * @param amounts Array of reward amounts (must match curatorsArray length)
     * @notice Only owner (governance) can distribute rewards
     * @notice Arrays must have the same length
     */
    function distributeRewardsBatch(
        address[] calldata curatorsArray,
        uint256[] calldata amounts
    ) external onlyOwner {
        if (curatorsArray.length != amounts.length) {
            revert InvalidAmount(); // Reuse error for array length mismatch
        }
        if (curatorsArray.length == 0) {
            revert InvalidAmount();
        }
        
        uint256 totalAmount = 0;
        
        // Calculate total amount and validate
        for (uint256 i = 0; i < curatorsArray.length; i++) {
            if (amounts[i] == 0) revert InvalidAmount();
            if (!curators[curatorsArray[i]].isActive) revert NotAnActiveCurator();
            unchecked {
                totalAmount += amounts[i];
            }
        }
        
        if (totalAmount > rewardPool) revert InsufficientRewardPool();
        
        // Distribute rewards
        for (uint256 i = 0; i < curatorsArray.length; i++) {
            address curator = curatorsArray[i];
            uint256 amount = amounts[i];
            
            unchecked {
                rewardPool -= amount;
                curators[curator].totalRewards += amount;
            }
            
            if (!flowToken.transfer(curator, amount)) {
                revert RewardTransferFailed();
            }
            
            emit RewardsDistributed(curator, amount);
        }
    }
    
    /**
     * @dev Fund the reward pool (from API revenue)
     * @param amount Amount to add to reward pool
     * @notice Only owner (governance) can fund the pool
     */
    function fundRewardPool(uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        if (!flowToken.transferFrom(_msgSender(), address(this), amount)) {
            revert TransferFailed();
        }
        
        unchecked {
            rewardPool += amount;
        }
        
        emit RewardPoolFunded(amount);
    }
    
    /**
     * @dev Get curator information
     * @param curator Address of the curator
     * @return CuratorInfo struct with all curator data
     */
    function getCuratorInfo(address curator) external view returns (CuratorInfo memory) {
        return curators[curator];
    }
    
    /**
     * @dev Get total number of curators
     * @return Number of curators
     */
    function getCuratorCount() external view returns (uint256) {
        return curatorList.length;
    }
    
    /**
     * @dev Get list of all curator addresses
     * @return Array of curator addresses
     */
    function getAllCurators() external view returns (address[] memory) {
        return curatorList;
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
    
    /**
     * @dev Set the minimum stake amount required to become a Curator
     * @param newMinStake New minimum stake amount (must be > 0)
     * @notice Only owner (governance) can update this value
     * @notice Existing curators are not affected, but new stakers must meet the new minimum
     */
    function setMinStake(uint256 newMinStake) external onlyOwner {
        if (newMinStake == 0) revert MinStakeMustBeGreaterThanZero();
        
        uint256 oldMinStake = MIN_STAKE;
        MIN_STAKE = newMinStake;
        
        emit MinStakeUpdated(oldMinStake, newMinStake);
    }
    
    /**
     * @dev Set the slash percentage
     * @param newSlashPercentage New slash percentage in basis points (e.g., 500 = 5%)
     * @notice Only owner (governance) can update this value
     * @notice Must be <= 10000 (100%)
     */
    function setSlashPercentage(uint256 newSlashPercentage) external onlyOwner {
        if (newSlashPercentage > BASIS_POINTS()) {
            revert InvalidSlashPercentage();
        }
        
        uint256 oldSlashPercentage = SLASH_PERCENTAGE;
        SLASH_PERCENTAGE = newSlashPercentage;
        
        emit SlashPercentageUpdated(oldSlashPercentage, newSlashPercentage);
    }
    
    /**
     * @dev Report a curator for malicious or inaccurate tagging
     * @param curator Address of the curator to report
     * @param reason Reason for reporting
     * @notice Reporter must stake at least 1/4 of MIN_STAKE
     * @notice Creates a proposal on Governance contract
     * @notice Prevents curator from unstaking until resolved
     * @return reportId The ID of the created report
     * @return proposalId The ID of the governance proposal created
     */
    function reportCurator(
        address curator,
        string calldata reason
    ) external nonReentrant whenNotPaused returns (uint256 reportId, uint256 proposalId) {
        if (curator == address(0)) revert InvalidAmount();
        if (curator == _msgSender()) revert CannotReportYourself();
        if (governance == address(0)) revert InvalidGovernanceAddress(); // Governance must be set
        if (!curators[curator].isActive) revert NotAnActiveCurator();
        if (activeReport[curator] != 0) revert CuratorAlreadyReported();
        
        // Calculate required stake: 1/4 of MIN_STAKE
        uint256 requiredStake = MIN_STAKE / 4;
        if (requiredStake == 0) {
            requiredStake = 1; // Minimum 1 wei
        }
        
        // Check reporter has sufficient balance
        if (flowToken.balanceOf(_msgSender()) < requiredStake) {
            revert InsufficientBalanceForReporting();
        }
        
        // Transfer and stake the reporter's tokens
        if (!flowToken.transferFrom(_msgSender(), address(this), requiredStake)) {
            revert TransferFailed();
        }
        
        unchecked {
            reporterStakes[_msgSender()] += requiredStake;
            totalStaked += requiredStake;
        }
        
        // Create report
        reportId = reportCount++;
        reports[reportId] = Report({
            reportId: reportId,
            reporter: _msgSender(),
            curator: curator,
            proposalId: 0, // Will be set after governance proposal creation
            reporterStake: requiredStake,
            reason: reason,
            resolved: false,
            reportedAt: block.timestamp
        });
        
        // Set active report for curator (prevents unstaking)
        activeReport[curator] = reportId;
        
        // Create proposal on Governance contract
        if (governance != address(0)) {
            // Call governance contract directly using low-level call
            bytes memory callData = abi.encodeWithSignature(
                "createCuratorReportProposal(address,address,string,uint256)",
                curator,
                _msgSender(),
                reason,
                reportId
            );
            
            (bool success, bytes memory returnData) = governance.call(callData);
            if (success && returnData.length > 0) {
                proposalId = abi.decode(returnData, (uint256));
                reports[reportId].proposalId = proposalId;
            } else {
                // If governance call fails, proposalId remains 0
                // Report is still created and curator is blocked from unstaking
                proposalId = 0;
            }
        } else {
            proposalId = 0;
        }
        
        emit CuratorReported(reportId, _msgSender(), curator, proposalId, requiredStake, reason);
        
        return (reportId, proposalId);
    }
    
    /**
     * @dev Resolve a report based on governance decision
     * @param reportId Report ID
     * @param resolution Resolution type (PENALIZE or CLEAR)
     * @notice Only owner (governance) can resolve reports
     * @notice If PENALIZE: curator is slashed, reporter gets stake back
     * @notice If CLEAR: curator is cleared, reporter is slashed
     */
    function resolveReport(uint256 reportId, Resolution resolution) external onlyOwner {
        Report storage report = reports[reportId];
        if (report.reportId == 0) revert CuratorNotReported();
        if (report.resolved) revert ReportAlreadyResolved();
        
        report.resolved = true;
        address curator = report.curator;
        address reporter = report.reporter;
        uint256 reporterStake = report.reporterStake;
        
        // Clear active report
        activeReport[curator] = 0;
        
        uint256 curatorSlashAmount = 0;
        uint256 reporterSlashAmount = 0;
        
        if (resolution == Resolution.PENALIZE) {
            // Slash curator
            CuratorInfo storage curatorInfo = curators[curator];
            if (curatorInfo.isActive && curatorInfo.stakedAmount > 0) {
                curatorSlashAmount = (curatorInfo.stakedAmount * SLASH_PERCENTAGE) / BASIS_POINTS();
                if (curatorSlashAmount > curatorInfo.stakedAmount) {
                    curatorSlashAmount = curatorInfo.stakedAmount;
                }
                
                unchecked {
                    curatorInfo.stakedAmount -= curatorSlashAmount;
                    curatorInfo.totalSlashCount += 1;
                    totalStaked -= curatorSlashAmount;
                    totalSlashed += curatorSlashAmount;
                }
                
                ERC20Burnable(address(flowToken)).burn(curatorSlashAmount);
                
                if (curatorInfo.stakedAmount < MIN_STAKE) {
                    curatorInfo.isActive = false;
                }
                
                // Emit Slashed event for consistency
                emit Slashed(curator, curatorSlashAmount, report.reason);
            }
            
            // Return reporter's stake
            unchecked {
                reporterStakes[reporter] -= reporterStake;
                totalStaked -= reporterStake;
            }
            
            if (!flowToken.transfer(reporter, reporterStake)) {
                revert TransferFailed();
            }
            
        } else if (resolution == Resolution.CLEAR) {
            // Slash reporter
            unchecked {
                reporterStakes[reporter] -= reporterStake;
                totalStaked -= reporterStake;
                totalSlashed += reporterStake;
            }
            
            ERC20Burnable(address(flowToken)).burn(reporterStake);
            reporterSlashAmount = reporterStake;
        } else {
            revert InvalidResolution();
        }
        
        emit ReportResolved(reportId, resolution, curatorSlashAmount, reporterSlashAmount);
    }
    
    /**
     * @dev Get report information
     * @param reportId Report ID
     * @return Report struct with all report data
     */
    function getReport(uint256 reportId) external view returns (Report memory) {
        return reports[reportId];
    }
    
    /**
     * @dev Get active report ID for a curator
     * @param curator Curator address
     * @return Active report ID (0 if none)
     */
    function getActiveReport(address curator) external view returns (uint256) {
        return activeReport[curator];
    }
    
    /**
     * @dev Get reporter's total staked amount for reporting
     * @param reporter Reporter address
     * @return Total staked amount
     */
    function getReporterStake(address reporter) external view returns (uint256) {
        return reporterStakes[reporter];
    }
    
    /**
     * @dev Set governance contract address
     * @param _governance Address of the Governance contract
     * @notice Only owner (governance) can update this
     */
    function setGovernance(address _governance) external onlyOwner {
        if (_governance == address(0)) revert InvalidGovernanceAddress();
        governance = _governance;
    }
}

