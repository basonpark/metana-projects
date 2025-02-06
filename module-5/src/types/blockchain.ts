export interface BlockData {
  number: number;
  baseFee: number;
  gasUsed: number;
  gasLimit: number;
  gasUsedRatio: number;
  timestamp: number;
}

export interface TokenTransfer {
  blockNumber: number;
  totalVolume: number;
}

export interface DashboardData {
  blocks: BlockData[];
  transfers: TokenTransfer[];
} 