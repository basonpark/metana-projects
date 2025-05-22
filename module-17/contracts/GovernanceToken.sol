// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

/**
 * @title GovernanceToken
 * @dev An ERC20 token with voting capabilities for DAO governance.
 * Follows OpenZeppelin Wizard pattern for ERC20 + Votes + Permit.
 */
contract GovernanceToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    /**
     * @dev Constructor: Initializes the token and base contracts.
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     * @param _initialSupply The total initial supply of the token.
     * @param _initialHolder The address to receive the initial supply.
     * @param _initialOwner The address that will own the contract.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        address _initialHolder,
        address _initialOwner
    // Initialize ALL base contracts explicitly as per OZ Wizard pattern
    ) ERC20(_name, _symbol) ERC20Permit(_name) Ownable(_initialOwner) {
        if (_initialSupply > 0) {
            _mint(_initialHolder, _initialSupply);
        }
    }

    /**
     * @dev Mints additional tokens. Can only be called by the current owner.
     * @param to The address to mint tokens to.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // --- Overrides --- 

    /**
     * @dev Override required by ERC20Votes. Handles checkpointing on token transfers.
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    /**
     * @dev Override required by ERC20Permit. Returns the nonce value for an owner.
     */
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
} 