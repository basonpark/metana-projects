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
export interface EnrichedBlock {  
  number: number;  
  timestamp: number;  
  gasUsed: number;  
  gasLimit: number;  
  baseFeeGwei: number;  
  gasRatio: number;  
  transferVolume: number;  
  transactions: number;  
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
      number: block.number,  
      timestamp: block.timestamp,  
      gasUsed: Number(block.gasUsed),  
      gasLimit: Number(block.gasLimit),  
      baseFeeGwei: Number(block.baseFeePerGas) / 1e9, // Convert wei to gwei  
      gasRatio: (Number(block.gasUsed) / Number(block.gasLimit)) * 100,  
      transferVolume: transfers.transfers.reduce((acc, t) => acc + Number(t.value), 0),  
      transactions: block.transactions.length  
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
  alchemy.ws.on("block", callback);  
  return () => {  
    alchemy.ws.off("block", callback);  
  };  
};  