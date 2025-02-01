"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox-viem");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    solidity: "0.8.28",
    networks: {
        mumbai: {
            url: process.env.MUMBAI_RPC_URL,
            accounts: process.env.METAMASK_PRIVATE_KEY !== undefined
                ? [process.env.METAMASK_PRIVATE_KEY]
                : [],
        },
    },
};
exports.default = config;
