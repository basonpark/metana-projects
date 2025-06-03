// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import "./ChainlinkDataFeed.sol"; // Import ChainlinkDataFeed contract
import "./ExternalAPIOracle.sol";

/**
 * @title PredictionMarket
 * @dev A prediction market contract allowing users to bet on real-world events
 * using an AMM for trading, Chainlink Oracle for data verification,
 * and Chainlink Automation for settlement.
 */
contract PredictionMarket is AutomationCompatibleInterface, ConfirmedOwner /*, ERC1155Holder */ {
    // Market status enum
    enum MarketStatus {
        Open,      // Market is open for bets
        Locked,    // Market is locked, no more bets allowed
        Settled,   // Market has been settled and payouts processed
        Cancelled  // Market was cancelled
    }

    // Outcome representation
    enum Outcome {
        NoOutcome, // Default state, no outcome determined
        Yes,       // The event occurred
        No         // The event did not occur
    }

    // NEW: Enum to differentiate data sources
    enum DataSourceType { ChainlinkPriceFeed, ExternalAPI }

    // Structure to represent a prediction market
    struct Market {
        uint256 id;
        string question;         // The question being predicted
        uint256 creationTime;    // When the market was created
        uint256 expirationTime;  // Trading stops, market locks for settlement prep
        uint256 settlementTime;  // Target time for oracle to provide result / settlement process starts
        address oracleContract;  // Address of the oracle contract
        bytes32 feedOrEndpointId;// Identifier for the specific data feed or API endpoint
        uint256 resolutionCriteria; // Threshold for Price Feed or expected outcome (1 for Yes, 0 for No) for API
        // REMOVED: totalYesAmount, totalNoAmount - Replaced by AMM state
        // NEW: AMM internal state (counts of shares held *by the AMM*) - Simplistic for now
        uint256 ammYesShares;    // Internal count for AMM pricing
        uint256 ammNoShares;     // Internal count for AMM pricing
        // NEW: Collateral pool tracked explicitly (if needed beyond address(this).balance)
        uint256 collateralPool;  // Total collateral held by the AMM
        MarketStatus status;     // Current status of the market
        Outcome outcome;         // Final outcome of the market
        string category;         // Category of the market
        address creator;         // Creator of the market
        uint256 fee;             // Fee percentage (in basis points) - How to apply with AMM needs review
        DataSourceType dataSourceType; // Type of data source used for settlement
        bytes32 settlementRequestId; // Chainlink request ID if using ExternalAPIOracle for settlement
    }

    // Structure to represent a user's bet (No longer directly used for tracking core position)
    // Keep for historical data or specific bet details if needed, but share balance is primary
    struct Bet {
        uint256 marketId;
        address user;
        Outcome prediction; // Reflects the initial bet direction
        uint256 amount;     // Initial collateral amount
        bool claimed;       // Tracks if winnings from *this specific bet* were claimed (if keeping Bet struct)
    }

    // State variables
    uint256 private nextMarketId = 1;
    mapping(uint256 => Market) public markets;
    // REMOVED: mapping(uint256 => mapping(address => Bet[])) public userBets; - Replaced by share balances
    // REMOVED: mapping(uint256 => address[]) public marketParticipants; - Can be derived if needed

    // NEW: Tracking user share balances (marketId => user => outcomeIndex => balance)
    // outcomeIndex: 0 for No, 1 for Yes (consistent with Outcome enum, skipping NoOutcome)
    mapping(uint256 => mapping(address => mapping(uint256 => uint256))) public outcomeShares;

    // NEW: Tracking total supply of shares per outcome (marketId => outcomeIndex => totalSupply)
    mapping(uint256 => mapping(uint256 => uint256)) public totalOutcomeShares;

    // Platform fee (in basis points) - Needs integration with AMM trades
    uint256 public platformFee = 100; // 1%

    // Oracle contract references
    ChainlinkDataFeed public chainlinkDataFeedOracle;
    ExternalAPIOracle public externalApiOracle;

    // Events
    event MarketCreated(uint256 indexed marketId, address indexed creator, string question, DataSourceType dataSourceType);
    // UPDATED: BetPlaced -> SharesBought
    event SharesBought(uint256 indexed marketId, address indexed user, uint256 outcomeIndex, uint256 collateralAmount, uint256 sharesMinted);
    // NEW: SharesSold event
    event SharesSold(uint256 indexed marketId, address indexed user, uint256 outcomeIndex, uint256 sharesBurned, uint256 collateralReturned);
    event MarketLocked(uint256 indexed marketId);
    event MarketSettled(uint256 indexed marketId, Outcome outcome);
    event MarketCancelled(uint256 indexed marketId);
    // UPDATED: RewardClaimed -> WinningsRedeemed
    event WinningsRedeemed(uint256 indexed marketId, address indexed user, uint256 sharesBurned, uint256 payoutAmount);
    event PlatformFeeUpdated(uint256 newFee);
    event SettlementDataRequested(uint256 indexed marketId, bytes32 requestId);

    // Constructor
    constructor(address _chainlinkDataFeedOracle, address _externalApiOracle, address initialOwner) ConfirmedOwner(initialOwner) {
        require(_chainlinkDataFeedOracle != address(0), "Invalid Chainlink Data Feed Oracle address");
        require(_externalApiOracle != address(0), "Invalid External API Oracle address");
        chainlinkDataFeedOracle = ChainlinkDataFeed(_chainlinkDataFeedOracle);
        externalApiOracle = ExternalAPIOracle(_externalApiOracle);
    }

    // --- AMM Core Logic (Constant Product) ---

    uint256 private constant PRICE_PRECISION = 1e18; // For price calculations

    /**
     * @dev Calculates the number of shares a user receives for a given collateral amount.
     * Implements a constant product market maker formula.
     * Fees are deducted from collateralAmount *before* calculating shares.
     * @param marketId ID of the market.
     * @param outcomeIndex 0 for No, 1 for Yes.
     * @param collateralAmount Gross amount of collateral sent by the user.
     * @param feeRecipientPlatform Address to send platform fee.
     * @param feeRecipientCreator Address to send creator fee.
     * @return sharesToMint Amount of shares the user should receive.
     * @return platformFeeAmount Amount of platform fee collected.
     * @return creatorFeeAmount Amount of creator fee collected.
     * @return netCollateralAmount Collateral used for AMM calculation after fees.
     */
    function _calculateSharesToMint(
        uint256 marketId,
        uint256 outcomeIndex,
        uint256 collateralAmount,
        address feeRecipientPlatform,
        address feeRecipientCreator // Added creator fee recipient
    )
        internal
        view
        returns (uint256 sharesToMint, uint256 platformFeeAmount, uint256 creatorFeeAmount, uint256 netCollateralAmount)
    {
        Market storage market = markets[marketId];
        require(market.id != 0, "Market does not exist");
        require(outcomeIndex == 0 || outcomeIndex == 1, "Invalid outcome index");
        require(collateralAmount > 0, "Collateral cannot be zero");

        // --- Fee Calculation (on input collateral) ---
        platformFeeAmount = (collateralAmount * platformFee) / 10000;
        creatorFeeAmount = (collateralAmount * market.fee) / 10000; // Use market-specific fee
        uint256 totalFee = platformFeeAmount + creatorFeeAmount;
        require(collateralAmount > totalFee, "Collateral less than fees");
        netCollateralAmount = collateralAmount - totalFee; // Amount used in AMM calculation

        // --- AMM Calculation (Constant Product: shares = (reserve_out * collateral_in_net) / (reserve_in + collateral_in_net)) ---
        uint256 ammYes = market.ammYesShares;
        uint256 ammNo = market.ammNoShares;

        if (outcomeIndex == 1) { // Buying YES shares
            // reserve_out = ammYesShares, reserve_in = ammNoShares
            require(ammNo > 0 && ammYes > 0, "AMM reserves must be positive"); // Avoid division by zero / initialization issues
             // Add netCollateralAmount to the opposing reserve for calculation
            uint256 denominator = ammNo + netCollateralAmount;
            require(denominator >= netCollateralAmount, "Overflow add denominator"); // Overflow check
            sharesToMint = (ammYes * netCollateralAmount) / denominator;

        } else { // Buying NO shares
            // reserve_out = ammNoShares, reserve_in = ammYesShares
             require(ammNo > 0 && ammYes > 0, "AMM reserves must be positive");
             // Add netCollateralAmount to the opposing reserve for calculation
            uint256 denominator = ammYes + netCollateralAmount;
            require(denominator >= netCollateralAmount, "Overflow add denominator"); // Overflow check
            sharesToMint = (ammNo * netCollateralAmount) / denominator;
        }

        require(sharesToMint > 0, "Shares minted must be positive");

         // Transfer fees (consider moving this to the main function after calculation)
         // It's safer to calculate first, then perform transfers in the main function.
         // We return the amounts here.

        return (sharesToMint, platformFeeAmount, creatorFeeAmount, netCollateralAmount);
    }


     /**
     * @dev Calculates the collateral a user receives for selling shares.
     * Implements a constant product market maker formula.
     * Fees are deducted from the calculated collateral *before* returning to user.
     * @param marketId ID of the market.
     * @param outcomeIndex 0 for No, 1 for Yes.
     * @param sharesToSell Amount of shares the user wants to sell.
     * @param feeRecipientPlatform Address to send platform fee.
     * @param feeRecipientCreator Address to send creator fee.
     * @return grossCollateralToReturn Collateral calculated by AMM before fees.
     * @return platformFeeAmount Amount of platform fee collected.
     * @return creatorFeeAmount Amount of creator fee collected.
     * @return netCollateralToReturn Collateral returned to user after fees.
     */
    function _calculateCollateralToReturn(
        uint256 marketId,
        uint256 outcomeIndex,
        uint256 sharesToSell,
        address feeRecipientPlatform,
        address feeRecipientCreator // Added creator fee recipient
    )
        internal
        view
        returns (uint256 grossCollateralToReturn, uint256 platformFeeAmount, uint256 creatorFeeAmount, uint256 netCollateralToReturn)
    {
        Market storage market = markets[marketId];
        require(market.id != 0, "Market does not exist");
        require(outcomeIndex == 0 || outcomeIndex == 1, "Invalid outcome index");
        require(sharesToSell > 0, "Shares to sell must be positive");

        // --- AMM Calculation (Constant Product: collateral = (reserve_out * shares_in) / (reserve_in + shares_in)) ---
        uint256 ammYes = market.ammYesShares;
        uint256 ammNo = market.ammNoShares;

        if (outcomeIndex == 1) { // Selling YES shares
            // reserve_out = ammNoShares (collateral is backed by the other side)
            // reserve_in = ammYesShares
             require(ammNo > 0 && ammYes > 0, "AMM reserves must be positive");
            uint256 denominator = ammYes + sharesToSell;
            require(denominator >= sharesToSell, "Overflow add denominator"); // Overflow check
            grossCollateralToReturn = (ammNo * sharesToSell) / denominator;

        } else { // Selling NO shares
            // reserve_out = ammYesShares
            // reserve_in = ammNoShares
            require(ammNo > 0 && ammYes > 0, "AMM reserves must be positive");
            uint256 denominator = ammNo + sharesToSell;
             require(denominator >= sharesToSell, "Overflow add denominator"); // Overflow check
            grossCollateralToReturn = (ammYes * sharesToSell) / denominator;
        }

        require(grossCollateralToReturn > 0, "Collateral returned must be positive");

        // --- Fee Calculation (on output collateral) ---
        platformFeeAmount = (grossCollateralToReturn * platformFee) / 10000;
        creatorFeeAmount = (grossCollateralToReturn * market.fee) / 10000; // Use market-specific fee
        uint256 totalFee = platformFeeAmount + creatorFeeAmount;

        if (grossCollateralToReturn > totalFee) {
             netCollateralToReturn = grossCollateralToReturn - totalFee;
        } else {
            // Fees exceed calculated return, user gets nothing, fees take what's available.
            netCollateralToReturn = 0;
            // Adjust fee amounts proportionally if needed, or just take the gross amount?
            // Simplest: take the whole gross amount as fees if it's less than calculated fees.
            platformFeeAmount = (grossCollateralToReturn * platformFee) / (platformFee + market.fee); // Proportional platform fee
             creatorFeeAmount = grossCollateralToReturn - platformFeeAmount; // Remainder creator fee
        }


         // Transfer fees (safer to do in the main function)
         // We return the amounts here.

        return (grossCollateralToReturn, platformFeeAmount, creatorFeeAmount, netCollateralToReturn);
    }

    /**
     * @dev Allows users to buy outcome shares using collateral (ETH).
     * Incorporates CPMM logic and fees.
     * @param marketId ID of the market.
     * @param outcomeIndex The outcome to buy shares for (0 for No, 1 for Yes).
     */
    function buyShares(uint256 marketId, uint256 outcomeIndex) external payable {
        Market storage market = markets[marketId];

        // Validations
        require(market.id != 0, "Market does not exist");
        require(market.status == MarketStatus.Open, "Market is not open");
        require(block.timestamp < market.expirationTime, "Market trading has expired");
        require(outcomeIndex == 0 || outcomeIndex == 1, "Invalid outcome index (0 or 1)");
        require(msg.value > 0, "Collateral amount must be greater than 0");

        // Calculate shares to mint using AMM logic and fees
        uint256 collateralAmount = msg.value;
        (uint256 sharesToMint, uint256 platformFeeAmount, uint256 creatorFeeAmount, uint256 netCollateralAmount) =
            _calculateSharesToMint(marketId, outcomeIndex, collateralAmount, owner(), market.creator); // Pass fee recipients

        // --- Update State ---
        // 1. Update AMM internal balances based on shares minted
        if (outcomeIndex == 1) { // Bought YES shares
            require(market.ammYesShares >= sharesToMint, "AMM invariant broken (YES)"); // Sanity check
            market.ammYesShares -= sharesToMint;
            market.ammNoShares += netCollateralAmount; // Add net collateral to the opposing pool value
        } else { // Bought NO shares
            require(market.ammNoShares >= sharesToMint, "AMM invariant broken (NO)"); // Sanity check
            market.ammNoShares -= sharesToMint;
            market.ammYesShares += netCollateralAmount; // Add net collateral to the opposing pool value
        }

        // 2. Add *net* collateral (after fees) to the tracked pool
        market.collateralPool += netCollateralAmount;

        // 3. Mint shares to the user
        outcomeShares[marketId][msg.sender][outcomeIndex] += sharesToMint;

        // 4. Update total supply for the outcome
        totalOutcomeShares[marketId][outcomeIndex] += sharesToMint;

        // --- Transfer Fees ---
        if (platformFeeAmount > 0) {
            (bool successPlatform, ) = payable(owner()).call{value: platformFeeAmount}("");
            require(successPlatform, "Platform fee transfer failed");
        }
        if (creatorFeeAmount > 0) {
             (bool successCreator, ) = payable(market.creator).call{value: creatorFeeAmount}("");
             require(successCreator, "Creator fee transfer failed");
        }


        emit SharesBought(marketId, msg.sender, outcomeIndex, collateralAmount, sharesToMint); // Emit gross collateral
    }


    /**
     * @dev Allows users to sell their outcome shares back to the AMM for collateral (ETH).
     * Incorporates CPMM logic and fees.
     * @param marketId ID of the market.
     * @param outcomeIndex The outcome shares to sell (0 for No, 1 for Yes).
     * @param sharesToSell The amount of shares to sell.
     */
    function sellShares(uint256 marketId, uint256 outcomeIndex, uint256 sharesToSell) external {
        Market storage market = markets[marketId];
        address user = msg.sender; // Cache user address

        // Validations
        require(market.id != 0, "Market does not exist");
        require(market.status == MarketStatus.Open || market.status == MarketStatus.Locked, "Market not open or locked");
        require(outcomeIndex == 0 || outcomeIndex == 1, "Invalid outcome index (0 or 1)");
        require(sharesToSell > 0, "Must sell a positive amount of shares");
        require(outcomeShares[marketId][user][outcomeIndex] >= sharesToSell, "Insufficient share balance");

        // Calculate collateral to return using AMM logic and fees
        (uint256 grossCollateralToReturn, uint256 platformFeeAmount, uint256 creatorFeeAmount, uint256 netCollateralToReturn) =
            _calculateCollateralToReturn(marketId, outcomeIndex, sharesToSell, owner(), market.creator); // Pass fee recipients

        require(market.collateralPool >= grossCollateralToReturn, "Insufficient collateral in AMM pool for gross return"); // Check against gross amount

        // --- Update State ---
        // 1. Burn user's shares
        outcomeShares[marketId][user][outcomeIndex] -= sharesToSell;

        // 2. Update total supply
        totalOutcomeShares[marketId][outcomeIndex] -= sharesToSell;

        // 3. Update AMM internal balances
        if (outcomeIndex == 1) { // Sold YES shares
            market.ammYesShares += sharesToSell;
             require(market.ammNoShares >= grossCollateralToReturn, "AMM invariant broken (Sell YES)");
            market.ammNoShares -= grossCollateralToReturn; // Remove gross collateral from opposing pool value
        } else { // Sold NO shares
            market.ammNoShares += sharesToSell;
            require(market.ammYesShares >= grossCollateralToReturn, "AMM invariant broken (Sell NO)");
            market.ammYesShares -= grossCollateralToReturn; // Remove gross collateral from opposing pool value
        }

        // 4. Remove *gross* collateral from the tracked pool (fees are handled separately)
        market.collateralPool -= grossCollateralToReturn;

        // --- Transfer Payout & Fees ---
        // Transfer net amount to user
        if (netCollateralToReturn > 0) {
             (bool successUser, ) = payable(user).call{value: netCollateralToReturn}("");
             require(successUser, "Net collateral transfer failed");
        }
         
        // Transfer fees
        if (platformFeeAmount > 0) {
            (bool successPlatform, ) = payable(owner()).call{value: platformFeeAmount}("");
            require(successPlatform, "Platform fee transfer failed");
        }
        if (creatorFeeAmount > 0) {
             (bool successCreator, ) = payable(market.creator).call{value: creatorFeeAmount}("");
             require(successCreator, "Creator fee transfer failed");
        }

        emit SharesSold(marketId, user, outcomeIndex, sharesToSell, netCollateralToReturn); // Emit net collateral returned
    }

    /**
     * @dev Locks a market when it expires so no more bets can be placed
     * @param marketId ID of the market to lock
     */
    function lockMarket(uint256 marketId) external { // Consider access control - maybe only automation/owner?
        Market storage market = markets[marketId];

        require(market.id != 0, "Market does not exist");
        require(market.status == MarketStatus.Open, "Market is not open");
        require(block.timestamp >= market.expirationTime, "Market has not expired yet");

        market.status = MarketStatus.Locked;

        emit MarketLocked(marketId);
    }


    // --- Settlement Logic (Needs review with AMM) ---
    // settleMarket is onlyOwner, performUpkeep uses Oracle. Keep performUpkeep for now.

    /**
     * @dev Settles a market by determining the outcome - ONLY OWNER.
     * Kept for manual intervention, but performUpkeep is primary automated path.
     * @param marketId ID of the market to settle
     * @param outcome The final outcome of the market
     */
    function settleMarket(uint256 marketId, Outcome outcome) external onlyOwner {
        Market storage market = markets[marketId];

        require(market.id != 0, "Market does not exist");
        // Should be locked or potentially still open if settlement time is reached before expiry lock?
        require(market.status == MarketStatus.Locked || market.status == MarketStatus.Open, "Market not in settleable state");
        require(block.timestamp >= market.settlementTime, "Settlement time not reached");
        require(outcome == Outcome.Yes || outcome == Outcome.No, "Invalid outcome");
        require(market.status != MarketStatus.Settled, "Market already settled"); // Prevent re-settlement

        market.outcome = outcome;
        market.status = MarketStatus.Settled;

        emit MarketSettled(marketId, outcome);
    }


    /**
     * @dev Allows users holding winning shares to redeem them for collateral after settlement.
     * Replaces claimReward. Assumes 1 winning share redeems for 1 unit of collateral (e.g., 1 ETH).
     * @param marketId ID of the market.
     */
    function redeemWinnings(uint256 marketId) external {
        Market storage market = markets[marketId];

        require(market.id != 0, "Market does not exist");
        require(market.status == MarketStatus.Settled, "Market is not settled");
        require(market.outcome == Outcome.Yes || market.outcome == Outcome.No, "Market outcome not valid");

        // Determine the winning outcome index (0 for No, 1 for Yes)
        uint256 winningOutcomeIndex = (market.outcome == Outcome.Yes) ? 1 : 0;

        // Get user's balance of winning shares
        uint256 winningShares = outcomeShares[marketId][msg.sender][winningOutcomeIndex];
        require(winningShares > 0, "No winning shares to redeem");

        // --- Calculate Payout ---
        // Assumption: 1 winning share = 1 unit of collateral (e.g., 1 ether)
        // Adjust multiplier based on collateral token decimals if not ETH.
        uint256 payoutAmount = winningShares; // Assuming 1:1 redemption with ETH collateral (1 wei share = 1 wei ETH)
        // Ensure the pool has enough - though theoretically, it should if AMM math is correct.
        // This check might be redundant if collateralPool tracking is perfect.
        require(market.collateralPool >= payoutAmount, "Insufficient collateral in pool for redemption");

        // --- Update State ---
        // 1. Burn user's winning shares
        outcomeShares[marketId][msg.sender][winningOutcomeIndex] = 0;

        // 2. Update total supply of winning shares
        totalOutcomeShares[marketId][winningOutcomeIndex] -= winningShares;

        // 3. Reduce collateral pool
        market.collateralPool -= payoutAmount;

        // --- Transfer Payout ---
        (bool success, ) = payable(msg.sender).call{value: payoutAmount}("");
        require(success, "Payout transfer failed");

        emit WinningsRedeemed(marketId, msg.sender, winningShares, payoutAmount);
    }


    /**
     * @dev Cancels a market and allows refunding of collateral based on shares held.
     * Needs careful consideration with AMM - how to fairly refund?
     * Simplest: Refund based on current share value? Or refund original collateral (needs tracking)?
     * Let's implement refund based on burning shares at *current* AMM price.
     * @param marketId ID of the market to cancel.
     */
    function cancelMarket(uint256 marketId) external onlyOwner {
        Market storage market = markets[marketId];

        require(market.id != 0, "Market does not exist");
        require(market.status != MarketStatus.Settled && market.status != MarketStatus.Cancelled,
                "Market already settled or cancelled");

        market.status = MarketStatus.Cancelled;
        // Note: No automatic refund here. Users must call a refund function.

        emit MarketCancelled(marketId);
    }

    /**
     * @dev Allows users to claim a refund after a market is cancelled.
     * Burns *all* their shares (Yes and No) for that market and returns collateral
     * based on the AMM price *at the time of calling refund*. Fees apply.
     * @param marketId ID of the cancelled market.
     */
    function claimCancellationRefund(uint256 marketId) external {
         Market storage market = markets[marketId];
         address user = msg.sender;
         require(market.id != 0, "Market does not exist");
         require(market.status == MarketStatus.Cancelled, "Market is not cancelled");

         uint256 sharesYes = outcomeShares[marketId][user][1];
         uint256 sharesNo = outcomeShares[marketId][user][0];
         require(sharesYes > 0 || sharesNo > 0, "No shares held for this market");

         uint256 totalNetRefund = 0;
         uint256 totalPlatformFee = 0;
         uint256 totalCreatorFee = 0;
         uint256 totalGrossRefund = 0; // Track gross for pool adjustment

         // Calculate refund for YES shares (like selling them)
         if (sharesYes > 0) {
             (uint256 grossCollateralYes, uint256 platformFeeYes, uint256 creatorFeeYes, uint256 netCollateralYes) =
                 _calculateCollateralToReturn(marketId, 1, sharesYes, owner(), market.creator);

            if (market.collateralPool >= grossCollateralYes) {
                // Update state for YES shares
                outcomeShares[marketId][user][1] = 0;
                totalOutcomeShares[marketId][1] -= sharesYes;
                market.ammYesShares += sharesYes; // AMM absorbs shares
                market.ammNoShares -= grossCollateralYes; // Pool value updates
                market.collateralPool -= grossCollateralYes; // Actual collateral pool updates

                totalNetRefund += netCollateralYes;
                totalPlatformFee += platformFeeYes;
                totalCreatorFee += creatorFeeYes;
                totalGrossRefund += grossCollateralYes;
            } // else: Not enough collateral in pool for this refund part, skip Yes shares.
              // Consider partial refunds or alternative handling? Simple skip for now.
         }

         // Calculate refund for NO shares (like selling them)
         if (sharesNo > 0) {
             (uint256 grossCollateralNo, uint256 platformFeeNo, uint256 creatorFeeNo, uint256 netCollateralNo) =
                 _calculateCollateralToReturn(marketId, 0, sharesNo, owner(), market.creator);

             if (market.collateralPool >= grossCollateralNo) {
                 // Update state for NO shares
                 outcomeShares[marketId][user][0] = 0;
                 totalOutcomeShares[marketId][0] -= sharesNo;
                 market.ammNoShares += sharesNo; // AMM absorbs shares
                 market.ammYesShares -= grossCollateralNo; // Pool value updates
                 market.collateralPool -= grossCollateralNo; // Actual collateral pool updates

                 totalNetRefund += netCollateralNo;
                 totalPlatformFee += platformFeeNo;
                 totalCreatorFee += creatorFeeNo;
                 totalGrossRefund += grossCollateralNo;
             } // else: Not enough collateral, skip No shares.
         }

         require(totalGrossRefund > 0, "Could not calculate any refund (maybe insufficient pool)");

         // --- Transfer Payout & Fees ---
         if (totalNetRefund > 0) {
              (bool successUser, ) = payable(user).call{value: totalNetRefund}("");
              require(successUser, "Net refund transfer failed");
         }
          if (totalPlatformFee > 0) {
             (bool successPlatform, ) = payable(owner()).call{value: totalPlatformFee}("");
             require(successPlatform, "Platform fee transfer failed");
         }
         if (totalCreatorFee > 0) {
              (bool successCreator, ) = payable(market.creator).call{value: totalCreatorFee}("");
              require(successCreator, "Creator fee transfer failed");
         }

         // Emit event? Need a new one like MarketRefundClaimed(marketId, user, totalNetRefund);
    }


    /**
     * @dev Updates the platform fee. Note: Fee logic needs AMM integration.
     * @param newFee New platform fee in basis points
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%"); // Max fee 10%
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    // --- View Functions ---

    /**
     * @dev Get a user's share balance for a specific outcome in a market.
     * @param marketId ID of the market.
     * @param user Address of the user.
     * @param outcomeIndex Outcome index (0 for No, 1 for Yes).
     */
    function getUserShares(uint256 marketId, address user, uint256 outcomeIndex) external view returns (uint256) {
         require(marketId < nextMarketId, "Market does not exist");
         require(outcomeIndex == 0 || outcomeIndex == 1, "Invalid outcome index");
         return outcomeShares[marketId][user][outcomeIndex];
    }

    /**
     * @dev Get the total supply of shares for a specific outcome in a market.
     * @param marketId ID of the market.
     * @param outcomeIndex Outcome index (0 for No, 1 for Yes).
     */
    function getTotalShares(uint256 marketId, uint256 outcomeIndex) external view returns (uint256) {
         require(marketId < nextMarketId, "Market does not exist");
         require(outcomeIndex == 0 || outcomeIndex == 1, "Invalid outcome index");
         return totalOutcomeShares[marketId][outcomeIndex];
    }

    /**
     * @dev Get the total collateral held in the market's AMM pool.
     * @param marketId ID of the market.
     */
    function getCollateralBalance(uint256 marketId) external view returns (uint256) {
        require(markets[marketId].id != 0, "Market does not exist");
        return markets[marketId].collateralPool;
        // OR return address(this).balance if only using ETH and no explicit pool tracking
    }

    /**
     * @dev Placeholder: Calculates the current price to buy one full share of an outcome.
     * TODO: Implement actual AMM logic (derivative of cost function).
     * @param marketId ID of the market.
     * @param outcomeIndex Outcome index (0 for No, 1 for Yes).
     */
    function getOutcomeSharePrice(uint256 marketId, uint256 outcomeIndex) external view returns (uint256 price) {
         Market storage market = markets[marketId];
         require(market.id != 0, "Market does not exist");
         require(outcomeIndex == 0 || outcomeIndex == 1, "Invalid outcome index");

         // --- CPMM Price Calculation: Price = other_reserve / total_reserves ---
         uint256 ammYes = market.ammYesShares;
         uint256 ammNo = market.ammNoShares;
         uint256 totalReserves = ammYes + ammNo;

         require(totalReserves > 0, "Cannot calculate price with zero total reserves"); // Should not happen after init

         if (outcomeIndex == 1) { // Price of YES share
             // Price = ammNo / (ammYes + ammNo)
             price = (ammNo * PRICE_PRECISION) / totalReserves;
         } else { // Price of NO share
              // Price = ammYes / (ammYes + ammNo)
             price = (ammYes * PRICE_PRECISION) / totalReserves;
         }
         // Price is returned with PRICE_PRECISION (1e18)

         return price;
    }


    /**
     * @dev Get static market details.
     * @param marketId ID of the market.
     */
     // Renamed function to avoid conflict with mapping name
    function getMarketInfo(uint256 marketId) external view returns (
        uint256 id,
        string memory question,
        uint256 creationTime,
        uint256 expirationTime,
        uint256 settlementTime,
        MarketStatus status,
        Outcome outcome,
        string memory category,
        address creator,
        DataSourceType dataSourceType
        // Add other relevant static fields if needed
    ) {
        Market storage market = markets[marketId];
        require(market.id != 0, "Market does not exist");

        return (
            market.id,
            market.question,
            market.creationTime,
            market.expirationTime,
            market.settlementTime,
            market.status,
            market.outcome,
            market.category,
            market.creator,
            market.dataSourceType
        );
    }


    // REMOVED: getUserBets, getMarketParticipants, getMarketStats as they are replaced
    // by new view functions (getUserShares, getTotalShares, AMM state).


    // ... (getMarkets remains similar, but returns the modified Market struct) ...
    /**
     * @dev Get all markets (paginated)
     * @param offset Starting index
     * @param limit Maximum number of items to return
     */
    function getMarkets(uint256 offset, uint256 limit) external view returns (Market[] memory) {
        uint256 totalMarkets = nextMarketId - 1;
        if (offset >= totalMarkets) {
            return new Market[](0);
        }

        uint256 count = (offset + limit > totalMarkets) ? (totalMarkets - offset) : limit;
        Market[] memory result = new Market[](count);

        for (uint i = 0; i < count; i++) {
            result[i] = markets[offset + i + 1]; // remember that ids start at 1
        }

        return result;
    }


    // --- Chainlink Automation ---

    /**
     * @dev Required function for Chainlink Automation compatibility
     * Checks for markets needing locking or settlement triggering.
     */
    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory performData) {
        // Limit loop iterations for gas safety
        uint256 maxIterations = 50; // Adjust as needed
        uint256 iterations = 0;

        uint256[] memory marketsToProcess = new uint256[](maxIterations); // Max markets to process per run
        uint256 count = 0;

        upkeepNeeded = false; // Assume false initially

        // Iterate backwards from the latest market for efficiency (recent markets more likely to need action)
        for (uint256 i = nextMarketId - 1; i >= 1 && iterations < maxIterations; i--) {
            iterations++;
            Market storage market = markets[i];

             // Condition 1: Lock open markets past expiration time
            if (market.status == MarketStatus.Open && block.timestamp >= market.expirationTime) {
                marketsToProcess[count++] = i;
                upkeepNeeded = true;
            }
            // Condition 2: Trigger settlement process for locked markets past settlement time
            else if (market.status == MarketStatus.Locked && block.timestamp >= market.settlementTime) {
                 // Check if settlement data request is needed (External API) or direct determination (Price Feed)
                 bool needsProcessing = false;
                 if (market.dataSourceType == DataSourceType.ChainlinkPriceFeed) {
                     needsProcessing = true; // Price feed outcome determined directly in performUpkeep
                 } else if (market.dataSourceType == DataSourceType.ExternalAPI) {
                     // Only need upkeep if data hasn't been requested OR if result is ready
                     if (market.settlementRequestId == bytes32(0)) {
                         needsProcessing = true; // Need to request data
                     } else {
                         // Check if the result is ready in the oracle (needs view function in ExternalAPIOracle)
                         // bool isResultReady = externalApiOracle.isResultReady(market.settlementRequestId); // Assuming function exists
                         // if (isResultReady) needsProcessing = true;

                         // TEMPORARY: Assume we always check if request ID exists, performUpkeep handles readiness
                         needsProcessing = true;
                     }
                 }

                 if (needsProcessing) {
                    marketsToProcess[count++] = i;
                    upkeepNeeded = true;
                 }
            }

            if (count >= maxIterations) break; // Stop if we hit the process limit
        }

        // Prepare performData only if needed
        if (upkeepNeeded) {
            // Trim the array to the actual count
            uint256[] memory finalMarkets = new uint256[](count);
            for(uint j = 0; j < count; j++) {
                finalMarkets[j] = marketsToProcess[j];
            }
            performData = abi.encode(finalMarkets); // Encode only the IDs that need processing
        } else {
            performData = bytes(""); // Return empty bytes if no upkeep needed
        }

        return (upkeepNeeded, performData);
    }

    /**
     * @dev Function called by Chainlink Automation to lock or settle markets.
     * Handles locking, requesting data from External API, or settling based on Oracle result.
     */
    function performUpkeep(bytes calldata performData) external override {
        // Ensure caller is a Chainlink Automation registry or owner (for testing)
        // require(msg.sender == AUTOMATION_REGISTRY || msg.sender == owner(), "Caller not authorized");

        uint256[] memory marketIds = abi.decode(performData, (uint256[]));

        for (uint i = 0; i < marketIds.length; i++) {
            uint256 marketId = marketIds[i];
            Market storage market = markets[marketId];

            // --- Action 1: Lock Market ---
            if (market.status == MarketStatus.Open && block.timestamp >= market.expirationTime) {
                market.status = MarketStatus.Locked;
                emit MarketLocked(marketId);
                // Market is now locked, continue to next iteration or check settlement
            }

            // --- Action 2: Process Settlement ---
            // Re-check status as it might have just been locked above
            if (market.status == MarketStatus.Locked && block.timestamp >= market.settlementTime) {
                if (market.dataSourceType == DataSourceType.ChainlinkPriceFeed) {
                    // --- Settle via Chainlink Price Feed ---
                    Outcome outcome = Outcome.NoOutcome; // Default
                    try chainlinkDataFeedOracle.isAboveThreshold(market.feedOrEndpointId, int256(market.resolutionCriteria)) returns (bool isAbove) {
                        outcome = isAbove ? Outcome.Yes : Outcome.No;
                    } catch {
                        // Oracle error - ماذا نفعل؟ Cancel market? Re-try later? Log error?
                        // For now, do nothing, will be picked up in next upkeep check.
                        // Consider adding an error state or cancellation logic here.
                        continue; // Skip settlement for this market on this run
                    }

                    if (outcome != Outcome.NoOutcome) {
                        market.outcome = outcome;
                        market.status = MarketStatus.Settled;
                        emit MarketSettled(marketId, outcome);
                    }

                } else if (market.dataSourceType == DataSourceType.ExternalAPI) {
                    // --- Settle via External API Oracle ---
                    if (market.settlementRequestId == bytes32(0)) {
                        // Request data if not already requested
                        // TODO: Need to get API URL, Path, Payment - these should be stored/derivable per market!
                        // For now, using placeholders. This is a critical missing piece.
                        string memory apiUrl = "https://api.example.com/result"; // Placeholder
                        string memory jsonPath = "data.outcome"; // Placeholder (e.g., path to 0 or 1)
                        uint256 payment = 0; // Placeholder LINK payment (adjust based on oracle fees)

                        try externalApiOracle.requestData(market.feedOrEndpointId, apiUrl, jsonPath, payment) returns (bytes32 requestId) {
                            market.settlementRequestId = requestId;
                            emit SettlementDataRequested(marketId, requestId);
                            // Data requested, settlement will happen in a future upkeep when result is available
                        } catch {
                            // Handle failure to request data (e.g., log, retry, cancel?)
                            // For now, do nothing, will be picked up in next upkeep check.
                             continue; // Skip this market for now
                        }
                    } else {
                        // Data has been requested, check if result is available and settle
                        // TODO: Need a robust way to check readiness in ExternalAPIOracle
                        // bool resultReady;
                        // int256 resultValue;
                        // try externalApiOracle.getResult(market.settlementRequestId) returns (bool ready, int256 value) {
                        //     resultReady = ready;
                        //     resultValue = value;
                        // } catch { continue; /* Error checking result, try next time */ }

                        // TEMPORARY: Assume getOutcomeFromResult works and handles readiness implicitly (not ideal)
                        try externalApiOracle.getOutcomeFromResult(market.settlementRequestId, int256(market.resolutionCriteria)) returns (bool apiResult) {
                             // Result is ready and retrieved
                             Outcome outcome = apiResult ? Outcome.Yes : Outcome.No;
                             market.outcome = outcome;
                             market.status = MarketStatus.Settled;
                             emit MarketSettled(marketId, outcome);
                         } catch {
                             // Result likely not ready yet, or error retrieving.
                             // Do nothing, wait for next upkeep cycle.
                             continue;
                         }
                    }
                }
            }
        }
    }

    // REMOVED: determineOutcomeFromOracle as its logic is integrated into performUpkeep

    // ... (receive function remains) ...
    receive() external payable {}
} 