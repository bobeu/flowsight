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
    
    /// @dev Slashing percentage (5% = 500 basis points)
    uint256 public constant SLASH_PERCENTAGE = 500; // 5%
    
    /// @dev Basis points denominator (10000 = 100%)
    uint256 private constant BASIS_POINTS = 10_000;
    
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
     * @dev Constructor
     * @param _flowToken Address of the FLOW token contract
     * @param initialOwner Address that will own the contract
     */
    constructor(address _flowToken, address initialOwner) Ownable(initialOwner) {
        require(_flowToken != address(0), "CuratorStaking: Invalid token address");
        flowToken = IERC20(_flowToken);
    }
    
    /**
     * @dev Stake FLOW tokens to become a Curator
     * @param amount Amount of FLOW tokens to stake (must be >= MIN_STAKE)
     * @notice If already a curator, adds to existing stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MIN_STAKE, "CuratorStaking: Amount below minimum");
        address sender = _msgSender();
        require(
            flowToken.transferFrom(sender, address(this), amount),
            "CuratorStaking: Transfer failed"
        );
        
        CuratorInfo storage curator = curators[sender];
        
        if(!curator.isActive) {
            curator.isActive = true;
            curator.stakedAt = block.timestamp;
            if(!isInCuratorList[sender]) {
                curatorList.push(sender);
                isInCuratorList[sender] = true;
            }
        }
        
        curator.stakedAmount += amount;
        totalStaked += amount;
        
        emit Staked(sender, amount);
    }
    
    /**
     * @dev Unstake FLOW tokens (only if not recently slashed)
     * @param amount Amount to unstake
     * @notice Curator must maintain minimum stake or unstake all
     */
    function unstake(uint256 amount) external nonReentrant whenNotPaused {
        CuratorInfo storage curator = curators[_msgSender()];
        require(curator.isActive, "CuratorStaking: Not a curator");
        require(amount > 0, "CuratorStaking: Invalid amount");
        require(
            amount <= curator.stakedAmount,
            "CuratorStaking: Insufficient staked amount"
        );
        
        uint256 remainingStake = curator.stakedAmount - amount;
        
        // If unstaking all, deactivate curator
        if(remainingStake == 0) {
            curator.isActive = false;
        } else {
            // Must maintain minimum stake
            require(
                remainingStake >= MIN_STAKE,
                "CuratorStaking: Would fall below minimum stake"
            );
        }
        
        curator.stakedAmount = remainingStake;
        totalStaked -= amount;
        
        require(
            flowToken.transfer(_msgSender(), amount),
            "CuratorStaking: Transfer failed"
        );
        
        emit Unstaked(_msgSender(), amount);
    }
    
    /**
     * @dev Slash a curator for malicious or inaccurate tagging
     * @param curator Address of the curator to slash
     * @param reason Reason for slashing
     * @notice Only owner can slash (in production, we expect this use governance system)
     */
    function slashCurator(address curator, string calldata reason) external onlyOwner {
        CuratorInfo storage curatorInfo = curators[curator];
        require(curatorInfo.isActive, "CuratorStaking: Not an active curator");
        require(curatorInfo.stakedAmount > 0, "CuratorStaking: No stake to slash");
        
        uint256 slashAmount = (curatorInfo.stakedAmount * SLASH_PERCENTAGE) / BASIS_POINTS;
        
        // Ensure we don't slash more than available
        if(slashAmount > curatorInfo.stakedAmount) {
            slashAmount = curatorInfo.stakedAmount;
        }
        
        curatorInfo.stakedAmount -= slashAmount;
        curatorInfo.totalSlashCount += 1;
        totalStaked -= slashAmount;
        totalSlashed += slashAmount;
        
        // Burn the slashed tokens using ERC20Burnable
        // Cast IERC20 to ERC20Burnable to access burn function
        ERC20Burnable(address(flowToken)).burn(slashAmount);
        
        // Deactivate if below minimum
        if(curatorInfo.stakedAmount < MIN_STAKE) {
            curatorInfo.isActive = false;
        }
        
        emit Slashed(curator, slashAmount, reason);
    }
    
    /**
     * @dev Distribute rewards to a curator
     * @param curator Address of the curator
     * @param amount Amount of rewards to distribute
     * @notice Only owner can distribute rewards
     */
    function distributeRewards(address curator, uint256 amount) external onlyOwner {
        require(amount > 0, "CuratorStaking: Invalid amount");
        require(amount <= rewardPool, "CuratorStaking: Insufficient reward pool");
        require(curators[curator].isActive, "CuratorStaking: Not an active curator");
        
        rewardPool -= amount;
        curators[curator].totalRewards += amount;
        
        require(
            flowToken.transfer(curator, amount),
            "CuratorStaking: Reward transfer failed"
        );
        
        emit RewardsDistributed(curator, amount);
    }
    
    /**
     * @dev Fund the reward pool (from API revenue)
     * @param amount Amount to add to reward pool
     * @notice Only owner can fund the pool
     */
    function fundRewardPool(uint256 amount) external onlyOwner {
        require(amount > 0, "CuratorStaking: Invalid amount");
        require(
            flowToken.transferFrom(_msgSender(), address(this), amount),
            "CuratorStaking: Transfer failed"
        );
        
        rewardPool += amount;
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
     * @notice Only owner can update this value
     * @notice Existing curators are not affected, but new stakers must meet the new minimum
     */
    function setMinStake(uint256 newMinStake) external onlyOwner {
        require(newMinStake > 0, "CuratorStaking: Min stake must be greater than 0");
        
        uint256 oldMinStake = MIN_STAKE;
        MIN_STAKE = newMinStake;
        
        emit MinStakeUpdated(oldMinStake, newMinStake);
    }
}

