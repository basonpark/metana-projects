import { HardhatRuntimeEnvironment } from "hardhat/types";
import "@nomiclabs/hardhat-ethers";
const hre = require("hardhat");
import { ethers } from "ethers"

async function main() {
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
