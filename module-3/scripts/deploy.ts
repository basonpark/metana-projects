import { HardhatRuntimeEnvironment } from "hardhat/types";
import "@nomiclabs/hardhat-ethers";
const hre = require("hardhat");

async function main() {
  const TokenFactory = await hre.ethers.getContractFactory("Token");
  const ForgingLogicFactory = await hre.ethers.getContractFactory(
    "ForgingLogic"
  );

  //deploy Token contract
  const token = await TokenFactory.deploy();
  await token.deployed();
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
