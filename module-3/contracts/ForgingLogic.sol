// SPDX-License-Identifier: MIT  
pragma solidity ^0.8.28;

import "./Token.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ForgingLogic is AccessControl {

    Token public forgeToken;
    address public owner;
    mapping(uint256 => uint256[]) private requiredTokens;

    //events for tracking transactions
    event Forged(address indexed to, uint256 indexed tokenId);
    event Traded(address indexed from, uint256 indexed fromTokenId, uint256 toTokenId, uint256 amount);

    constructor(address _tokenAddress) {
        require(_tokenAddress != address(0), "Invalid token address"); 
        forgeToken = Token(_tokenAddress);
        owner = msg.sender;
        setRequiredTokens();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setRequiredTokens() private {
        requiredTokens[3] = [0, 1];
        requiredTokens[4] = [1, 2];
        requiredTokens[5] = [0, 2];
        requiredTokens[6] = [0, 1, 2];
    }

    //only owner can set the forge token address
    function setForgeTokenAddress(address _tokenAddres) public onlyRole(DEFAULT_ADMIN_ROLE) {
        forgeToken = Token(_tokenAddres);
    }

    //function to forge tokens 3-6
    function forge(uint256 tokenId) public {
        address user = msg.sender;
        require(tokenId >= forgeToken.TOKEN_3() && tokenId <= forgeToken.TOKEN_6(), "You can only forge tokens 3-6");
    
        uint256[] memory tokenIds = requiredTokens[tokenId];
        uint256[] memory amounts = new uint256[](tokenIds.length);
        
        // Fill amounts array with 1s since we need 1 of each token
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(forgeToken.balanceOf(user, tokenIds[i]) >= 1, "Insufficient balance of token to forge");
            amounts[i] = 1;  // Each recipe requires 1 of each token
        }
        
        // Burns multiple tokens in one transaction
        forgeToken.burnBatch(user, tokenIds, amounts);
        
        // Mint new token
        forgeToken.forgeMint(user, tokenId, 1);
        emit Forged(user, tokenId);
    }

    //function to trade any token for tokens 0-2
    function tradeToken(uint256 fromTokenId, uint256 toTokenId, uint256 amount) public {
        address user = msg.sender;  

        require(fromTokenId != toTokenId, "Cannot trade the same token");
        require(toTokenId <= 2 && fromTokenId <= 2, "Only tokens 0-2 can be traded");
        require(forgeToken.balanceOf(user, fromTokenId) >= amount, "Insufficient balance of token to trade");

        forgeToken.forgeBurn(user, fromTokenId, amount);
        forgeToken.forgeMint(user, toTokenId, amount);
        emit Traded(user, fromTokenId, toTokenId, amount);
    }

    //function to get all token balances for an address
    function getAllTokenBalances(address user) public view returns (uint256[] memory) {
        uint256[] memory balances = new uint256[](7);
        for (uint256 i = 0; i < 7; i++) {
            balances[i] = forgeToken.balanceOf(user, i);
        }
        return balances;
    }


}


//Notes:
//uint256[] cannot be passed in as parameter to function (requiredTokens); only uint8[]?
//for mapping(uint256 => uint256[]) requiredTokens, set function in Token.sol not working