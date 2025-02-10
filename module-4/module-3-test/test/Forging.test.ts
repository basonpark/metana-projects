import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { Token, ForgingLogic } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Token and ForgingLogic Contracts", function () {
    let token: Token;
    let forgingLogic: ForgingLogic;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    
    beforeEach(async function () {
        // Get signers for testing
        [owner, addr1, addr2] = await ethers.getSigners();
        
        // Deploy Token contract
        const TokenFactory = await ethers.getContractFactory("Token");
        token = await TokenFactory.deploy() as Token;
        
        // Deploy ForgingLogic contract
        const ForgingLogicFactory = await ethers.getContractFactory("ForgingLogic");
        forgingLogic = await ForgingLogicFactory.deploy(await token.getAddress()) as ForgingLogic;
    });

    describe("Token Contract", function () {
        describe("Basic Functionality", function () {
            it("Should set correct initial state", async function () {
                const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
                expect(await token.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
                expect(await token.uri(0)).to.equal("https://token.com/api/0.json");
            });

            it("Should track last minted time correctly", async function () {
                await token.connect(addr1).mint(0, 1);
                const lastMinted = await token.lastMinted(addr1.address);
                expect(lastMinted).to.be.gt(0);
            });
        });

        describe("Minting", function () {
            it("Should allow minting of tokens 0-2", async function () {
                await token.connect(addr1).mint(0, 1);
                expect(await token.balanceOf(addr1.address, 0)).to.equal(1);
                
                await time.increase(60); // Wait cooldown
                await token.connect(addr1).mint(1, 2);
                expect(await token.balanceOf(addr1.address, 1)).to.equal(2);
            });

            it("Should enforce cooldown period", async function () {
                await token.connect(addr1).mint(0, 1);
                await expect(
                    token.connect(addr1).mint(0, 1)
                ).to.be.revertedWith("Mint cooldown of 1 minute must be met.");
                
                await time.increase(60);
                await token.connect(addr1).mint(0, 1);
                expect(await token.balanceOf(addr1.address, 0)).to.equal(2);
            });

            it("Should prevent minting of tokens above 2", async function () {
                await expect(
                    token.connect(addr1).mint(3, 1)
                ).to.be.revertedWith("Only tokens 0-2 can be minted.");
            });
        });

        describe("Role Management", function () {
            it("Should handle role assignments correctly", async function () {
                await token.assignMinterRole(addr1.address);
                await token.assignBurnerRole(addr1.address);
                
                expect(await token.hasRole(await token.MINTER_ROLE(), addr1.address)).to.be.true;
                expect(await token.hasRole(await token.BURNER_ROLE(), addr1.address)).to.be.true;
            });

            it("Should prevent unauthorized role assignments", async function () {
                await expect(
                    token.connect(addr1).assignMinterRole(addr2.address)
                ).to.be.reverted;
            });
        });
    });

    describe("ForgingLogic Contract", function () {
        beforeEach(async function () {
            // Setup initial tokens for testing
            await time.increase(60);
            await token.connect(addr1).mint(0, 1);
            await time.increase(60);
            await token.connect(addr1).mint(1, 1);
            await time.increase(60);
            await token.connect(addr1).mint(2, 1);
        });

        describe("Forging", function () {
            it("Should allow forging of all valid combinations", async function () {
                // Test forging token 3 (requires tokens 0 and 1)
                await forgingLogic.connect(addr1).forge(3);
                expect(await token.balanceOf(addr1.address, 3)).to.equal(1);
                expect(await token.balanceOf(addr1.address, 0)).to.equal(0);
                expect(await token.balanceOf(addr1.address, 1)).to.equal(0);

                // Mint more tokens for next test
                await time.increase(60);
                await token.connect(addr1).mint(0, 1);
                await time.increase(60);
                await token.connect(addr1).mint(2, 1);

                // Test forging token 5 (requires tokens 0 and 2)
                await forgingLogic.connect(addr1).forge(5);
                expect(await token.balanceOf(addr1.address, 5)).to.equal(1);
            });

            it("Should emit correct events when forging", async function () {
                await expect(forgingLogic.connect(addr1).forge(3))
                    .to.emit(forgingLogic, "Forged")
                    .withArgs(addr1.address, 3)
                    .and.to.emit(token, "Burned")
                    .and.to.emit(token, "Minted");
            });
        });

        describe("Trading", function () {
            it("Should allow trading between basic tokens", async function () {
                await forgingLogic.connect(addr1).tradeToken(0, 1, 1);
                expect(await token.balanceOf(addr1.address, 0)).to.equal(0);
                expect(await token.balanceOf(addr1.address, 1)).to.equal(2);
            });

            it("Should prevent invalid trades", async function () {
                await expect(
                    forgingLogic.connect(addr1).tradeToken(0, 3, 1)
                ).to.be.revertedWith("Only tokens 0-2 can be traded");

                await expect(
                    forgingLogic.connect(addr1).tradeToken(0, 0, 1)
                ).to.be.revertedWith("Cannot trade the same token");
            });

            it("Should emit correct events when trading", async function () {
                await expect(forgingLogic.connect(addr1).tradeToken(0, 1, 1))
                    .to.emit(forgingLogic, "Traded")
                    .withArgs(addr1.address, 0, 1, 1);
            });
        });

        describe("Admin Functions", function () {
            it("Should allow admin to update forge token address", async function () {
                const TokenFactory = await ethers.getContractFactory("Token");
                const newToken = await TokenFactory.deploy();
                await forgingLogic.setForgeTokenAddress(await newToken.getAddress());
                expect(await forgingLogic.forgeToken()).to.equal(await newToken.getAddress());
            });

            it("Should prevent non-admin from updating forge token address", async function () {
                const TokenFactory = await ethers.getContractFactory("Token");
                const newToken = await TokenFactory.deploy();
                await expect(
                    forgingLogic.connect(addr1).setForgeTokenAddress(await newToken.getAddress())
                ).to.be.reverted;
            });
        });

        describe("Utility Functions", function () {
            it("Should return correct token balances", async function () {
                const balances = await forgingLogic.getAllTokenBalances(addr1.address);
                expect(balances[0]).to.equal(1); // Token 0
                expect(balances[1]).to.equal(1); // Token 1
                expect(balances[2]).to.equal(1); // Token 2
                expect(balances[3]).to.equal(0); // Token 3
            });
        });
    });
});
