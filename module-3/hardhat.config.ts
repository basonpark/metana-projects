import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts:
        process.env.METAMASK_PRIVATE_KEY !== undefined
          ? [process.env.METAMASK_PRIVATE_KEY]
          : [],
          gasPrice: 25000000000,
    },
  },
};

export default config;
