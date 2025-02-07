import { Alchemy, Network, AssetTransfersCategory, Block } from "alchemy-sdk";  

// Configure Alchemy SDK  
const settings = {  
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_WS_API_KEY,
  network: Network.ETH_MAINNET,  
};  

export const alchemy = new Alchemy(settings);  

// Type for enriched block data  
export interface EnrichedBlock extends Block {  
  transferVolume: number;  
  baseFeeGwei: number;  
  gasRatio: number;  
}  

// Fetch block data with additional metrics  
export const getEnrichedBlock = async (blockNumber: number): Promise<EnrichedBlock> => {  
  const block = await alchemy.core.getBlock(blockNumber);  
  
  // Get ERC20 transfers  
  const transfers = await alchemy.core.getAssetTransfers({  
    fromBlock: "0x" + blockNumber.toString(16),  
    toBlock: "0x" + blockNumber.toString(16),  
    contractAddresses: [process.env.NEXT_PUBLIC_USDC_ERC20_ADDRESS!],  
    category: [AssetTransfersCategory.ERC20],  
  });  

  // Calculate metrics  
  return {  
    ...block,  
    transferVolume: transfers.transfers.reduce((acc, t) => acc + Number(t.value), 0),  
    baseFeeGwei: Number(block.baseFeePerGas) / 1e9, // Convert wei to gwei  
    gasRatio: (Number(block.gasUsed) / Number(block.gasLimit)) * 100,  
  };  
};  

// WebSocket block listener  
export const createBlockListener = (  
  callback: (blockNumber: number) => void  
) => {  
  const subscription = alchemy.ws.on("block", (blockNumber) => {  
    callback(Number(blockNumber));  
  });  

  return subscription.removeAllListeners;  // Alchemy's ws.on returns an unsubscribe function
};  