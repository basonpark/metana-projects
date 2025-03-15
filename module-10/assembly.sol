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