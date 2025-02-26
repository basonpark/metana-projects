import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256 } from "ethers";
// @ts-ignore
import { MerkleTree } from "merkletreejs";
import { AdvancedNFT, MerkleGenerator } from "../typechain-types";

// Custom function to generate a Merkle tree for our tests
function generateMerkleTree(addresses: string[], startIndex: number = 0) {
  // Create leaves as hash of address and index
  const leaves = addresses.map((addr, idx) => {
    return Buffer.from(
      ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [addr, startIndex + idx]
      ).slice(2),
      "hex"
    );
  });

  // Create the Merkle tree
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return { tree, leaves };
}

describe("AdvancedNFT", function () {
  let advancedNFT: AdvancedNFT;
  let merkleGenerator: MerkleGenerator;
  let owner: HardhatEthersSigner;
  let users: HardhatEthersSigner[];
  let merkleTree: MerkleTree;
  let merkleRoot: string;

  beforeEach(async function () {
    // Get signers
    [owner, ...users] = await ethers.getSigners();

    // Deploy MerkleGenerator
    const MerkleGenerator = await ethers.getContractFactory("MerkleGenerator");
    merkleGenerator = await MerkleGenerator.deploy();

    // Deploy AdvancedNFT
    const AdvancedNFT = await ethers.getContractFactory("AdvancedNFT");
    advancedNFT = await AdvancedNFT.deploy();

    // Generate Merkle tree with first 10 addresses for testing
    const addresses = users.slice(0, 10).map(user => user.address);
    const { tree } = generateMerkleTree(addresses);
    merkleTree = tree;
    merkleRoot = "0x" + tree.getRoot().toString("hex");

    // Set the Merkle root in the contract
    await advancedNFT.setMerkleRoot(merkleRoot);
    await merkleGenerator.setMerkleRoot(merkleRoot);

    // Set base URI
    await advancedNFT.setBaseURI("ipfs://test/");

    // Add contributors
    await advancedNFT.addContributor(users[11].address, 70); // 70% share
    await advancedNFT.addContributor(users[12].address, 30); // 30% share
  });

  describe("State Machine", function () {
    it("Should allow owner to change state", async function () {
      // Initially in Paused state
      expect(await advancedNFT.currentState()).to.equal(0); // SaleState.Paused

      // Change to PresaleActive
      await advancedNFT.changeState(1); // SaleState.PresaleActive
      expect(await advancedNFT.currentState()).to.equal(1);

      // Change to PublicSaleActive
      await advancedNFT.changeState(2); // SaleState.PublicSaleActive
      expect(await advancedNFT.currentState()).to.equal(2);
    });

    it("Should prevent non-owners from changing state", async function () {
      await expect(
        advancedNFT.connect(users[0]).changeState(1)
      ).to.be.revertedWithCustomError(advancedNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Merkle Airdrop Gas Comparison", function () {
    it("Should measure gas costs for mapping vs bitmap approaches", async function () {
      // Set presale active
      await advancedNFT.changeState(1); // SaleState.PresaleActive

      // Get user and their proof
      const user1 = users[0];
      const leaf = merkleTree.getLeaves()[0];
      const proof = merkleTree.getProof(leaf);
      const hexProof = proof.map((p: any) => "0x" + p.data.toString("hex"));

      // Test with mapping (default)
      await advancedNFT.toggleBitmapUsage(); // Ensure mapping is used (useBitmap = false)
      const mappingTx = await advancedNFT.connect(user1).presaleMint(
        hexProof, 
        0, // index
        { value: ethers.parseEther("0.05") }
      );
      const mappingReceipt = await mappingTx.wait();
      const mappingGasUsed = mappingReceipt?.gasUsed || 0n;
      
      // Reset for next test
      await advancedNFT.changeState(0); // Pause
      await advancedNFT.changeState(1); // Presale active again
      
      // Test with bitmap
      await advancedNFT.toggleBitmapUsage(); // Use bitmap
      const user2 = users[1];
      const leaf2 = merkleTree.getLeaves()[1];
      const proof2 = merkleTree.getProof(leaf2);
      const hexProof2 = proof2.map((p: any) => "0x" + p.data.toString("hex"));
      
      const bitmapTx = await advancedNFT.connect(user2).presaleMint(
        hexProof2, 
        1, // index
        { value: ethers.parseEther("0.05") }
      );
      const bitmapReceipt = await bitmapTx.wait();
      const bitmapGasUsed = bitmapReceipt?.gasUsed || 0n;

      console.log(`Gas used with mapping: ${mappingGasUsed.toString()}`);
      console.log(`Gas used with bitmap: ${bitmapGasUsed.toString()}`);
      console.log(`Difference: ${(Number(mappingGasUsed) - Number(bitmapGasUsed)).toString()} gas units`);
    });
  });

  describe("Public Minting", function () {
    it("Should allow public minting when in proper state", async function () {
      // Set public sale active
      await advancedNFT.changeState(2); // SaleState.PublicSaleActive

      // Mint 3 NFTs
      await advancedNFT.connect(users[5]).publicMint(3, { 
        value: ethers.parseEther("0.24") // 0.08 ETH * 3
      });

      expect(await advancedNFT.totalSupply()).to.equal(3);
      expect(await advancedNFT.ownerOf(0)).to.equal(users[5].address);
      expect(await advancedNFT.ownerOf(1)).to.equal(users[5].address);
      expect(await advancedNFT.ownerOf(2)).to.equal(users[5].address);
    });

    it("Should fail when exceeding max per wallet", async function () {
      await advancedNFT.changeState(2); // SaleState.PublicSaleActive

      await expect(
        advancedNFT.connect(users[5]).publicMint(6, { 
          value: ethers.parseEther("0.48") // 0.08 ETH * 6
        })
      ).to.be.revertedWith("Invalid quantity");
    });
  });

  describe("Commit-Reveal", function () {
    it("Should handle commit-reveal process", async function () {
      // Set up for commit-reveal
      await advancedNFT.changeState(2); // SaleState.PublicSaleActive
      
      // Mint all tokens to trigger SoldOut state
      const mintAmount = 10; // Set a smaller number for testing
      
      // Override MAX_SUPPLY for testing
      const AdvancedNFTFactory = await ethers.getContractFactory("AdvancedNFT");
      const smallerNFT = await AdvancedNFTFactory.deploy() as unknown as AdvancedNFT;
      
      // Start with public sale
      await smallerNFT.changeState(2); // PublicSaleActive
      
      // Mint all tokens
      for (let i = 0; i < Math.ceil(mintAmount / 5); i++) {
        const quantity = Math.min(5, mintAmount - i * 5);
        await smallerNFT.connect(users[i]).publicMint(quantity, { 
          value: ethers.parseEther((0.08 * quantity).toString())
        });
      }
      
      // Contract should automatically transition to SoldOut
      expect(await smallerNFT.currentState()).to.equal(3); // SaleState.SoldOut
      
      // Now do the commit-reveal
      const secretValue = "mysecretvalue";
      const hashedSecret = ethers.keccak256(ethers.toUtf8Bytes(secretValue));
      
      // Commit
      await smallerNFT.commit(hashedSecret);
      
      // Try to reveal too early (should fail)
      await expect(
        smallerNFT.reveal(ethers.toUtf8Bytes(secretValue))
      ).to.be.revertedWith("Too early to reveal");
      
      // Mine 10 blocks to pass the reveal timing
      for (let i = 0; i < 10; i++) {
        await ethers.provider.send("evm_mine", []);
      }
      
      // Now reveal should work
      await smallerNFT.reveal(ethers.toUtf8Bytes(secretValue));
      
      // Should now be in Revealed state
      expect(await smallerNFT.currentState()).to.equal(4); // SaleState.Revealed
      expect(await smallerNFT.isRevealed()).to.equal(true);
    });
  });

  describe("Withdrawal", function () {
    it("Should distribute funds to contributors using pull pattern", async function () {
      // Set public sale active and mint some tokens to collect ETH
      await advancedNFT.changeState(2); // SaleState.PublicSaleActive
      await advancedNFT.connect(users[5]).publicMint(3, { 
        value: ethers.parseEther("0.24") // 0.08 ETH * 3
      });
      
      // Check contract balance
      const contractBalance = await ethers.provider.getBalance(await advancedNFT.getAddress());
      expect(contractBalance).to.equal(ethers.parseEther("0.24"));
      
      // Release payments to contributors
      await advancedNFT.releasePayments();
      
      // Check pending withdrawals
      const contributor1 = users[11];
      const contributor2 = users[12];
      const pending1 = await advancedNFT.pendingWithdrawals(contributor1.address);
      const pending2 = await advancedNFT.pendingWithdrawals(contributor2.address);
      
      // Should be roughly 70% and 30% of 0.24 ETH
      expect(pending1).to.be.closeTo(ethers.parseEther("0.168"), ethers.parseEther("0.001"));
      expect(pending2).to.be.closeTo(ethers.parseEther("0.072"), ethers.parseEther("0.001"));
      
      // Withdraw funds
      const balanceBefore1 = await ethers.provider.getBalance(contributor1.address);
      await advancedNFT.connect(contributor1).withdraw();
      const balanceAfter1 = await ethers.provider.getBalance(contributor1.address);
      
      // Balance should increase (minus gas fees)
      expect(balanceAfter1 - balanceBefore1).to.be.closeTo(
        pending1,
        ethers.parseEther("0.01") // Account for gas fees
      );
      
      // Pending withdrawal should be reset
      expect(await advancedNFT.pendingWithdrawals(contributor1.address)).to.equal(0);
    });
  });
}); 