pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Token is ERC1155, AccessControl {

    //roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

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
    
    //events for tracking transactions
    event Minted(address indexed to, uint256 indexed tokenId, uint256 amount);
    event Burned(address indexed from, uint256 indexed tokenId, uint256 amount);

    //constructor sets URI for token metadata
    constructor() ERC1155(URI)  {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    //function to freely mint tokens 0-2 
    function mint(uint256 tokenId, uint256 amount) public {
        require(tokenId <= TOKEN_2, "Only tokens 0-2 can be minted.");
        require(block.timestamp >= lastMinted[msg.sender] + cooldown, "Mint cooldown of 1 minute must be met.");
        lastMinted[msg.sender] = block.timestamp;
        _mint(msg.sender, tokenId, amount, "");
        emit Minted(msg.sender, tokenId, amount);
    }

    //function to burn tokens 3-6  
    function burn(uint256 tokenId, uint256 amount) public {
        require(tokenId >= TOKEN_3, "Only tokens 3-6 can be burned.");
        _burn(msg.sender, tokenId, amount);
        emit Burned(msg.sender, tokenId, amount);
    }

    function setURI(string memory newURI) public onlyRole(DEFAULT_ADMIN_ROLE) {
        URI = newURI;
    }

    // Special mint helper function for forging
    function forgeMint(address to, uint256 tokenId, uint256 amount) external {
        _mint(to, tokenId, amount, "");
        emit Minted(to, tokenId, amount);
    }

    // Special burn helper function for forging
    function forgeBurn(address from, uint256 tokenId, uint256 amount) external {
        _burn(from, tokenId, amount);
        emit Burned(from, tokenId, amount);
    }

    // Convenience functions for role assignment  
    function assignMinterRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {  
        grantRole(MINTER_ROLE, account);  
    }  

    function assignBurnerRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {  
        grantRole(BURNER_ROLE, account);  
    }   
}