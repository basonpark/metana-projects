// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Multicall.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AdvancedNFT is ERC721, Ownable, Multicall {
    using BitMaps for BitMaps.BitMap;
    using Address for address payable;

    //states
    enum SaleState {
        Paused,
        PresaleActive,
        PublicSaleActive,
        SoldOut,
        Revealed
    }
    
    SaleState public currentState = SaleState.Paused;
    
    //configure nft
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_PER_WALLET = 5;
    uint256 public constant PRESALE_PRICE = 0.05 ether;
    uint256 public constant PUBLIC_PRICE = 0.08 ether;
    uint256 public totalSupply = 0;
    
    //merkle tree airdrop
    bytes32 public merkleRoot;
    
    //method 1: mapping tracks minted addresses 
    mapping(address => bool) public hasMinted;
    
    //method 2: bitmap tracks minted addresses
    BitMaps.BitMap private mintedBitmap;
    bool public useBitmap = false;
    
    //commit-reveal
    bytes32 public commitHash;
    uint256 public revealBlock;
    uint256 public randomSeed;
    bool public isRevealed = false;
    mapping(uint256 => uint256) public tokenIdToRevealedId;
    
    //withdrawal
    struct Contributor {
        address payable wallet;
        uint256 shares;
    }
    
    Contributor[] public contributors;
    uint256 public totalShares;
    mapping(address => uint256) public pendingWithdrawals;
    
    //events
    event Commit(bytes32 commitHash, uint256 revealBlock);
    event Reveal(bytes32 revealed, uint256 randomSeed);
    event MintedWithMapping(address indexed minter, uint256 indexed tokenId, uint256 gasUsed);
    event MintedWithBitmap(address indexed minter, uint256 indexed tokenId, uint256 gasUsed);
    event StateChanged(SaleState oldState, SaleState newState);
    event ContributorAdded(address indexed contributor, uint256 shares);
    event WithdrawalReady(address indexed contributor, uint256 amount);
    event WithdrawalComplete(address indexed contributor, uint256 amount);

    constructor() ERC721("AdvancedNFT", "ANFT") Ownable(msg.sender) {}
    
    //state function
    function changeState(SaleState _newState) external onlyOwner {
        require(_newState != currentState, "Already in this state");
        
        if (_newState == SaleState.SoldOut) {
            require(totalSupply >= MAX_SUPPLY, "Supply not sold out yet");
        }
        
        if (_newState == SaleState.Revealed) {
            require(isRevealed, "Not revealed yet");
        }
        
        currentState = _newState;
        emit StateChanged(currentState, _newState);
    }

    //merkle tree setup
    function setMerkleRoot(bytes32 _root) external onlyOwner {
        merkleRoot = _root;
    }
    
    function toggleBitmapUsage() external onlyOwner {
        useBitmap = !useBitmap;
    }

    //minting functions
    function presaleMint(bytes32[] calldata _merkleProof, uint256 _index) external payable {
        require(currentState == SaleState.PresaleActive, "Presale is not active");
        require(msg.value == PRESALE_PRICE, "Incorrect ETH amount");
        require(totalSupply < MAX_SUPPLY, "Sold out");
        
        //verify merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, _index));
        require(MerkleProof.verify(_merkleProof, merkleRoot, leaf), "Invalid proof");
        
        uint256 startGas = gasleft();

        if (useBitmap) {
            //check if already minted using bitmap
            require(!mintedBitmap.get(_index), "Already minted");
            mintedBitmap.set(_index);
            
            _mint(msg.sender, totalSupply);
            uint256 gasUsed = startGas - gasleft();
            emit MintedWithBitmap(msg.sender, totalSupply, gasUsed);
        } else {
            //check if already minted using mapping
            require(!hasMinted[msg.sender], "Already minted");
            hasMinted[msg.sender] = true;
            
            _mint(msg.sender, totalSupply);
            uint256 gasUsed = startGas - gasleft();
            emit MintedWithMapping(msg.sender, totalSupply, gasUsed);
        }
        
        totalSupply++;
        
        if (totalSupply >= MAX_SUPPLY) {
            currentState = SaleState.SoldOut;
            emit StateChanged(SaleState.PresaleActive, SaleState.SoldOut);
        }
    }

    function publicMint(uint256 _quantity) external payable {
        require(currentState == SaleState.PublicSaleActive, "Public sale not active");
        require(_quantity > 0 && _quantity <= MAX_PER_WALLET, "Invalid quantity");
        require(totalSupply + _quantity <= MAX_SUPPLY, "Would exceed max supply");
        require(msg.value == PUBLIC_PRICE * _quantity, "Incorrect ETH amount");
        
        for (uint256 i = 0; i < _quantity; i++) {
            _mint(msg.sender, totalSupply + i);
        }
        
        totalSupply += _quantity;
        
        if (totalSupply >= MAX_SUPPLY) {
            currentState = SaleState.SoldOut;
            emit StateChanged(SaleState.PublicSaleActive, SaleState.SoldOut);
        }
    }

    // commit-reveal functions to ensure fair distribution
    function commit(bytes32 _commitHash) external onlyOwner {
        require(currentState == SaleState.SoldOut, "Not sold out yet");
        require(!isRevealed, "Already revealed");
        
        commitHash = _commitHash;
        revealBlock = block.number + 10; // Reveal 10 blocks ahead
        
        emit Commit(commitHash, revealBlock);
    }
    
    function reveal(bytes32 _revealed) external onlyOwner {
        require(commitHash != bytes32(0), "No commit exists");
        require(block.number >= revealBlock, "Too early to reveal");
        require(keccak256(abi.encodePacked(_revealed)) == commitHash, "Invalid revealed value");
        require(!isRevealed, "Already revealed");
        
        randomSeed = uint256(keccak256(abi.encodePacked(_revealed, blockhash(revealBlock))));
        isRevealed = true;
        
        //change the state to reveald
        currentState = SaleState.Revealed;
        emit StateChanged(SaleState.SoldOut, SaleState.Revealed);
        emit Reveal(_revealed, randomSeed);
    }
    
    function getRevealedTokenId(uint256 _tokenId) public view returns (uint256) {
        require(_tokenId < totalSupply, "Token does not exist");
        
        if (!isRevealed) {
            return _tokenId;
        }
        
        if (tokenIdToRevealedId[_tokenId] != 0) {
            return tokenIdToRevealedId[_tokenId];
        }
        
        uint256 revealedId = uint256(keccak256(abi.encodePacked(_tokenId, randomSeed))) % totalSupply;
        return revealedId;
    }
    
    // Ensures that tokenURI returns the revealed ID's URI
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        _requireOwned(_tokenId);
        
        uint256 revealedId = getRevealedTokenId(_tokenId);
        return isRevealed 
            ? string(abi.encodePacked(_baseURI(), Strings.toString(revealedId)))
            : ""
    }
    
    // Set the base URI for token metadata
    string private _baseTokenURI;
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    //withdrawal using pull pattern
    function addContributor(address payable _wallet, uint256 _shares) external onlyOwner {
        require(_wallet != address(0), "Invalid address");
        require(_shares > 0, "Shares must be greater than 0");
        
        contributors.push(Contributor({
            wallet: _wallet,
            shares: _shares
        }));
        
        totalShares += _shares;
        emit ContributorAdded(_wallet, _shares);
    }
    
    function releasePayments() external {
        require(address(this).balance > 0, "No funds to distribute");
        
        uint256 totalETH = address(this).balance;
        
        for (uint256 i = 0; i < contributors.length; i++) {
            Contributor memory contributor = contributors[i];
            uint256 payment = (totalETH * contributor.shares) / totalShares;
            
            if (payment > 0) {
                pendingWithdrawals[contributor.wallet] += payment;
                emit WithdrawalReady(contributor.wallet, payment);
            }
        }
    }
    
    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        pendingWithdrawals[msg.sender] = 0;
        
        payable(msg.sender).sendValue(amount);
        emit WithdrawalComplete(msg.sender, amount);
    }
}

