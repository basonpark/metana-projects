// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PredictionMarket.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PredictionMarketFactory
 * @dev Factory contract to create and manage prediction markets
 * This allows for easier discovery and management of markets
 */
contract PredictionMarketFactory is Ownable {
    // Array of all markets created
    address[] public markets;
    
    // Categories for markets
    string[] public categories;
    
    // Mapping from category to markets in that category
    mapping(string => address[]) public marketsByCategory;
    
    // Mapping from market address to its category
    mapping(address => string) public marketCategory;
    
    // Mapping from market address to its creator
    mapping(address => address) public marketCreator;
    
    // Mapping from creator address to their markets
    mapping(address => address[]) public creatorMarkets;
    
    // Events
    event MarketCreated(address indexed market, address indexed creator, string question, string category);
    event CategoryAdded(string category);
    
    // Constructor
    constructor() Ownable(msg.sender) {
        // Add default categories
        addCategory("Crypto");
        addCategory("Sports");
        addCategory("Politics");
        addCategory("Finance");
        addCategory("Entertainment");
        addCategory("Other");
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
     * @return The address of the newly created market
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
    ) external returns (address) {
        // Validate inputs
        require(expirationTime > block.timestamp, "Expiration time must be in the future");
        require(settlementTime > expirationTime, "Settlement time must be after expiration time");
        require(bytes(question).length > 0, "Question cannot be empty");
        require(isCategoryValid(category), "Invalid category");
        require(fee <= 1000, "Fee cannot exceed 10%"); // Max fee is 10%
        
        // Create new market
        PredictionMarket market = new PredictionMarket();
        
        // Initialize the market
        uint256 marketId = market.createMarket(
            question,
            expirationTime,
            settlementTime,
            oracle,
            dataFeedId,
            threshold,
            category,
            fee
        );
        
        // Transfer ownership to the factory
        // This allows the factory to manage the market
        market.transferOwnership(address(this));
        
        // Add market to tracking
        address marketAddress = address(market);
        markets.push(marketAddress);
        marketsByCategory[category].push(marketAddress);
        marketCategory[marketAddress] = category;
        marketCreator[marketAddress] = msg.sender;
        creatorMarkets[msg.sender].push(marketAddress);
        
        emit MarketCreated(marketAddress, msg.sender, question, category);
        
        return marketAddress;
    }
    
    /**
     * @dev Adds a new category
     * @param category New category to add
     */
    function addCategory(string memory category) public onlyOwner {
        // Check if category already exists
        for (uint i = 0; i < categories.length; i++) {
            if (keccak256(bytes(categories[i])) == keccak256(bytes(category))) {
                return; // Category already exists
            }
        }
        
        categories.push(category);
        emit CategoryAdded(category);
    }
    
    /**
     * @dev Checks if a category is valid
     * @param category Category to check
     * @return True if the category exists, false otherwise
     */
    function isCategoryValid(string memory category) public view returns (bool) {
        for (uint i = 0; i < categories.length; i++) {
            if (keccak256(bytes(categories[i])) == keccak256(bytes(category))) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Gets the number of markets
     * @return The total number of markets created
     */
    function getMarketCount() external view returns (uint256) {
        return markets.length;
    }
    
    /**
     * @dev Gets all markets (paginated)
     * @param offset Starting index
     * @param limit Maximum number of items to return
     * @return Array of market addresses
     */
    function getMarkets(uint256 offset, uint256 limit) external view returns (address[] memory) {
        if (offset >= markets.length) {
            return new address[](0);
        }
        
        uint256 count = (offset + limit > markets.length) ? (markets.length - offset) : limit;
        address[] memory result = new address[](count);
        
        for (uint i = 0; i < count; i++) {
            result[i] = markets[offset + i];
        }
        
        return result;
    }
    
    /**
     * @dev Gets markets by category (paginated)
     * @param category Category to filter by
     * @param offset Starting index
     * @param limit Maximum number of items to return
     * @return Array of market addresses in the specified category
     */
    function getMarketsByCategory(string memory category, uint256 offset, uint256 limit) 
        external view returns (address[] memory) 
    {
        address[] storage categoryMarkets = marketsByCategory[category];
        
        if (offset >= categoryMarkets.length) {
            return new address[](0);
        }
        
        uint256 count = (offset + limit > categoryMarkets.length) ? 
                        (categoryMarkets.length - offset) : limit;
        address[] memory result = new address[](count);
        
        for (uint i = 0; i < count; i++) {
            result[i] = categoryMarkets[offset + i];
        }
        
        return result;
    }
    
    /**
     * @dev Gets markets created by a specific address (paginated)
     * @param creator Creator address
     * @param offset Starting index
     * @param limit Maximum number of items to return
     * @return Array of market addresses created by the specified address
     */
    function getMarketsByCreator(address creator, uint256 offset, uint256 limit) 
        external view returns (address[] memory) 
    {
        address[] storage creatorMarketsList = creatorMarkets[creator];
        
        if (offset >= creatorMarketsList.length) {
            return new address[](0);
        }
        
        uint256 count = (offset + limit > creatorMarketsList.length) ? 
                        (creatorMarketsList.length - offset) : limit;
        address[] memory result = new address[](count);
        
        for (uint i = 0; i < count; i++) {
            result[i] = creatorMarketsList[offset + i];
        }
        
        return result;
    }
    
    /**
     * @dev Gets all available categories
     * @return Array of category names
     */
    function getCategories() external view returns (string[] memory) {
        return categories;
    }
} 