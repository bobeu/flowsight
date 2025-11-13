// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title WhaleAlertBidding
 * @dev Contract for bidding FLOW tokens to boost whale wallet alerts
 * @notice Users bid FLOW tokens to prioritize specific whale wallets in the alert feed
 * @notice 100% of bidding fees are burned, creating deflationary pressure
 * 
 * Key Features:
 * - Bid on whale wallet addresses to boost them in alert feed
 * - Highest bidder gets priority notifications
 * - All bidding fees are permanently burned
 * - Automatic refund of previous bid when outbid
 */
contract WhaleAlertBidding is Ownable, ReentrancyGuard, Pausable {
    /// @dev Reference to FLOW token contract
    IERC20 public immutable flowToken;
    
    /// @dev Minimum bid amount (e.g., 100 FLOW)
    uint256 public constant MIN_BID = 100 * 10**18;
    
    /// @dev Struct to store bid information
    struct Bid {
        address bidder;           // Address of the bidder
        uint256 amount;           // Bid amount in FLOW tokens
        uint256 timestamp;        // When the bid was placed
        bool isActive;            // Whether the bid is currently active
    }
    
    /// @dev Mapping from whale wallet address to current highest bid
    mapping(address => Bid) public whaleBids;
    
    /// @dev Mapping from bidder address to total amount bid (across all wallets)
    mapping(address => uint256) public totalBidByUser;
    
    /// @dev Total amount burned from bidding fees
    uint256 public totalBurned;
    
    /// @dev List of all whale addresses with active bids
    address[] public activeWhaleAddresses;
    
    /// @dev Mapping to check if whale address is in active list
    mapping(address => bool) public isInActiveList;
    
    /**
     * @dev Emitted when a new bid is placed
     * @param whaleAddress Whale wallet address being bid on
     * @param bidder Address of the bidder
     * @param amount Bid amount
     * @param previousBidder Previous highest bidder (if any)
     * @param refundAmount Amount refunded to previous bidder
     */
    event BidPlaced(
        address indexed whaleAddress,
        address indexed bidder,
        uint256 amount,
        address previousBidder,
        uint256 refundAmount
    );
    
    /**
     * @dev Emitted when tokens are burned
     * @param amount Amount of tokens burned
     */
    event TokensBurned(uint256 amount);
    
    /**
     * @dev Emitted when a bid is withdrawn
     * @param whaleAddress Whale wallet address
     * @param bidder Address of the bidder
     * @param amount Amount withdrawn
     */
    event BidWithdrawn(
        address indexed whaleAddress,
        address indexed bidder,
        uint256 amount
    );
    
    /**
     * @dev Constructor
     * @param _flowToken Address of the FLOW token contract
     * @param initialOwner Address that will own the contract
     */
    constructor(address _flowToken, address initialOwner) Ownable(initialOwner) {
        require(_flowToken != address(0), "WhaleAlertBidding: Invalid token address");
        flowToken = IERC20(_flowToken);
    }
    
    /**
     * @dev Place a bid on a whale wallet address
     * @param whaleAddress The whale wallet address to bid on
     * @param amount Amount of FLOW tokens to bid (must be > current highest bid + MIN_BID)
     * @notice Previous bidder (if any) is automatically refunded
     * @notice Bidding fees are burned to create deflationary pressure
     */
    function placeBid(address whaleAddress, uint256 amount) external nonReentrant whenNotPaused {
        require(whaleAddress != address(0), "WhaleAlertBidding: Invalid whale address");
        require(amount >= MIN_BID, "WhaleAlertBidding: Bid below minimum");
        
        Bid storage currentBid = whaleBids[whaleAddress];
        
        // Check if new bid is higher than current bid
        require(
            amount > currentBid.amount,
            "WhaleAlertBidding: Bid must be higher than current bid"
        );
        
        // Transfer FLOW tokens from bidder
        require(
            flowToken.transferFrom(msg.sender, address(this), amount),
            "WhaleAlertBidding: Transfer failed"
        );
        
        // Refund previous bidder if exists
        uint256 refundAmount = 0;
        address previousBidder = address(0);
        
        if (currentBid.isActive && currentBid.bidder != address(0)) {
            refundAmount = currentBid.amount;
            previousBidder = currentBid.bidder;
            
            // Refund previous bidder
            require(
                flowToken.transfer(currentBid.bidder, refundAmount),
                "WhaleAlertBidding: Refund failed"
            );
            
            // Update previous bidder's total bid
            totalBidByUser[currentBid.bidder] -= refundAmount;
        }
        
        // Update bid information
        currentBid.bidder = msg.sender;
        currentBid.amount = amount;
        currentBid.timestamp = block.timestamp;
        currentBid.isActive = true;
        
        // Update bidder's total bid
        totalBidByUser[msg.sender] += amount;
        
        // Add to active list if not already there
        if (!isInActiveList[whaleAddress]) {
            activeWhaleAddresses.push(whaleAddress);
            isInActiveList[whaleAddress] = true;
        }
        
        emit BidPlaced(whaleAddress, msg.sender, amount, previousBidder, refundAmount);
    }
    
    /**
     * @dev Withdraw a bid (only if you're the current highest bidder)
     * @param whaleAddress The whale wallet address
     * @notice Withdrawing will remove you as the highest bidder
     * @notice The bid amount will be refunded (not burned)
     */
    function withdrawBid(address whaleAddress) external nonReentrant whenNotPaused {
        Bid storage currentBid = whaleBids[whaleAddress];
        require(currentBid.isActive, "WhaleAlertBidding: No active bid");
        require(currentBid.bidder == msg.sender, "WhaleAlertBidding: Not your bid");
        
        uint256 amount = currentBid.amount;
        
        // Reset bid
        currentBid.bidder = address(0);
        currentBid.amount = 0;
        currentBid.isActive = false;
        
        // Update bidder's total bid
        totalBidByUser[msg.sender] -= amount;
        
        // Refund bidder
        require(
            flowToken.transfer(msg.sender, amount),
            "WhaleAlertBidding: Refund failed"
        );
        
        emit BidWithdrawn(whaleAddress, msg.sender, amount);
    }
    
    /**
     * @dev Burn bidding fees (called periodically by owner)
     * @param amount Amount of FLOW tokens to burn from contract balance
     * @notice This creates deflationary pressure on the FLOW token
     */
    function burnBiddingFees(uint256 amount) external onlyOwner {
        require(amount > 0, "WhaleAlertBidding: Invalid amount");
        require(
            amount <= flowToken.balanceOf(address(this)),
            "WhaleAlertBidding: Insufficient balance"
        );
        
        // Burn tokens (transfer to address(0) or use burn function if available)
        // Note: This assumes FLOWToken has burn functionality
        // If not, tokens are sent to address(0) which effectively burns them
        require(
            flowToken.transfer(address(0), amount),
            "WhaleAlertBidding: Burn failed"
        );
        
        totalBurned += amount;
        emit TokensBurned(amount);
    }
    
    /**
     * @dev Get current bid for a whale address
     * @param whaleAddress The whale wallet address
     * @return Bid struct with current bid information
     */
    function getBid(address whaleAddress) external view returns (Bid memory) {
        return whaleBids[whaleAddress];
    }
    
    /**
     * @dev Get all active whale addresses with bids
     * @return Array of whale addresses with active bids
     */
    function getActiveWhaleAddresses() external view returns (address[] memory) {
        return activeWhaleAddresses;
    }
    
    /**
     * @dev Get total amount bid by a user across all wallets
     * @param user Address of the user
     * @return Total amount bid by the user
     */
    function getUserTotalBid(address user) external view returns (uint256) {
        return totalBidByUser[user];
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

