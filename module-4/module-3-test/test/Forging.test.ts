import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { Token, ForgingLogic } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Token and ForgingLogic Contracts", function () {
    let token: Token;
    let forgingLogic: ForgingLogic;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;
    let addr2: HardhatEthersSigner;
    
    beforeEach(async function () {
        [owner, addr1, addr2] = (await ethers.getSigners() as unknown) as HardhatEthersSigner[];
        
        // Deploy Token contract
        const TokenFactory = await ethers.getContractFactory("Token");
        token = await TokenFactory.deploy() as Token;
        await token.waitForDeployment();

        //assign minter and burner roles to owner
        await token.assignMinterRole(owner.address);  
        await token.assignBurnerRole(owner.address);  

        //deploy ForgingLogic contract
        const ForgingLogicFactory = await ethers.getContractFactory("ForgingLogic");
        forgingLogic = await ForgingLogicFactory.deploy(await token.target) as ForgingLogic;
        await forgingLogic.waitForDeployment();

        //assign minter and burner roles to forgingLogic
        await token.assignMinterRole(await forgingLogic.target);  
        await token.assignBurnerRole(await forgingLogic.target);  
        //TODO: UNDERSTAND THIS 
        
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

            it("Should support ERC1155 and AccessControl interfaces", async function () {
                expect(await token.supportsInterface(ethers.id("ERC1155").toString())).to.be.true;
                expect(await token.supportsInterface(ethers.id("AccessControl").toString())).to.be.true;
            });
        });

        describe("Minting", function () {
            it("Should allow minting of tokens 0-2", async function () {
                await token.connect(addr1).mint(0, 1);
                expect(await token.balanceOf(addr1.address, 0)).to.equal(1);
                
                await time.increase(60); 
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
            await time.increase(60);
            await token.connect(addr1).mint(0, 1);
            await time.increase(60);
            await token.connect(addr1).mint(1, 1);
            await time.increase(60);
            await token.connect(addr1).mint(2, 1);
        });

        describe("Forging", function () {
            it("Should forge token 3 (requires 0, 1)", async () => {
                await forgingLogic.connect(addr1).forge(3);
                expect(await token.balanceOf(addr1.address, 3)).to.equal(1);
                expect(await token.balanceOf(addr1.address, 0)).to.equal(0);
                expect(await token.balanceOf(addr1.address, 1)).to.equal(0);
            });

            it("Should forget token 4 (requires 1, 2)", async () => {
                await forgingLogic.connect(addr1).forge(4);
                expect(await token.balanceOf(addr1.address, 4)).to.equal(1);
                expect(await token.balanceOf(addr1.address, 1)).to.equal(0);
                expect(await token.balanceOf(addr1.address, 2)).to.equal(0);
            });

            it("Should forge token 5 (requires 0, 2)", async () => {
                await forgingLogic.connect(addr1).forge(5);
                expect(await token.balanceOf(addr1.address, 5)).to.equal(1);
                expect(await token.balanceOf(addr1.address, 0)).to.equal(0);
                expect(await token.balanceOf(addr1.address, 2)).to.equal(0);
            });

            it("Should forge token 6 (requires 0, 1, 2)", async () => {
                await forgingLogic.connect(addr1).forge(6);
                expect(await token.balanceOf(addr1.address, 6)).to.equal(1);
                expect(await token.balanceOf(addr1.address, 0)).to.equal(0);
                expect(await token.balanceOf(addr1.address, 1)).to.equal(0);
                expect(await token.balanceOf(addr1.address, 2)).to.equal(0);
            });

            it("Should emit correct events when forging", async () => {
                await expect(forgingLogic.connect(addr1).forge(3))
                    .to.emit(forgingLogic, "Forged")
                    .withArgs(addr1.address, 3)
                    .and.to.emit(token, "Burned")
                    .and.to.emit(token, "Minted");
            });

            it("Should revert forging with invalid token ID", async () => {
                await expect(
                    forgingLogic.connect(addr1).forge(2)
                ).to.be.revertedWith("You can only forge tokens 3-6");
            });

            it("Should revert forging with insufficient balance", async () => {
                await forgingLogic.connect(addr1).forge(3);
                await expect(
                    forgingLogic.connect(addr1).forge(3)
                ).to.be.revertedWith("Insufficient balance of token to forge");
            });
        });

        describe("Trading", function () {
            it("Should allow trading between basic tokens", async () => {
                await forgingLogic.connect(addr1).tradeToken(0, 1, 1);
                expect(await token.balanceOf(addr1.address, 0)).to.equal(0);
                expect(await token.balanceOf(addr1.address, 1)).to.equal(2);
            });

            it("Should prevent invalid trades", async () => {
                await expect(
                    forgingLogic.connect(addr1).tradeToken(0, 3, 1)
                ).to.be.revertedWith("Only tokens 0-2 can be traded");

                await expect(
                    forgingLogic.connect(addr1).tradeToken(0, 0, 1)
                ).to.be.revertedWith("Cannot trade the same token");
            });

            it("Should handle reverse trades", async () => {
                await forgingLogic.connect(addr1).tradeToken(1, 0, 1);
                expect(await token.balanceOf(addr1.address, 0)).to.equal(1);
                expect(await token.balanceOf(addr1.address, 1)).to.equal(0);
            });

            it("Should emit correct events when trading", async () => {
                await expect(forgingLogic.connect(addr1).tradeToken(0, 1, 1))
                    .to.emit(forgingLogic, "Traded")
                    .withArgs(addr1.address, 0, 1, 1);
            });
        });

        describe("Admin Functions", function () {

            let newToken: Token; 
            beforeEach(async () => {
                const TokenFactory = await ethers.getContractFactory("Token");
                newToken = (await TokenFactory.deploy()) as Token;
                await newToken.waitForDeployment();
            })

            it("Should allow admin to update forge token address", async  () => {
                await forgingLogic.setForgeTokenAddress(await newToken.target);
                expect(await forgingLogic.forgeToken()).to.equal(await newToken.target);
            });

            it("Should maintain roles when changing token", async () => {   
                await forgingLogic.setForgeTokenAddress(await newToken.target);
                expect(await newToken.hasRole(await newToken.MINTER_ROLE(), await forgingLogic.target)).to.be.true;
                expect(await newToken.hasRole(await newToken.BURNER_ROLE(), await forgingLogic.target)).to.be.true;
            }); 

            it("Should prevent non-admin from updating forge token address", async () => {
                await expect(
                    forgingLogic.connect(addr1).setForgeTokenAddress(await newToken.target)
                ).to.be.reverted;
            });

            it("Should prevent unauthorized forgeMint", async () => {
                await expect(
                    token.connect(addr1).forgeMint(addr1.address, 3, 1)
                ).to.be.reverted;
            });

            it("Should prevent unauthorized forgeBurn", async () => {
                await expect(
                    token.connect(addr1).forgeBurn(addr1.address, 0, 1)
                ).to.be.reverted;
            });
            
            
        });

        describe("Utility Functions", function () {
            it("Should return correct token balances", async () => {
                const balances = await forgingLogic.getAllTokenBalances(addr1.address);
                for (let i = 0; i < 7; i++) {
                    expect(balances[i]).to.equal(i < 3 ? 1 : 0);
                }
            });
        });
    });
});
