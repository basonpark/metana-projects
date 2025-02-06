import { Alchemy, Network } from 'alchemy-sdk';
import { formatUnits } from 'ethers';
import { Contract, WebSocketProvider } from 'ethers';
import { BlockData, TokenTransfer } from '../types/blockchain';

// Standard ERC20 ABI for transfer events
const ERC20_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'function decimals() view returns (uint8)',
];

export class BlockchainService {
  private alchemy: Alchemy;
  private provider: WebSocketProvider;
  private tokenContract: Contract;
  private decimals: number = 18;

  constructor(
    tokenAddress: string = '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT as example
  ) {
    const settings = {
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_WS_API_KEY,
      network: Network.ETH_MAINNET,
    };

    this.alchemy = new Alchemy(settings);
    this.provider = this.alchemy.ws;
    this.tokenContract = new Contract(
      tokenAddress,
      ERC20_ABI,
      this.alchemy.config.getProvider()
    );
    this.initializeDecimals();
  }

  private async initializeDecimals() {
    try {
      this.decimals = await this.tokenContract.decimals();
    } catch (error) {
      console.error('Error getting token decimals:', error);
    }
  }

  async getBlockData(blockNumber: number): Promise<BlockData> {
    const block = await this.alchemy.core.getBlock(blockNumber);
    const baseFee = block.baseFeePerGas ? 
      parseFloat(formatUnits(block.baseFeePerGas, 'gwei')) : 
      0;

    return {
      number: block.number,
      baseFee,
      gasUsed: block.gasUsed.toNumber(),
      gasLimit: block.gasLimit.toNumber(),
      gasUsedRatio: (block.gasUsed.toNumber() / block.gasLimit.toNumber()) * 100,
      timestamp: block.timestamp,
    };
  }

  async getTokenTransfers(blockNumber: number): Promise<TokenTransfer> {
    // Using Alchemy's getAssetTransfers for better performance
    const transfers = await this.alchemy.core.getAssetTransfers({
      fromBlock: blockNumber,
      toBlock: blockNumber,
      contractAddresses: [this.tokenContract.address],
      category: ["erc20"],
    });

    const totalVolume = transfers.transfers.reduce((acc, transfer) => {
      return acc + (transfer.value || 0);
    }, 0);

    return {
      blockNumber,
      totalVolume,
    };
  }

  onNewBlock(callback: (blockNumber: number) => void) {
    this.provider.on('block', callback);
  }

  disconnect() {
    this.provider.removeAllListeners();
  }
} 