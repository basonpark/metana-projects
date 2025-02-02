pragma solidity ^0.8.28;

import "./Token.sol";

contract ForgingLogic {

    Token public forgeToken;
    address public owner;

    constructor(address _tokenAddress) {
        forgeToken = Token(_tokenAddress);
        owner = msg.sender;
        forgeToken.setTokenRequirements(3, [0, 1]);
        forgeToken.setTokenRequirements(4, [1, 2]);
        forgeToken.setTokenRequirements(5, [0, 2]);
        forgeToken.setTokenRequirements(6, [0, 1, 2]);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    //only owner can set the forge token address
    function setForgeTokenAddress(address _tokenAddres) public onlyOwner {
        forgeToken = Token(_tokenAddres);
    }

    //function to mint tokens 0-2
    function mintToken(uint256 tokenId, uint256 amount) public {
        forgeToken.mint(tokenId, amount);
    }

    //function to burn tokens 3-6
    function burnToken(uint256 tokenId, uint256 amount) public {
        forgeToken.burn(tokenId, amount);
    }

    //function to forge tokens 3-6
    function forgeToken(uint256 tokenId) public {
        address user = msg.sender;
        require(tokenId >= Token.TOKEN_3 && tokenId <= Token.TOKEN_6, "You can only forge tokens 3-6");
        
        //get required tokens to burn
        uint256[] memory requiredTokens = forgeToken.requiredTokens[tokenId];

        // burn required tokens
        for (uint256 i = 0; i < requiredTokens.length; i++) {
            forgeToken.forgeBurn(user, requiredTokens[i], 1);
        }
        // mint new token
        forgeToken.forgeMint(user, tokenId, 1);
    }

    //function to trade any token for tokens 0-2
    function tradeToken(uint256 fromTokenId, uint256 toTokenId, uint256 amount) public {
        require(fromTokenId != toTokenId, "Cannot trade the same token");
        require(toTokenId <= Token.TOKEN_2, "Only tokens 0-2 can be traded for");
        require(forgeToken.userTokenBalances[msg.sender][fromTokenId] >= amount, "Insufficient balance of token to trade");
        require(forgeToken.userTokenBalances[msg.sender][toTokenId] >= amount, "Insufficient balance of token to trade");

        forgeToken.forgeBurn(msg.sender, fromTokenId, amount);
        forgeToken.forgeMint(msg.sender, toTokenId, amount);
    }

    //function to get all token balances for an address
    function getAllTokenBalances(address user) public view returns (uint256[] memory) {
        return forgeToken.getAllTokenBalances(user);
    }
}
