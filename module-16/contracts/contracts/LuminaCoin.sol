// contracts/contracts/LuminaCoin.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ILuminaCoin.sol"; // Ensure this path is correct

/**
 * @title LuminaCoin
 * @author Cascade (Generated)
 * @notice The native stablecoin of the Lumina Finance platform.
 * @dev ERC20 token pegged loosely to a stable value (e.g., USD).
 *      Minting and burning are controlled by the CollateralManager contract.
 */
contract LuminaCoin is ERC20, Ownable {
    address public collateralManager;

    event CollateralManagerSet(address indexed manager);

    /**
     * @notice Constructor initializes the token name and symbol.
     * @param _initialOwner The address that will initially own the contract.
     */
    constructor(address _initialOwner) ERC20("LuminaCoin", "LMC") Ownable(_initialOwner) {}

    /**
     * @notice Sets the address of the CollateralManager contract.
     * @dev Only the owner (deployer initially) can call this.
     *      The CollateralManager needs permission to mint/burn tokens.
     * @param _manager The address of the deployed CollateralManager contract.
     */
    function setCollateralManager(address _manager) external onlyOwner {
        require(_manager != address(0), "LuminaCoin: Manager address cannot be zero");
        collateralManager = _manager;
        emit CollateralManagerSet(_manager);
    }

    /**
     * @notice Mints new LuminaCoin tokens.
     * @dev Only callable by the CollateralManager contract.
     * @param to The address to mint tokens to.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == collateralManager, "LuminaCoin: Caller is not the CollateralManager");
        _mint(to, amount);
    }

    /**
     * @notice Burns existing LuminaCoin tokens from a specific account.
     * @dev Only callable by the CollateralManager contract.
     *      Requires the CollateralManager to have allowance or be the owner (less ideal).
     *      This implementation assumes CollateralManager calls `transferFrom` to itself first, then burns.
     * @param from The address to burn tokens from.
     * @param amount The amount of tokens to burn.
     */
    function burnFrom(address from, uint256 amount) external {
        require(msg.sender == collateralManager, "LuminaCoin: Caller is not the CollateralManager");
        _burn(from, amount); // Use OpenZeppelin's internal burn which handles allowance check if needed by caller
    }

     /**
     * @notice Burns existing LuminaCoin tokens *held by this contract*.
     * @dev Primarily used after the CollateralManager receives tokens for repayment.
     * @param amount The amount of tokens to burn.
     */
    function burnHeldTokens(uint256 amount) external {
        require(msg.sender == collateralManager, "LuminaCoin: Caller is not the CollateralManager");
         _burn(address(this), amount); // Burn tokens held by this contract
    }
}