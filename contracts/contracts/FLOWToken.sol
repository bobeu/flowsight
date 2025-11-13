// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

/**
 * @title FLOWToken
 * @dev ERC-20 token contract for FlowSight platform
 * @notice Fixed supply of 1,000,000,000 FLOW tokens
 * @notice Supports burning, pausing, and owner-controlled operations
 * 
 * Token Distribution:
 * - Community & Rewards: 45% (450M)
 * - Team & Advisors: 15% (150M) - 1 year cliff, 3 year vesting
 * - Ecosystem & Treasury: 20% (200M)
 * - Private/Public Sale: 20% (200M)
 */
contract FLOWToken is ERC20, ERC20Burnable, Ownable, ERC20Pausable {
    /// @dev Total supply: 1 billion FLOW tokens
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    /// @dev Maximum amount that can be minted (for vesting purposes)
    uint256 public constant MAX_MINTABLE = TOTAL_SUPPLY;
    
    /// @dev Track total minted tokens
    uint256 private _totalMinted;

    /**
     * @dev Emitted when tokens are minted
     * @param to Address receiving the tokens
     * @param amount Amount of tokens minted
     */
    event TokensMinted(address indexed to, uint256 amount);

    /**
     * @dev Constructor - Mints initial supply to deployer
     * @param initialOwner Address that will own the contract
     */
    constructor(address initialOwner) ERC20("FlowSight", "FLOW") Ownable(initialOwner) {
        // Initial supply will be minted via separate minting function
        // to allow for proper distribution
    }

    /**
     * @dev Mint tokens to a specific address (only owner)
     * @param to Address to receive the tokens
     * @param amount Amount of tokens to mint
     * @notice Can only mint up to MAX_MINTABLE total
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(
            _totalMinted + amount <= MAX_MINTABLE,
            "FLOWToken: Cannot exceed max mintable supply"
        );
        _totalMinted += amount;
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Batch mint tokens to multiple addresses
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to mint (must match recipients length)
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(
            recipients.length == amounts.length,
            "FLOWToken: Arrays length mismatch"
        );
        
        for (uint256 i = 0; i < recipients.length; i++) {
            mint(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Pause token transfers (only owner)
     * @notice Useful for emergency situations
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers (only owner)
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Get total minted tokens
     * @return Total amount of tokens minted so far
     */
    function totalMinted() public view returns (uint256) {
        return _totalMinted;
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
}

