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
        forgeToken = Token(_tokenAddress);
        owner = msg.sender;
        setRequiredTokens();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        forgeToken.assignMinterRole(address(this));
        forgeToken.assignBurnerRole(address(this));
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
    
        // burn required tokens
        for (uint256 i = 0; i < requiredTokens[tokenId].length; i++) {
            require(forgeToken.balanceOf(user, requiredTokens[tokenId][i]) >= 1, "Insufficient balance of token to forge");
            forgeToken.forgeBurn(user, requiredTokens[tokenId][i], 1);
        }
        // mint new token
        forgeToken.forgeMint(user, tokenId, 1);
        emit Forged(user, tokenId);
    }

    //function to trade any token for tokens 0-2
    function tradeToken(uint256 fromTokenId, uint256 toTokenId, uint256 amount) public {
        require(fromTokenId != toTokenId, "Cannot trade the same token");
        require(toTokenId <= 2, "Only tokens 0-2 can be traded for");
        require(forgeToken.balanceOf(msg.sender, fromTokenId) >= amount, "Insufficient balance of token to trade");

        forgeToken.forgeBurn(msg.sender, fromTokenId, amount);
        forgeToken.forgeMint(msg.sender, toTokenId, amount);
        emit Traded(msg.sender, fromTokenId, toTokenId, amount);
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
