import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    polygonAmoy: {
      url: process.env.POLYGON_RPC_URL,
      accounts:
        process.env.METAMASK_PRIVATE_KEY !== undefined
          ? [process.env.METAMASK_PRIVATE_KEY]
          : [],
    },
  },
};

export default config;
