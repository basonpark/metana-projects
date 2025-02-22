import { Alchemy, Network, AssetTransfersCategory, Block } from "alchemy-sdk";  

// Configure Alchemy SDK  
if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY === 'demo') {
  throw new Error('Please set NEXT_PUBLIC_ALCHEMY_API_KEY in .env.local');
}

const settings = {  
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
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
export const getEnrichedBlock = async (blockNumber: number, tokenAddress: string): Promise<EnrichedBlock> => {  
  // Log input parameters
  
  console.log('Getting block data:', {
    blockNumber,
    tokenAddress,
    hexBlockNumber: "0x" + blockNumber.toString(16)
  });

  const block = await alchemy.core.getBlock(blockNumber);
  
  // Validate token address
  if (!tokenAddress) {
    console.error('Token address is null or undefined');
    throw new Error('Invalid token address');
  }

  // Log transfer request parameters
  const transferParams = {
    fromBlock: "0x" + blockNumber.toString(16),
    toBlock: "0x" + blockNumber.toString(16),
    contractAddresses: [tokenAddress],
    category: [AssetTransfersCategory.ERC20],
  };

  try {
    const transfers = await alchemy.core.getAssetTransfers(transferParams);
    console.log('Transfer data:', transfers);

    return {  
      ...block,  
      transferVolume: transfers.transfers.reduce((acc, t) => acc + Number(t.value), 0),  
      baseFeeGwei: Number(block.baseFeePerGas) / 1e9, // Convert wei to gwei  
      gasRatio: (Number(block.gasUsed) / Number(block.gasLimit)) * 100,  
    };  
  } catch (error) {
    console.error('Error fetching transfers:', error);
    throw error;
  }
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