// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FlowsightVesting
 * @dev Vesting contract for Team & Advisors allocation (150,000,000 FLOW)
 * @notice Implements a 12-month cliff followed by 36-month linear vesting
 * @notice Pull-based withdrawal mechanism for gas efficiency
 * 
 * Vesting Schedule:
 * - Cliff Period: 12 months (365 days) from TGE
 * - Vesting Duration: 36 months (1,095 days) after cliff
 * - Release: Linear, second-by-second after cliff
 */
contract FlowsightVesting is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @dev Reference to FLOW token contract
    IERC20 public immutable flowToken;
    
    /// @dev Total amount allocated for vesting (150,000,000 FLOW)
    uint256 public immutable totalAllocation;
    
    /// @dev Token Generation Event timestamp
    uint256 public immutable tgeTimestamp;
    
    /// @dev Cliff period in seconds (12 months = 365 days)
    uint256 public constant CLIFF_PERIOD = 365 days;
    
    /// @dev Vesting duration in seconds (36 months = 1,095 days)
    uint256 public constant VESTING_DURATION = 1095 days;
    
    /// @dev Total amount already released
    uint256 private _released;

    /// @dev Emitted when tokens are released
    /// @param beneficiary Address receiving the tokens
    /// @param amount Amount of tokens released
    event TokensReleased(address indexed beneficiary, uint256 amount);

    /// @dev Emitted when vesting contract is initialized
    /// @param flowTokenAddress Address of FLOW token contract
    /// @param totalAllocation Total amount allocated for vesting
    /// @param tgeTimestamp Token Generation Event timestamp
    event VestingInitialized(
        address indexed flowTokenAddress,
        uint256 totalAllocation,
        uint256 tgeTimestamp
    );

    /// @dev Custom errors for gas efficiency
    error VestingNotStarted();
    error CliffNotReached();
    error NoTokensToRelease();
    error InvalidAddress();
    error InvalidAmount();

    /**
     * @dev Constructor
     * @param _flowToken Address of the FLOW token contract
     * @param _totalAllocation Total amount allocated for vesting (150,000,000 FLOW)
     * @param _tgeTimestamp Token Generation Event timestamp
     */
    constructor(
        address _flowToken,
        uint256 _totalAllocation,
        uint256 _tgeTimestamp
    ) {
        if (_flowToken == address(0)) revert InvalidAddress();
        if (_totalAllocation == 0) revert InvalidAmount();
        if (_tgeTimestamp == 0) revert InvalidAmount();

        flowToken = IERC20(_flowToken);
        totalAllocation = _totalAllocation;
        tgeTimestamp = _tgeTimestamp;

        emit VestingInitialized(_flowToken, _totalAllocation, _tgeTimestamp);
    }

    /**
     * @dev Calculate the amount of tokens that can be released at current time
     * @return Amount of tokens that can be released
     */
    function releasable() public view returns (uint256) {
        return vestedAmount(block.timestamp) - _released;
    }

    /**
     * @dev Calculate the total amount of tokens vested at a given timestamp
     * @param timestamp Timestamp to calculate vested amount at
     * @return Total amount of tokens vested at the given timestamp
     */
    function vestedAmount(uint256 timestamp) public view returns (uint256) {
        // Before TGE, nothing is vested
        if (timestamp < tgeTimestamp) {
            return 0;
        }

        // Calculate time since TGE
        uint256 timeSinceTGE = timestamp - tgeTimestamp;

        // If before cliff, nothing is vested
        if (timeSinceTGE < CLIFF_PERIOD) {
            return 0;
        }

        // Calculate time since cliff
        uint256 timeSinceCliff = timeSinceTGE - CLIFF_PERIOD;

        // If vesting period has completed, all tokens are vested
        if (timeSinceCliff >= VESTING_DURATION) {
            return totalAllocation;
        }

        // Calculate linear vesting: (timeSinceCliff * totalAllocation) / VESTING_DURATION
        // Using unchecked for gas optimization (timeSinceCliff < VESTING_DURATION is checked above)
        unchecked {
            return (timeSinceCliff * totalAllocation) / VESTING_DURATION;
        }
    }

    /**
     * @dev Release vested tokens to the contract deployer/beneficiary
     * @notice Pull-based mechanism - beneficiary must call this function
     * @notice Gas-optimized for frequent calls
     */
    function release() external nonReentrant {
        uint256 amount = releasable();
        
        if (amount == 0) revert NoTokensToRelease();

        _released += amount;

        address beneficiary = msg.sender;
        flowToken.safeTransfer(beneficiary, amount);

        emit TokensReleased(beneficiary, amount);
    }

    /**
     * @dev Release vested tokens to a specific beneficiary
     * @param beneficiary Address to receive the tokens
     * @notice Allows releasing to a different address (useful for multi-sig)
     */
    function releaseTo(address beneficiary) external nonReentrant {
        if (beneficiary == address(0)) revert InvalidAddress();

        uint256 amount = releasable();
        
        if (amount == 0) revert NoTokensToRelease();

        _released += amount;

        flowToken.safeTransfer(beneficiary, amount);

        emit TokensReleased(beneficiary, amount);
    }

    /**
     * @dev Get the amount of tokens already released
     * @return Amount of tokens released so far
     */
    function released() external view returns (uint256) {
        return _released;
    }

    /**
     * @dev Get the amount of tokens still locked
     * @return Amount of tokens still locked in the contract
     */
    function locked() external view returns (uint256) {
        return totalAllocation - _released;
    }

    /**
     * @dev Get vesting status information
     * @return vested Total amount vested at current time
     * @return releasedAmount Total amount already released
     * @return releasableAmount Amount that can be released now
     * @return lockedAmount Amount still locked
     * @return cliffReached Whether the cliff period has been reached
     * @return vestingComplete Whether the vesting period has completed
     */
    function getVestingStatus() external view returns (
        uint256 vested,
        uint256 releasedAmount,
        uint256 releasableAmount,
        uint256 lockedAmount,
        bool cliffReached,
        bool vestingComplete
    ) {
        uint256 currentTime = block.timestamp;
        vested = vestedAmount(currentTime);
        releasedAmount = _released;
        releasableAmount = vested > releasedAmount ? vested - releasedAmount : 0;
        lockedAmount = totalAllocation > releasedAmount ? totalAllocation - releasedAmount : 0;
        cliffReached = false;
        vestingComplete = false;
        
        if (currentTime >= tgeTimestamp) {
            uint256 timeSinceTGE = currentTime - tgeTimestamp;
            cliffReached = timeSinceTGE >= CLIFF_PERIOD;
            
            if (cliffReached) {
                uint256 timeSinceCliff = timeSinceTGE - CLIFF_PERIOD;
                vestingComplete = timeSinceCliff >= VESTING_DURATION;
            }
        }
    }
}

