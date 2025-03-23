// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ChainlinkDataFeed
 * @dev Contract to interact with Chainlink data feeds for real-world data
 * This contract serves as an adapter between our prediction market and Chainlink oracles
 */
contract ChainlinkDataFeed is Ownable {
    // Mapping from data feed ID to Chainlink Aggregator address
    mapping(bytes32 => address) public dataFeeds;
    
    // Events
    event DataFeedAdded(bytes32 indexed id, address indexed aggregator, string description);
    event DataFeedUpdated(bytes32 indexed id, address indexed aggregator);
    event DataFeedRemoved(bytes32 indexed id);
    
    // Constructor
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Adds a new data feed
     * @param id Unique identifier for the data feed
     * @param aggregator Address of the Chainlink aggregator
     * @param description Human-readable description of the data feed
     */
    function addDataFeed(bytes32 id, address aggregator, string memory description) external onlyOwner {
        require(dataFeeds[id] == address(0), "Data feed already exists");
        require(aggregator != address(0), "Invalid aggregator address");
        
        dataFeeds[id] = aggregator;
        emit DataFeedAdded(id, aggregator, description);
    }
    
    /**
     * @dev Updates an existing data feed
     * @param id Identifier of the data feed to update
     * @param aggregator New address of the Chainlink aggregator
     */
    function updateDataFeed(bytes32 id, address aggregator) external onlyOwner {
        require(dataFeeds[id] != address(0), "Data feed does not exist");
        require(aggregator != address(0), "Invalid aggregator address");
        
        dataFeeds[id] = aggregator;
        emit DataFeedUpdated(id, aggregator);
    }
    
    /**
     * @dev Removes a data feed
     * @param id Identifier of the data feed to remove
     */
    function removeDataFeed(bytes32 id) external onlyOwner {
        require(dataFeeds[id] != address(0), "Data feed does not exist");
        
        delete dataFeeds[id];
        emit DataFeedRemoved(id);
    }
    
    /**
     * @dev Gets the latest price data from a Chainlink data feed
     * @param id Identifier of the data feed
     * @return The latest price, with the decimal precision of the specific feed
     */
    function getLatestPrice(bytes32 id) external view returns (int256) {
        address aggregator = dataFeeds[id];
        require(aggregator != address(0), "Data feed does not exist");
        
        AggregatorV3Interface feed = AggregatorV3Interface(aggregator);
        (
            /* uint80 roundID */,
            int256 price,
            /* uint startedAt */,
            /* uint timeStamp */,
            /* uint80 answeredInRound */
        ) = feed.latestRoundData();
        
        return price;
    }
    
    /**
     * @dev Gets the decimal precision of a data feed
     * @param id Identifier of the data feed
     * @return The number of decimals used by the data feed
     */
    function getDecimals(bytes32 id) external view returns (uint8) {
        address aggregator = dataFeeds[id];
        require(aggregator != address(0), "Data feed does not exist");
        
        AggregatorV3Interface feed = AggregatorV3Interface(aggregator);
        return feed.decimals();
    }
    
    /**
     * @dev Gets the description of a data feed
     * @param id Identifier of the data feed
     * @return The description of the data feed
     */
    function getDescription(bytes32 id) external view returns (string memory) {
        address aggregator = dataFeeds[id];
        require(aggregator != address(0), "Data feed does not exist");
        
        AggregatorV3Interface feed = AggregatorV3Interface(aggregator);
        return feed.description();
    }
    
    /**
     * @dev Gets whether a value is above a threshold
     * @param id Identifier of the data feed
     * @param threshold The value to compare against
     * @return True if the latest price > threshold, false otherwise
     */
    function isAboveThreshold(bytes32 id, int256 threshold) external view returns (bool) {
        int256 latestPrice = this.getLatestPrice(id);
        return latestPrice > threshold;
    }
    
    /**
     * @dev Gets whether a value is below a threshold
     * @param id Identifier of the data feed
     * @param threshold The value to compare against
     * @return True if the latest price < threshold, false otherwise
     */
    function isBelowThreshold(bytes32 id, int256 threshold) external view returns (bool) {
        int256 latestPrice = this.getLatestPrice(id);
        return latestPrice < threshold;
    }
} 