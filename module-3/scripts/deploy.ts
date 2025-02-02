import { HardhatRuntimeEnvironment } from "hardhat/types";
import "@nomiclabs/hardhat-ethers";
const hre = require("hardhat");
import { ethers } from "ethers"

async function main() {

  // const [deployer] = await ethers.getSigners(); // Get the deployer account  
  // console.log("Deployer:", deployer);
  // const balance = await ethers.provider.getBalance(deployer.address); // Check balance  
  // console.log("Account balance:", ethers.formatEther(balance), "ETH");  
  
  //question for instructor: I am having trouble deploying this contract.
  //I've compiled the contracts well and set the right configs for polygonAmoy and sufficient funds in wallet
  //The main trouble is wthe conflict with packages (ethers from hardhat, ethers, nomiclabs, nomicfoundation, hardhat-ethers, hardhat-toolbox)
  //I know it should be easy but I've been stuck on this for a long time and I can use some suport.
  //Also, package.json is not showing all the devDependencies and dependencies.
  //I've tried to install all the dependencies but it didn't work, the the version control is getting messy.

  const TokenFactory = await hre.ethers.getContractFactory("Token");
  const ForgingLogicFactory = await hre.ethers.getContractFactory(
    "ForgingLogic"
  );

  console.log("TokenFactory:", TokenFactory);  

  //deploy Token contract with a fixed gasLimit
  console.log("Deploying Token contract...");
  const token = await TokenFactory.deploy();
  await token.deployed();

  console.log("Token:", token); 
  console.log("Token deployed to:", token.address);

  //deploy ForgingLogic contract
  const forgingLogic = await ForgingLogicFactory.deploy(token.address);
  await forgingLogic.deployed();
  console.log("ForgingLogic deployed to:", forgingLogic.address);
  
}

//execute main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
