import { HardhatRuntimeEnvironment } from "hardhat/types";
import "@nomiclabs/hardhat-ethers";
const hre = require("hardhat");

async function main() {
  const TokenFactory = await hre.ethers.getContractFactory("Token");
  const ForgingLogicFactory = await hre.ethers.getContractFactory(
    "ForgingLogic"
  );

  console.log("TokenFactory:", TokenFactory);  

  //deploy Token contract with a fixed gasLimit
  console.log("Deploying Token contract...");
  const token = await TokenFactory.deploy({
    gasLimit: 500000,
    gasPrice: hre.ethers.utils.parseUnits('30', 'gwei'),
  });
  console.log("Waiting for Token deployment...");
  await token.waitForDeployment();

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
