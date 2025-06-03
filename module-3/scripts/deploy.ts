import { ethers } from "hardhat";

const hre = require("hardhat");
async function main() {

  // const [deployer] = await ethers.getSigners(); // Get the deployer account  
  // console.log("Deployer:", deployer);
  // const balance = await ethers.provider.getBalance(deployer.address); // Check balance  
  // console.log("Account balance:", ethers.formatEther(balance), "ETH");  

  const TokenFactory = await hre.ethers.getContractFactory("Token");
  const ForgingLogicFactory = await hre.ethers.getContractFactory(
    "ForgingLogic"
  );

  console.log("TokenFactory:", TokenFactory);  
  //deploy Token contract with a fixed gasLimit
  const token = await TokenFactory.deploy();
  console.log("Deploying Token contract...");
  await token.waitForDeployment();


  console.log("Token:", token); 
  console.log("Token deployed to:", token.target);

  //deploy ForgingLogic contract
  const forgingLogic = await ForgingLogicFactory.deploy(token.target);
  await forgingLogic.waitForDeployment();
  console.log("ForgingLogic deployed to:", forgingLogic.target);
  
  await token.assignMinterRole(forgingLogic.target);  
  await token.assignBurnerRole(forgingLogic.target);  
}

//execute main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
