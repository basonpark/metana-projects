import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Token } from "../typechain-types";

describe("Token", function () {
  async function deployTokenFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    
    // Constants
    const MINTER_ROLE = await token.MINTER_ROLE();
    const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();

    return { token, owner, user1, user2, MINTER_ROLE, DEFAULT_ADMIN_ROLE };
  }

  describe("Deployment", function () {
    it("Should set the correct roles", async function () {
      const { token, owner, DEFAULT_ADMIN_ROLE, MINTER_ROLE } = await loadFixture(deployTokenFixture);
      
      expect(await token.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await token.hasRole(MINTER_ROLE, owner.address)).to.be.true;
    });

    it("Should set the correct URI", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      const baseURI = "https://ipfs.io/ipfs/bafybeif7ykc3h3r5eo24cpcy2suubbu5ns6k7e6soebqco53gykw6jkqlq/";
      expect(await token.uri(0)).to.equal(baseURI + "0.json");
    });
  });

  describe("Minting", function () {
    it("Should allow minting by MINTER_ROLE", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      
      await token.mint(user1.address, 0, 1, "0x");
      expect(await token.balanceOf(user1.address, 0)).to.equal(1);
    });

    it("Should revert when non-minter tries to mint", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      
      await expect(token.connect(user1).mint(user2.address, 0, 1, "0x"))
        .to.be.reverted;
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to grant roles", async function () {
      const { token, owner, user1, MINTER_ROLE } = await loadFixture(deployTokenFixture);
      
      await token.grantRole(MINTER_ROLE, user1.address);
      expect(await token.hasRole(MINTER_ROLE, user1.address)).to.be.true;
    });

    it("Should allow admin to revoke roles", async function () {
      const { token, owner, user1, MINTER_ROLE } = await loadFixture(deployTokenFixture);
      
      await token.grantRole(MINTER_ROLE, user1.address);
      await token.revokeRole(MINTER_ROLE, user1.address);
      expect(await token.hasRole(MINTER_ROLE, user1.address)).to.be.false;
    });

    it("Should revert when non-admin tries to grant roles", async function () {
      const { token, user1, user2, MINTER_ROLE } = await loadFixture(deployTokenFixture);
      
      await expect(token.connect(user1).grantRole(MINTER_ROLE, user2.address))
        .to.be.reverted;
    });
  });

  describe("URI", function () {
    it("Should return correct URI for different token IDs", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      const baseURI = "https://ipfs.io/ipfs/bafybeif7ykc3h3r5eo24cpcy2suubbu5ns6k7e6soebqco53gykw6jkqlq/";
      
      for (let i = 0; i < 7; i++) {
        expect(await token.uri(i)).to.equal(baseURI + i + ".json");
      }
    });
  });
}); 