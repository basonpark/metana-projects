// contracts/contracts/CollateralManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ILuminaCoin.sol";
import "./interfaces/IPriceFeed.sol"; // Interface for Chainlink Price Feed

/**
 * @title CollateralManager
 * @author Cascade (Generated)
 * @notice Handles ETH collateral deposits, LuminaCoin borrowing/repayment, and liquidations.
 * @dev Interacts with LuminaCoin token and a Price Feed Oracle.
 */
contract CollateralManager is Ownable, ReentrancyGuard {

    // === Interfaces ===
    ILuminaCoin public luminaCoin;
    IPriceFeed public ethUsdPriceFeed; // e.g., Chainlink ETH/USD feed

    // === Constants ===
    uint256 public constant LTV_RATIO_PERCENT = 66; // Loan-to-Value ratio (e.g., 66% -> $100 ETH allows $66 LMC borrow)
    uint256 public constant LIQUIDATION_THRESHOLD_PERCENT = 80; // Point at which position can be liquidated (e.g., 80%)
    uint256 public constant LIQUIDATION_BONUS_PERCENT = 5; // Bonus incentive for liquidators (e.g., 5%)
    uint256 public constant PRECISION = 1 ether; // For percentage calculations

    // === Storage ===
    mapping(address => uint256) public collateralBalances; // User address => ETH collateral amount
    mapping(address => uint256) public debtBalances; // User address => LuminaCoin debt amount

    // === Events ===
    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event LoanBorrowed(address indexed user, uint256 amount);
    event LoanRepaid(address indexed user, uint256 amount);
    event PositionLiquidated(address indexed user, address indexed liquidator, uint256 collateralLiquidated, uint256 debtRepaid);
    event PriceFeedSet(address indexed feedAddress);
    event LuminaCoinSet(address indexed tokenAddress);

    // === Errors ===
    error InsufficientCollateral();
    error AmountMustBeGreaterThanZero();
    error TransferFailed();
    error InvalidAddress();
    error HealthFactorOk(); // Position not below liquidation threshold
    error RepaymentExceedsDebt();
    error NoDebtExists();
    error PriceFeedNotSet();
    error LuminaCoinNotSet();
    error LiquidationNotImplemented(); // Placeholder
    error PriceFeedInvalid();

    /**
     * @notice Constructor
     * @param _initialOwner The initial owner of the contract.
     * @param _priceFeedAddress Address of the ETH/USD price feed oracle.
     * @param _luminaCoinAddress Address of the deployed LuminaCoin token contract.
     */
    constructor(address _initialOwner, address _priceFeedAddress, address _luminaCoinAddress) Ownable(_initialOwner) {
        if (_priceFeedAddress == address(0)) revert InvalidAddress();
        if (_luminaCoinAddress == address(0)) revert InvalidAddress();

        ethUsdPriceFeed = IPriceFeed(_priceFeedAddress);
        luminaCoin = ILuminaCoin(_luminaCoinAddress);

        emit PriceFeedSet(_priceFeedAddress);
        emit LuminaCoinSet(_luminaCoinAddress);
    }

    // === External Functions ===

    /**
     * @notice Deposits ETH as collateral.
     * @dev User must send ETH with the transaction.
     */
    function depositCollateral() external payable nonReentrant {
        if (msg.value == 0) revert AmountMustBeGreaterThanZero();

        collateralBalances[msg.sender] += msg.value;
        emit CollateralDeposited(msg.sender, msg.value);
    }

    /**
     * @notice Withdraws ETH collateral.
     * @param _amount The amount of ETH to withdraw.
     * @dev Checks if the withdrawal would make the user's position undercollateralized.
     */
    function withdrawCollateral(uint256 _amount) external nonReentrant {
        if (_amount == 0) revert AmountMustBeGreaterThanZero();
        uint256 currentCollateral = collateralBalances[msg.sender];
        if (_amount > currentCollateral) revert InsufficientCollateral();

        collateralBalances[msg.sender] = currentCollateral - _amount; // Update state first

        // Check health factor after withdrawal only if user has debt
        if (debtBalances[msg.sender] > 0) {
             // Recalculate health factor based on potential new collateral balance
             uint256 collateralValueAfterWithdrawal = getAccountCollateralValueInternal(collateralBalances[msg.sender]);
             uint256 debtValue = debtBalances[msg.sender]; // Already in LMC decimals
             if (debtValue > 0 && getHealthFactorInternal(collateralValueAfterWithdrawal, debtValue) < PRECISION) {
                 revert InsufficientCollateral(); // Revert if withdrawal makes position unhealthy
             }
        }

        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        if (!success) revert TransferFailed();

        emit CollateralWithdrawn(msg.sender, _amount);
    }

    /**
     * @notice Borrows LuminaCoin against deposited collateral.
     * @param _amount The amount of LuminaCoin to borrow (in LMC decimals, e.g., 18).
     * @dev Calculates the maximum borrowable amount based on the user's collateral.
     */
    function borrowLuminaCoin(uint256 _amount) external nonReentrant {
        if (_amount == 0) revert AmountMustBeGreaterThanZero();
        if (address(luminaCoin) == address(0)) revert LuminaCoinNotSet();

        uint256 currentDebt = debtBalances[msg.sender];
        uint256 collateralValue = getAccountCollateralValue(msg.sender); // Value in LMC decimals (18)
        uint256 maxBorrowable = (collateralValue * LTV_RATIO_PERCENT) / 100; // In LMC decimals

        uint256 newDebt = currentDebt + _amount;
        if (newDebt > maxBorrowable) {
            revert InsufficientCollateral();
        }

        debtBalances[msg.sender] = newDebt; // Update state first
        luminaCoin.mint(msg.sender, _amount);

        emit LoanBorrowed(msg.sender, _amount);
    }

    /**
     * @notice Repays borrowed LuminaCoin.
     * @param _amount The amount of LuminaCoin to repay (in LMC decimals, e.g., 18).
     * @dev User must first approve this contract to spend their LuminaCoin.
     */
    function repayLuminaCoin(uint256 _amount) external nonReentrant {
         if (_amount == 0) revert AmountMustBeGreaterThanZero();
         if (address(luminaCoin) == address(0)) revert LuminaCoinNotSet();

         uint256 currentDebt = debtBalances[msg.sender];
         if (currentDebt == 0) revert NoDebtExists();
         // Allow repaying slightly more if needed due to rounding, but usually _amount <= currentDebt
         uint256 amountToRepay = _amount > currentDebt ? currentDebt : _amount;

         debtBalances[msg.sender] = currentDebt - amountToRepay; // Update state first

         // Transfer LuminaCoin from user to this contract
         bool success = luminaCoin.transferFrom(msg.sender, address(this), amountToRepay);
         if (!success) revert TransferFailed();

         // Burn the repaid tokens held by this contract
         luminaCoin.burn(address(this), amountToRepay); // Burn tokens held by this contract

         emit LoanRepaid(msg.sender, amountToRepay);
    }

    /**
     * @notice Liquidates an undercollateralized position.
     * @param _user The address of the user whose position is being liquidated.
     * @dev Anyone can call this function if a user's health factor is below 1.
     *      Liquidator repays some/all of the user's debt and receives discounted collateral.
     *      Requires the liquidator to approve this contract to spend their LuminaCoin.
     *      NOTE: This is a simplified placeholder implementation. Needs significant refinement.
     */
    function liquidate(address _user) external nonReentrant {
        // --- Health Factor Check ---
        (uint256 collateralValue, uint256 debtValue) = getAccountValues(_user);
        uint256 healthFactor = getHealthFactorInternal(collateralValue, debtValue);

        if (healthFactor >= PRECISION) {
            revert HealthFactorOk(); // Position is not liquidatable
        }

        // --- Calculation ---
        // Simplified: Liquidator repays the entire debt. Real systems often allow partial.
        uint256 debtToRepay = debtBalances[_user];
        if (debtToRepay == 0) revert NoDebtExists(); // Should be caught by HF check, but good practice

        // Calculate collateral to seize: value = debtValue * (100 + bonus) / 100
        // We need debt value in terms of ETH using the price feed to calculate ETH collateral amount
        (, int256 price, , , ) = ethUsdPriceFeed.latestRoundData(); // Get price from oracle
        if (price <= 0) revert PriceFeedInvalid(); // Check for valid price
        uint256 ethPrice = uint256(price); // Convert to uint256

        uint8 priceFeedDecimals = ethUsdPriceFeed.decimals();

        // Value of debt in USD (scaled by 18 + 8 = 26 decimals) = debtToRepay * ethPrice
        // We want the equivalent value in ETH (18 decimals)
        // Collateral Value to Seize (USD terms, 18 dec) = debtToRepay * (100 + LIQUIDATION_BONUS_PERCENT) / 100
        uint256 collateralValueToSeize = (debtToRepay * (100 + LIQUIDATION_BONUS_PERCENT)) / 100; // In LMC/USD (18 dec)

        // Convert collateral value (USD, 18 dec) back to ETH amount (18 dec)
        // ETH Amount = Collateral Value (USD) * 10^priceFeedDecimals / ethPrice
        uint256 ethCollateralToSeize = (collateralValueToSeize * (10**priceFeedDecimals)) / ethPrice; // Should have 18 decimals

        // Ensure we don't seize more collateral than the user has
        uint256 userCollateral = collateralBalances[_user];
        if (ethCollateralToSeize > userCollateral) {
            ethCollateralToSeize = userCollateral; // Cap at user's balance
            // Optional: Recalculate debt repaid based on capped collateral if partial liq desired
        }


        // --- State Updates (Checks-Effects-Interactions) ---
        collateralBalances[_user] -= ethCollateralToSeize;
        debtBalances[_user] -= debtToRepay; // Assuming full repayment for simplicity


        // --- Interactions ---
        // 1. Take LMC from liquidator
        bool successTransfer = luminaCoin.transferFrom(msg.sender, address(this), debtToRepay);
        if (!successTransfer) revert TransferFailed();

        // 2. Burn the repaid LMC
        luminaCoin.burn(address(this), debtToRepay);

        // 3. Send ETH collateral to liquidator
        (bool successSend, ) = payable(msg.sender).call{value: ethCollateralToSeize}("");
        if (!successSend) revert TransferFailed(); // Consider implications of revert here

        emit PositionLiquidated(_user, msg.sender, ethCollateralToSeize, debtToRepay);
        // revert LiquidationNotImplemented(); // Remove placeholder if implementing
    }

    // === Public View Functions ===

    /**
     * @notice Gets the latest ETH price from the oracle.
     * @return price The price of ETH in USD, scaled to 18 decimals.
     */
    function getEthPriceInUsd() public view returns (uint256) {
        if (address(ethUsdPriceFeed) == address(0)) revert PriceFeedNotSet();
        (, int priceInt, , , ) = ethUsdPriceFeed.latestRoundData();
        if (priceInt <= 0) revert("CollateralManager: Invalid price from oracle");

        uint8 priceFeedDecimals = ethUsdPriceFeed.decimals(); // e.g., 8
        // Adjust price to 18 decimals
        // price * (10**(18 - priceFeedDecimals))
        return uint256(priceInt) * (10**(18 - uint256(priceFeedDecimals)));
    }

    /**
     * @notice Calculates the USD value of a user's collateral, scaled to 18 decimals.
     * @param _user The address of the user.
     * @return value The total value in USD (18 decimals).
     */
    function getAccountCollateralValue(address _user) public view returns (uint256) {
        return getAccountCollateralValueInternal(collateralBalances[_user]);
    }

     /**
     * @notice Calculates the health factor of a user's position.
     * @param _user The address of the user.
     * @return healthFactor A ratio representing the safety of the loan, scaled by PRECISION (1e18).
     *         Health Factor = (Collateral Value * Liquidation Threshold) / Total Debt Value
     *         A value < 1e18 means the position is undercollateralized and liquidatable.
     */
    function getHealthFactor(address _user) public view returns (uint256) {
        (uint256 collateralValue, uint256 debtValue) = getAccountValues(_user);
        return getHealthFactorInternal(collateralValue, debtValue);
    }

    /**
     * @notice Gets both collateral value (USD, 18 dec) and debt value (LMC, 18 dec) for a user.
     */
    function getAccountValues(address _user) public view returns (uint256 collateralValue, uint256 debtValue) {
         collateralValue = getAccountCollateralValueInternal(collateralBalances[_user]);
         debtValue = debtBalances[_user];
         return (collateralValue, debtValue);
    }

    // === Admin Functions ===

    /**
     * @notice Updates the LuminaCoin contract address.
     * @param _newLuminaCoinAddress The new address.
     */
    function setLuminaCoinAddress(address _newLuminaCoinAddress) external onlyOwner {
        if (_newLuminaCoinAddress == address(0)) revert InvalidAddress();
        luminaCoin = ILuminaCoin(_newLuminaCoinAddress);
        emit LuminaCoinSet(_newLuminaCoinAddress);
    }

    /**
     * @notice Updates the Price Feed Oracle contract address.
     * @param _newPriceFeedAddress The new address.
     */
    function setPriceFeedAddress(address _newPriceFeedAddress) external onlyOwner {
        if (_newPriceFeedAddress == address(0)) revert InvalidAddress();
        ethUsdPriceFeed = IPriceFeed(_newPriceFeedAddress);
        emit PriceFeedSet(_newPriceFeedAddress);
    }

    // === Internal Functions ===

     /**
     * @notice Internal function to calculate collateral value from ETH amount.
     * @param _ethAmount Amount of ETH collateral (18 decimals).
     * @return value The total value in USD (18 decimals).
     * @dev Calculates the value using the ETH price from the oracle.
     */
    function getAccountCollateralValueInternal(uint256 _ethAmount) internal view returns (uint256) {
        if (_ethAmount == 0) return 0;

        uint256 ethPriceUsd = getEthPriceInUsd(); // Has 18 decimals
        // Value = (ETH amount * ETH price) / 1 ether (or 10**18)
        return (_ethAmount * ethPriceUsd) / PRECISION; // Result has 18 decimals
    }

    /**
     * @notice Internal function to calculate health factor.
     * @param _collateralValue User's collateral value in USD (18 decimals).
     * @param _debtValue User's debt value in LMC (18 decimals).
     * @return healthFactor Scaled by PRECISION (1e18).
     * @dev A health factor below 1 indicates the position is undercollateralized.
     */
    function getHealthFactorInternal(uint256 _collateralValue, uint256 _debtValue) internal pure returns (uint256) {
        if (_debtValue == 0) {
            // Return a very large number or specific indicator for no debt
            return type(uint256).max;
        }

        // Calculate the collateral value at the liquidation threshold
        // ThresholdValue = (Collateral Value * LIQUIDATION_THRESHOLD_PERCENT) / 100
        uint256 thresholdValue = (_collateralValue * LIQUIDATION_THRESHOLD_PERCENT) / 100;

        // Health Factor = (Threshold Value * PRECISION) / Debt Value
        return (thresholdValue * PRECISION) / _debtValue;
    }
}