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
 * using Chainlink Oracle for data verification and Chainlink Automation for settlement
 */
contract PredictionMarket is Ownable, AutomationCompatibleInterface {
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
        string question;         // The question being predicted (e.g., "Will BTC price be above $100K on Dec 31, 2024?")
        uint256 creationTime;    // When the market was created
        uint256 expirationTime;  // When the market expires and no more bets are accepted
        uint256 settlementTime;  // When the market will be settled
        // Address of the oracle contract (either ChainlinkDataFeed or ExternalAPIOracle)
        address oracleContract;
        // Identifier for the specific data feed or API endpoint within the oracle contract
        bytes32 feedOrEndpointId;
        // Threshold for Price Feed or expected outcome (1 for Yes, 0 for No) for API
        uint256 resolutionCriteria;
        uint256 totalYesAmount;  // Total amount bet on "Yes" outcome
        uint256 totalNoAmount;   // Total amount bet on "No" outcome
        MarketStatus status;     // Current status of the market
        Outcome outcome;         // Final outcome of the market
        string category;         // Category of the market (e.g., "Crypto", "Sports", "Politics")
        address creator;         // Creator of the market
        uint256 fee;             // Fee percentage (in basis points, e.g., 100 = 1%)
        // NEW: Store the type of data source
        DataSourceType dataSourceType;
        // NEW: Store the Chainlink request ID if using ExternalAPIOracle for settlement
        bytes32 settlementRequestId;
    }

    // Structure to represent a user's bet
    struct Bet {
        uint256 marketId;
        address user;
        Outcome prediction;
        uint256 amount;
        bool claimed;
    }

    // State variables
    uint256 private nextMarketId = 1;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Bet[])) public userBets;
    mapping(uint256 => address[]) public marketParticipants;
    
    // Platform fee (in basis points, e.g., 100 = 1%)
    uint256 public platformFee = 100; 
    
    // NEW: References to the oracle contracts
    ChainlinkDataFeed public chainlinkDataFeedOracle;
    ExternalAPIOracle public externalApiOracle;

    // Events
    event MarketCreated(uint256 indexed marketId, address indexed creator, string question, DataSourceType dataSourceType);
    event BetPlaced(uint256 indexed marketId, address indexed user, Outcome prediction, uint256 amount);
    event MarketLocked(uint256 indexed marketId);
    event MarketSettled(uint256 indexed marketId, Outcome outcome);
    event MarketCancelled(uint256 indexed marketId);
    event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    event PlatformFeeUpdated(uint256 newFee);
    event SettlementDataRequested(uint256 indexed marketId, bytes32 requestId);

    // Constructor
    constructor(address _chainlinkDataFeedOracle, address _externalApiOracle) Ownable(msg.sender) {
        require(_chainlinkDataFeedOracle != address(0), "Invalid Chainlink Data Feed Oracle address");
        require(_externalApiOracle != address(0), "Invalid External API Oracle address");
        chainlinkDataFeedOracle = ChainlinkDataFeed(_chainlinkDataFeedOracle);
        externalApiOracle = ExternalAPIOracle(_externalApiOracle);
    }

    /**
     * @dev Creates a new prediction market
     * @param question The question being predicted
     * @param expirationTime When the market expires and no more bets are accepted
     * @param settlementTime When the market will be settled
     * @param dataSourceType Type of data source
     * @param feedOrEndpointId Identifier for the specific data feed or API endpoint
     * @param resolutionCriteria Threshold for Price Feed, Expected value (0 or 1) for API
     * @param category Category of the market
     * @param fee Fee percentage (in basis points)
     */
    function createMarket(
        string memory question,
        uint256 expirationTime,
        uint256 settlementTime,
        DataSourceType dataSourceType,
        bytes32 feedOrEndpointId,
        uint256 resolutionCriteria,
        string memory category,
        uint256 fee
    ) external returns (uint256) {
        // Validate input parameters
        require(expirationTime > block.timestamp, "Expiration time must be in the future");
        require(settlementTime > expirationTime, "Settlement time must be after expiration time");
        require(bytes(question).length > 0, "Question cannot be empty");
        require(fee <= 1000, "Fee cannot exceed 10%"); // Max fee is 10%

        address oracleContractAddress = (dataSourceType == DataSourceType.ChainlinkPriceFeed)
            ? address(chainlinkDataFeedOracle)
            : address(externalApiOracle);

        require(oracleContractAddress != address(0), "Oracle contract not set");

        // Create new market
        uint256 marketId = nextMarketId++;
        markets[marketId] = Market({
            id: marketId,
            question: question,
            creationTime: block.timestamp,
            expirationTime: expirationTime,
            settlementTime: settlementTime,
            oracleContract: oracleContractAddress,
            feedOrEndpointId: feedOrEndpointId,
            resolutionCriteria: resolutionCriteria,
            totalYesAmount: 0,
            totalNoAmount: 0,
            status: MarketStatus.Open,
            outcome: Outcome.NoOutcome,
            category: category,
            creator: msg.sender,
            fee: fee,
            dataSourceType: dataSourceType,
            settlementRequestId: bytes32(0)
        });

        emit MarketCreated(marketId, msg.sender, question, dataSourceType);
        return marketId;
    }

    /**
     * @dev Places a bet on a market
     * @param marketId ID of the market
     * @param prediction User's prediction (Yes or No)
     */
    function placeBet(uint256 marketId, Outcome prediction) external payable {
        // Get the market
        Market storage market = markets[marketId];
        
        // Validate bet conditions
        require(market.id != 0, "Market does not exist");
        require(market.status == MarketStatus.Open, "Market is not open for bets");
        require(block.timestamp < market.expirationTime, "Market has expired");
        require(prediction == Outcome.Yes || prediction == Outcome.No, "Invalid prediction");
        require(msg.value > 0, "Bet amount must be greater than 0");

        // Update market totals
        if (prediction == Outcome.Yes) {
            market.totalYesAmount += msg.value;
        } else {
            market.totalNoAmount += msg.value;
        }

        // Add user to participants if first bet
        bool isNewParticipant = true;
        for (uint i = 0; i < marketParticipants[marketId].length; i++) {
            if (marketParticipants[marketId][i] == msg.sender) {
                isNewParticipant = false;
                break;
            }
        }
        
        if (isNewParticipant) {
            marketParticipants[marketId].push(msg.sender);
        }

        // Record the bet
        userBets[marketId][msg.sender].push(Bet({
            marketId: marketId,
            user: msg.sender,
            prediction: prediction,
            amount: msg.value,
            claimed: false
        }));

        emit BetPlaced(marketId, msg.sender, prediction, msg.value);
    }

    /**
     * @dev Locks a market when it expires so no more bets can be placed
     * @param marketId ID of the market to lock
     */
    function lockMarket(uint256 marketId) external {
        Market storage market = markets[marketId];
        
        require(market.id != 0, "Market does not exist");
        require(market.status == MarketStatus.Open, "Market is not open");
        require(block.timestamp >= market.expirationTime, "Market has not expired yet");
        
        market.status = MarketStatus.Locked;
        
        emit MarketLocked(marketId);
    }

    /**
     * @dev Settles a market by determining the outcome
     * @param marketId ID of the market to settle
     * @param outcome The final outcome of the market
     */
    function settleMarket(uint256 marketId, Outcome outcome) external onlyOwner {
        Market storage market = markets[marketId];
        
        require(market.id != 0, "Market does not exist");
        require(market.status == MarketStatus.Locked, "Market is not locked");
        require(block.timestamp >= market.settlementTime, "Settlement time not reached");
        require(outcome == Outcome.Yes || outcome == Outcome.No, "Invalid outcome");
        
        market.outcome = outcome;
        market.status = MarketStatus.Settled;
        
        emit MarketSettled(marketId, outcome);
    }

    /**
     * @dev Allows users to claim their rewards after market settlement
     * @param marketId ID of the market
     */
    function claimReward(uint256 marketId) external {
        Market storage market = markets[marketId];
        
        require(market.id != 0, "Market does not exist");
        require(market.status == MarketStatus.Settled, "Market is not settled");
        
        Bet[] storage bets = userBets[marketId][msg.sender];
        uint256 totalReward = 0;
        
        for (uint i = 0; i < bets.length; i++) {
            Bet storage bet = bets[i];
            
            if (!bet.claimed && bet.prediction == market.outcome) {
                bet.claimed = true;
                
                // Calculate reward based on odds
                uint256 totalPool = market.totalYesAmount + market.totalNoAmount;
                uint256 winningPool = (market.outcome == Outcome.Yes) 
                    ? market.totalYesAmount 
                    : market.totalNoAmount;
                uint256 losingPool = totalPool - winningPool;
                
                // Calculate platform fee
                uint256 platformFeeAmount = (losingPool * platformFee) / 10000;
                uint256 creatorFeeAmount = (losingPool * market.fee) / 10000;
                uint256 availablePool = losingPool - platformFeeAmount - creatorFeeAmount;
                
                // Calculate user's share of the winning pool
                uint256 userShareOfWinningPool = (bet.amount * 1e18) / winningPool;
                uint256 reward = bet.amount + (availablePool * userShareOfWinningPool) / 1e18;
                
                totalReward += reward;
            }
        }
        
        require(totalReward > 0, "No rewards to claim");
        
        (bool success, ) = payable(msg.sender).call{value: totalReward}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(marketId, msg.sender, totalReward);
    }

    /**
     * @dev Cancels a market and refunds all participants
     * @param marketId ID of the market to cancel
     */
    function cancelMarket(uint256 marketId) external onlyOwner {
        Market storage market = markets[marketId];
        
        require(market.id != 0, "Market does not exist");
        require(market.status != MarketStatus.Settled && market.status != MarketStatus.Cancelled, 
                "Market already settled or cancelled");
        
        market.status = MarketStatus.Cancelled;
        
        // Refund all participants
        address[] memory participants = marketParticipants[marketId];
        for (uint i = 0; i < participants.length; i++) {
            address participant = participants[i];
            Bet[] storage bets = userBets[marketId][participant];
            
            uint256 totalRefund = 0;
            for (uint j = 0; j < bets.length; j++) {
                if (!bets[j].claimed) {
                    bets[j].claimed = true;
                    totalRefund += bets[j].amount;
                }
            }
            
            if (totalRefund > 0) {
                payable(participant).transfer(totalRefund);
            }
        }
        
        emit MarketCancelled(marketId);
    }

    /**
     * @dev Updates the platform fee
     * @param newFee New platform fee in basis points
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%"); // Max fee is 10%
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    /**
     * @dev Get user bets for a specific market
     * @param marketId ID of the market
     * @param user Address of the user
     */
    function getUserBets(uint256 marketId, address user) external view returns (Bet[] memory) {
        return userBets[marketId][user];
    }

    /**
     * @dev Get all participants for a market
     * @param marketId ID of the market
     */
    function getMarketParticipants(uint256 marketId) external view returns (address[] memory) {
        return marketParticipants[marketId];
    }

    /**
     * @dev Get statistics for a market
     * @param marketId ID of the market
     */
    function getMarketStats(uint256 marketId) external view returns (
        uint256 totalBets,
        uint256 totalYesAmount,
        uint256 totalNoAmount,
        uint256 participantCount
    ) {
        Market storage market = markets[marketId];
        require(market.id != 0, "Market does not exist");
        
        totalYesAmount = market.totalYesAmount;
        totalNoAmount = market.totalNoAmount;
        participantCount = marketParticipants[marketId].length;
        
        // Count total bets
        for (uint i = 0; i < participantCount; i++) {
            address participant = marketParticipants[marketId][i];
            totalBets += userBets[marketId][participant].length;
        }
        
        return (totalBets, totalYesAmount, totalNoAmount, participantCount);
    }

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

    /**
     * @dev Required function for Chainlink Automation compatibility
     */
    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory performData) {
        uint256[] memory marketsToProcess = new uint256[](nextMarketId - 1);
        uint256 count = 0;
        
        // Find markets that need to be locked or settled
        for (uint256 i = 1; i < nextMarketId; i++) {
            Market storage market = markets[i];
            
            if (market.status == MarketStatus.Open && block.timestamp >= market.expirationTime) {
                // Market needs to be locked
                marketsToProcess[count++] = i;
                upkeepNeeded = true;
            }
            else if (market.status == MarketStatus.Locked && block.timestamp >= market.settlementTime) {
                // Market needs to be settled
                marketsToProcess[count++] = i;
                upkeepNeeded = true;
            }
        }
        
        // Prepare performData with market IDs that need processing
        if (upkeepNeeded) {
            bytes memory encodedMarketIds = abi.encode(marketsToProcess, count);
            performData = encodedMarketIds;
        }
        
        return (upkeepNeeded, performData);
    }
    
    /**
     * @dev Function called by Chainlink Automation to lock or settle markets
     */
    function performUpkeep(bytes calldata performData) external override {
        (uint256[] memory marketIds, uint256 count) = abi.decode(performData, (uint256[], uint256));
        
        for (uint i = 0; i < count; i++) {
            uint256 marketId = marketIds[i];
            Market storage market = markets[marketId];
            
            if (market.status == MarketStatus.Open && block.timestamp >= market.expirationTime) {
                // Lock the market
                market.status = MarketStatus.Locked;
                emit MarketLocked(marketId);
            }
            else if (market.status == MarketStatus.Locked && block.timestamp >= market.settlementTime) {
                // --- Settlement Logic --- 
                if (market.dataSourceType == DataSourceType.ChainlinkPriceFeed) {
                    // Price Feed: Determine outcome directly
                    Outcome outcome = determineOutcomeFromOracle(marketId);
                    if (outcome != Outcome.NoOutcome) { // Handle potential oracle errors
                         market.outcome = outcome;
                         market.status = MarketStatus.Settled;
                         emit MarketSettled(marketId, outcome);
                    }
                    // Consider adding logic here if the oracle fails (e.g., cancel market)

                } else if (market.dataSourceType == DataSourceType.ExternalAPI) {
                   // External API: Request data if not already requested
                   if (market.settlementRequestId == bytes32(0)) {
                       // *** IMPORTANT: Need API URL and JSON Path ***
                       // These need to be stored or derivable for the market.
                       // For now, we'll assume placeholder values. Replace with actual logic.
                       string memory apiUrl = "https://gamma-api.example/market_result"; // Placeholder
                       string memory jsonPath = "result"; // Placeholder (e.g., path to 0 or 1)
                       uint256 payment = 0.1 ether; // Placeholder LINK payment (adjust based on network)

                       try externalApiOracle.requestData(market.feedOrEndpointId, apiUrl, jsonPath, payment) returns (bytes32 requestId) {
                           market.settlementRequestId = requestId;
                           emit SettlementDataRequested(marketId, requestId);
                       } catch {
                           // Handle failure to request data (e.g., log, retry later, cancel market?)
                       }
                   } else {
                       // Check if the external API oracle has received the response
                       // Use getOutcomeFromResult, assuming API returns 0 or 1
                       bool apiResult = externalApiOracle.getOutcomeFromResult(market.settlementRequestId, int256(market.resolutionCriteria));
                       // Need to handle the case where the result is not yet available in ExternalAPIOracle
                       // For simplicity, we assume it's available here. Add checks in production.
                       Outcome outcome = apiResult ? Outcome.Yes : Outcome.No;

                       market.outcome = outcome;
                       market.status = MarketStatus.Settled;
                       emit MarketSettled(marketId, outcome);
                   }
                }
            }
        }
    }
    
    /**
     * @dev Function using real Chainlink Oracle to determine market outcomes
     * This replaces the mock implementation
     */
    function determineOutcomeFromOracle(uint256 marketId) internal view returns (Outcome) {
        Market storage market = markets[marketId];
        
        if (market.dataSourceType == DataSourceType.ChainlinkPriceFeed) {
            // === Chainlink Price Feed Logic ===
            try chainlinkDataFeedOracle.isAboveThreshold(market.feedOrEndpointId, int256(market.resolutionCriteria)) returns (bool isAbove) {
                return isAbove ? Outcome.Yes : Outcome.No;
            } catch {
                // Handle oracle error (e.g., feed down)
                return Outcome.NoOutcome;
            }
        } else if (market.dataSourceType == DataSourceType.ExternalAPI) {
             // === External API Logic ===
             // This function is now only called directly for Price Feeds during settlement.
             // For APIs, performUpkeep checks the result *after* the externalApiOracle receives it.
             // We could add a view function here to check the *latest* stored API result if needed,
             // but settlement relies on the check in performUpkeep based on the specific settlementRequestId.
             revert("determineOutcomeFromOracle not applicable for ExternalAPI type during direct call");
        } else {
             return Outcome.NoOutcome; // Should not happen
        }
    }
    
    /**
     * @dev Function to receive Ether
     */
    receive() external payable {}
} 