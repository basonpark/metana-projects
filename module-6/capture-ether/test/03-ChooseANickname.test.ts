import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('NicknameChallenge', () => {
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;
  let captureTheEther: Contract;
  let target: Contract;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    captureTheEther = await (
      await ethers.getContractFactory('CaptureTheEther', attacker)
    ).deploy(attacker.address);

    await captureTheEther.deployed();

    target = await (
      await ethers.getContractFactory('NicknameChallenge')
    ).attach(await captureTheEther.playerNicknameContract(attacker.address));

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    const nickname = ethers.utils.formatBytes32String("Bason");
    await captureTheEther.setNickname(nickname);

    expect(await target.isComplete()).to.equal(true);
  });
});
