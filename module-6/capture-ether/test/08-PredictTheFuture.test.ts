import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('PredictTheFutureChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheFutureChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    
    const currentBlock = await provider.getBlockNumber();  
    await target.lockInGuess(0, { value: utils.parseEther('1') });  
    
    // Settlement happens at currentBlock + 2  
    const settleBlock = currentBlock + 2;  
    
    // Mine blocks until we pass it  
    while ((await provider.getBlockNumber()) < settleBlock) {  
      await ethers.provider.send('evm_mine', []);  
    }  

    expect(await target.isComplete()).to.equal(true);
  });
});

