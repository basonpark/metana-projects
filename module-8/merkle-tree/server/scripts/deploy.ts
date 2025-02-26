import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AdvancedNFT contracts...");

  // Deploy MerkleGenerator for testing purposes
  const MerkleGenerator = await ethers.getContractFactory("MerkleGenerator");
  const merkleGenerator = await MerkleGenerator.deploy();
  await merkleGenerator.waitForDeployment();
  
  console.log(`MerkleGenerator deployed to: ${await merkleGenerator.getAddress()}`);

  // Deploy the NFT contract
  const AdvancedNFT = await ethers.getContractFactory("AdvancedNFT");
  const advancedNFT = await AdvancedNFT.deploy();
  await advancedNFT.waitForDeployment();
  
  console.log(`AdvancedNFT deployed to: ${await advancedNFT.getAddress()}`);

  // Set base URI for the NFT contract
  const baseURI = "ipfs://YOUR_CID_HERE/";
  await advancedNFT.setBaseURI(baseURI);
  console.log(`Base URI set to: ${baseURI}`);

  // Add some contributors for testing the withdrawal system
  const [owner, contributor1, contributor2] = await ethers.getSigners();
  
  await advancedNFT.addContributor(await contributor1.getAddress(), 70); // 70% share
  await advancedNFT.addContributor(await contributor2.getAddress(), 30); // 30% share
  
  console.log(`Added contributors:`);
  console.log(`- Contributor 1 (${await contributor1.getAddress()}): 70% share`);
  console.log(`- Contributor 2 (${await contributor2.getAddress()}): 30% share`);

  console.log("Deployment complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 