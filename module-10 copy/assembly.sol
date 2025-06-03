// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract BitWise {
    function countBitSet(uint8 data) public pure returns (uint8 result) {  
        assembly {  
        result := 0  
        
        for { let i := 0 } lt(i, 8) { i := add(i, 1) } {  
            // check if the current bit is set  
            // (data >> i) & 1  
            let bit := and(shr(i, data), 1)  
            
            // increment counter if bit is 1
            result := add(result, bit)  
        }  
        }  
    }  
}   

contract String {
    function charAt(string memory input, uint index) public pure returns(bytes2) {  
        assembly {  
        let strLen := mload(input)  
        
        // check if index is out of bounds / string is empty
        if or(iszero(strLen), gte(index, strLen)) {  
            return(0, 0x20)  
        }  
        
        // calculate memory position of character, and add index to that position
        let charPos := add(add(input, 0x20), index)  
        
        // load the word containing character  
        let data := mload(charPos)  
        
        // keep only the first 2 bytes and return
        data := shl(0xe0, data)  // shift left by 224 bits (256-16=240 bits)  
        data := shr(0xe0, data)  // shift right to get back to position 0  
        
        mstore(0, data)  
        return(0, 0x20)  
        }  
    }  
}  