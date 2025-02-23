import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('DeployAContract', () => {

  it("Solves the challenge", async () => {
    const [deployer] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("DeployChallenge");
    const target = await factory.connect(deployer).deploy();
    await target.deployed();

    expect(await target.isComplete()).to.equal(true);
  })
});
