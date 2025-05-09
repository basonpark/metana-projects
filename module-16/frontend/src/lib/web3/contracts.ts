import { sepolia } from 'viem/chains';
import { Address } from 'viem';

// Import ABIs from the artifacts directory (adjust path as necessary)
import CollateralManagerAbi from '../../abis/CollateralManager.json';
import StakingPoolAbi from '../../abis/StakingPool.json';
import LuminaCoinAbi from '../../abis/LuminaCoin.json';
import PriceFeedAbi from '../../abis/PriceFeedAbi.json'; // Chainlink AggregatorV3Interface ABI

// --- Contract Addresses (Sepolia) ---
export const SEPOLIA_CHAIN_ID = sepolia.id;

export const LUMINA_COIN_ADDRESS_SEPOLIA: Address = '0xee98c865dc845de58c13c3a50af8c52ceba02867';
export const COLLATERAL_MANAGER_ADDRESS_SEPOLIA: Address = '0xd7bee4045b48811cef45ba9e860ad539fbe0b5bf';
export const STAKING_POOL_ADDRESS_SEPOLIA: Address = '0x9708705efc0374f813ae26fc6e2ea49eebc82481';
export const ETH_USD_PRICE_FEED_ADDRESS_SEPOLIA: Address = '0x694AA1769357215DE4FAC081bf1f309aDC325306';

// --- Contract Configurations (ABI + Address) for Wagmi Hooks ---

export const luminaCoinConfig = {
  address: LUMINA_COIN_ADDRESS_SEPOLIA,
  abi: LuminaCoinAbi.abi,
} as const; // Use 'as const' for better type inference with wagmi

export const collateralManagerConfig = {
  address: COLLATERAL_MANAGER_ADDRESS_SEPOLIA,
  abi: CollateralManagerAbi.abi,
} as const;

export const stakingPoolConfig = {
  address: STAKING_POOL_ADDRESS_SEPOLIA,
  abi: StakingPoolAbi.abi,
} as const;

export const ethUsdPriceFeedConfig = {
  address: ETH_USD_PRICE_FEED_ADDRESS_SEPOLIA,
  abi: PriceFeedAbi.abi,
} as const;

// Helper function to get contract config based on chain ID
// (Add configs for other chains if needed)
export const getContractConfig = (chainId: number | undefined) => {
  if (chainId === SEPOLIA_CHAIN_ID) {
    return {
      luminaCoin: luminaCoinConfig,
      collateralManager: collateralManagerConfig,
      stakingPool: stakingPoolConfig,
      ethUsdPriceFeed: ethUsdPriceFeedConfig,
    };
  }
  // Return undefined or default config if chain not supported or undefined
  return undefined;
};
