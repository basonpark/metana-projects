import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ForgingLogic, Token } from "../typechain-types";

describe("ForgingLogic", function () {
  async function deployContractsFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();

    const ForgingLogic = await ethers.getContractFactory("ForgingLogic");
    const forgingLogic = await ForgingLogic.deploy(await token.getAddress());

    // Grant MINTER_ROLE to ForgingLogic
    const MINTER_ROLE = await token.MINTER_ROLE();
    await token.grantRole(MINTER_ROLE, await forgingLogic.getAddress());

    return { token, forgingLogic, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      const { token, forgingLogic } = await loadFixture(deployContractsFixture);
      expect(await forgingLogic.forgeToken()).to.equal(await token.getAddress());
    });
  });

  describe("Minting", function () {
    it("Should allow minting tokens 0-2", async function () {
      const { forgingLogic, user1 } = await loadFixture(deployContractsFixture);
      
      // Test minting each token type
      for (let i = 0; i < 3; i++) {
        await forgingLogic.connect(user1).mint(i, 1);
        const balance = await forgingLogic.getTokenBalance(user1.address, i);
        expect(balance).to.equal(1);
      }
    });

    it("Should revert when minting invalid token IDs", async function () {
      const { forgingLogic, user1 } = await loadFixture(deployContractsFixture);
      await expect(forgingLogic.connect(user1).mint(3, 1))
        .to.be.revertedWith("Invalid token ID");
    });
  });

  describe("Forging", function () {
    it("Should allow forging token 3 with correct ingredients", async function () {
      const { forgingLogic, user1 } = await loadFixture(deployContractsFixture);
      
      // Mint required tokens
      await forgingLogic.connect(user1).mint(0, 2);
      await forgingLogic.connect(user1).mint(1, 2);
      await forgingLogic.connect(user1).mint(2, 2);

      // Forge token 3
      await forgingLogic.connect(user1).forge(3);
      
      const balance = await forgingLogic.getTokenBalance(user1.address, 3);
      expect(balance).to.equal(1);
    });

    it("Should revert when forging without sufficient ingredients", async function () {
      const { forgingLogic, user1 } = await loadFixture(deployContractsFixture);
      
      await expect(forgingLogic.connect(user1).forge(3))
        .to.be.revertedWith("Insufficient token balance");
    });

    it("Should revert when forging invalid token ID", async function () {
      const { forgingLogic, user1 } = await loadFixture(deployContractsFixture);
      
      await expect(forgingLogic.connect(user1).forge(7))
        .to.be.revertedWith("Invalid token ID");
    });
  });

  describe("Balance Checking", function () {
    it("Should return correct token balances", async function () {
      const { forgingLogic, user1 } = await loadFixture(deployContractsFixture);
      
      // Mint some tokens
      await forgingLogic.connect(user1).mint(0, 1);
      await forgingLogic.connect(user1).mint(1, 2);
      
      const balances = await forgingLogic.getAllTokenBalances(user1.address);
      expect(balances[0]).to.equal(1);
      expect(balances[1]).to.equal(2);
    });

    it("Should return zero balances for address with no tokens", async function () {
      const { forgingLogic, user2 } = await loadFixture(deployContractsFixture);
      
      const balances = await forgingLogic.getAllTokenBalances(user2.address);
      balances.forEach(balance => expect(balance).to.equal(0));
    });
  });
}); 