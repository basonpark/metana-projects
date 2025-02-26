// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title MerkleGenerator
 * @dev Helper contract to test Merkle tree operations
 */
contract MerkleGenerator {
    bytes32 public merkleRoot;
    
    // Set the merkle root for verification
    function setMerkleRoot(bytes32 _merkleRoot) external {
        merkleRoot = _merkleRoot;
    }
    
    // Verify a proof against the stored root
    function verifyProof(bytes32[] calldata _merkleProof, address _address, uint256 _index) external view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(_address, _index));
        return MerkleProof.verify(_merkleProof, merkleRoot, leaf);
    }
    
    // Helper to compute the leaf hash for a given address and index
    function getLeafHash(address _address, uint256 _index) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(_address, _index));
    }
} 