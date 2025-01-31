pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import '@openzeppelin/contracts/token/access/Ownable.sol';

contract Token is ERC1155, Ownable {

    //constants
    uint public constant TOKEN_0 = 0;
    uint public constant TOKEN_1 = 1;
    uint public constant TOKEN_2 = 2;
    uint public constant TOKEN_3 = 3;
    uint public constant TOKEN_4 = 4;
    uint public constant TOKEN_5 = 5;
    uint public constant TOKEN_6 = 6;

    uint256 public cooldown = 1 minutes;

    string public URI = "https://token.com/api/{id}.json";
    

    //mapping to track last minted time
    mapping(address => uint256) public lastMinted;

    // Mapping from token ID to array of required token IDs for minting
    mapping(uint256 => uint256[]) public requiredTokens;


    // Mapping to track authorized forging contracts
    mapping(address => bool) public authorizedForgers;

    // Mapping from address to array of token balances
    mapping(address => uint256[]) public userTokenBalances;
    

    //constructor sets URI for token metadata
    constructor() ERC1155(URI) {

        // Initialize arrays
        userTokenBalances[msg.sender] = new uint256[](7);
    }

    //function to freely mint tokens 0-2 
    function mint(uint256 tokenId, uint256 amount) public {
        require(tokenId <= TOKEN_2, "Only tokens 0-2 can be minted.");
        require(block.timestamp >= lastMinted[msg.sender] + cooldown, "Mint cooldown of 1 minute must be met.");
        lastMinted[msg.sender] = block.timestamp;
        _mint(msg.sender, tokenId, amount, "");
        userTokenBalances[msg.sender][tokenId] += amount;
    }

    //function to burn tokens 3-6  
    function burn(uint256 tokenId, uint256 amount) public {
        require(tokenId >= TOKEN_3, "Only tokens 3-6 can be burned.");
        _burn(msg.sender, tokenId, amount);
        userTokenBalances[msg.sender][tokenId] -= amount;
    }

    function setApprovalForAll(address operator, bool approved) public {
        _setApprovalForAll(msg.sender, operator, approved);
    }

    function setURI(string memory newURI) public onlyOwner {
        URI = newURI;
        _setURI(newURI);
    }

    function _setURI(string memory newURI) internal override {
        URI = newURI;
    }

    // Function to get required tokens for a specific token ID
    function getRequiredTokens(uint256 tokenId) public view returns (uint256[] memory) {
        return requiredTokens[tokenId];
    }

    // Special mint helper function for forging
    function forgeMint(address to, uint256 tokenId, uint256 amount) external {
        _mint(to, tokenId, amount, "");
        userTokenBalances[to][tokenId] += amount;
    }

    // Special burn helper function for forging
    function forgeBurn(address from, uint256 tokenId, uint256 amount) external {
        _burn(from, tokenId, amount);
        userTokenBalances[from][tokenId] -= amount;
    }
    
    // Gets all token balances for an address
    function getAllTokenBalances(address user) public view returns (uint256[] memory) {
        if (userTokenBalances[user].length == 0) {
            uint256[] memory emptyBalances = new uint256[](7);
            return emptyBalances;
        }
        return userTokenBalances[user];
    }

    function setTokenRequirements(uint256 tokenId, uint256[] memory requirements) external onlyOwner {
        requiredTokens[tokenId] = requirements;
    }

}