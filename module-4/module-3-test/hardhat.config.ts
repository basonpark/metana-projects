import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "solidity-coverage";
import dotenv from "dotenv";

dotenv.config();

// Only include network config if not running coverage
const networks = process.env.COVERAGE 
  ? {}
  : {
      sepolia: {
        url: process.env.SEPOLIA_RPC_URL || "",
        accounts:
          process.env.METAMASK_PRIVATE_KEY !== undefined
            ? [process.env.METAMASK_PRIVATE_KEY]
            : [],
      },
    };

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks,
};

export default config;
