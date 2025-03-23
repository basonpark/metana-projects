// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

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

    // Structure to represent a prediction market
    struct Market {
        uint256 id;
        string question;         // The question being predicted (e.g., "Will BTC price be above $100K on Dec 31, 2024?")
        uint256 creationTime;    // When the market was created
        uint256 expirationTime;  // When the market expires and no more bets are accepted
        uint256 settlementTime;  // When the market will be settled
        address oracle;          // Chainlink oracle or other data source
        bytes32 dataFeedId;      // Identifier for the Chainlink data feed
        uint256 threshold;       // Value to compare with the oracle result (e.g., price threshold)
        uint256 totalYesAmount;  // Total amount bet on "Yes" outcome
        uint256 totalNoAmount;   // Total amount bet on "No" outcome
        MarketStatus status;     // Current status of the market
        Outcome outcome;         // Final outcome of the market
        string category;         // Category of the market (e.g., "Crypto", "Sports", "Politics")
        address creator;         // Creator of the market
        uint256 fee;             // Fee percentage (in basis points, e.g., 100 = 1%)
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
    
    // Events
    event MarketCreated(uint256 indexed marketId, address indexed creator, string question);
    event BetPlaced(uint256 indexed marketId, address indexed user, Outcome prediction, uint256 amount);
    event MarketLocked(uint256 indexed marketId);
    event MarketSettled(uint256 indexed marketId, Outcome outcome);
    event MarketCancelled(uint256 indexed marketId);
    event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    event PlatformFeeUpdated(uint256 newFee);

    // Constructor
    constructor() Ownable(msg.sender) {
        // Initialize the contract
    }

    /**
     * @dev Creates a new prediction market
     * @param question The question being predicted
     * @param expirationTime When the market expires and no more bets are accepted
     * @param settlementTime When the market will be settled
     * @param oracle Chainlink oracle or other data source
     * @param dataFeedId Identifier for the Chainlink data feed
     * @param threshold Value to compare with the oracle result
     * @param category Category of the market
     * @param fee Fee percentage (in basis points)
     */
    function createMarket(
        string memory question,
        uint256 expirationTime,
        uint256 settlementTime,
        address oracle,
        bytes32 dataFeedId,
        uint256 threshold,
        string memory category,
        uint256 fee
    ) external returns (uint256) {
        // Validate input parameters
        require(expirationTime > block.timestamp, "Expiration time must be in the future");
        require(settlementTime > expirationTime, "Settlement time must be after expiration time");
        require(bytes(question).length > 0, "Question cannot be empty");
        require(fee <= 1000, "Fee cannot exceed 10%"); // Max fee is 10%

        // Create new market
        uint256 marketId = nextMarketId++;
        markets[marketId] = Market({
            id: marketId,
            question: question,
            creationTime: block.timestamp,
            expirationTime: expirationTime,
            settlementTime: settlementTime,
            oracle: oracle,
            dataFeedId: dataFeedId,
            threshold: threshold,
            totalYesAmount: 0,
            totalNoAmount: 0,
            status: MarketStatus.Open,
            outcome: Outcome.NoOutcome,
            category: category,
            creator: msg.sender,
            fee: fee
        });

        emit MarketCreated(marketId, msg.sender, question);
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
            result[i] = markets[offset + i + 1]; // +1 because market IDs start at 1
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
                // Here we'd normally query the Chainlink oracle for the result
                // For simplicity, we'll determine the outcome based on the threshold and some external data
                // In a real implementation, you'd use a Chainlink oracle to get the actual data
                
                // Mock oracle result - should be replaced with actual Chainlink oracle call
                Outcome outcome = determineOutcomeFromOracle(marketId);
                
                market.outcome = outcome;
                market.status = MarketStatus.Settled;
                emit MarketSettled(marketId, outcome);
            }
        }
    }
    
    /**
     * @dev Mock function to simulate fetching data from Chainlink Oracle
     * In a real implementation, this would query the actual Chainlink oracle
     */
    function determineOutcomeFromOracle(uint256 marketId) internal view returns (Outcome) {
        Market storage market = markets[marketId];
        
        // In a real implementation, you'd use Chainlink to get this data
        // For this example, we'll just use a simple mock based on market ID
        uint256 mockOracleValue = uint256(keccak256(abi.encodePacked(block.timestamp, marketId))) % 1000;
        
        if (mockOracleValue > market.threshold) {
            return Outcome.Yes;
        } else {
            return Outcome.No;
        }
    }
    
    /**
     * @dev Function to receive Ether
     */
    receive() external payable {}
} 