import { BigNumberish } from 'ethers';

// --- Enums based on PredictionMarket.sol ---

export enum ProphitMarketStatus {
  Open,      // Market is open for bets
  Locked,    // Market is locked, no more bets allowed (past expiration)
  Settled,   // Market has been settled and payouts processed
  Cancelled  // Market was cancelled
}

export enum ProphitOutcome {
  NoOutcome, // Default state, no outcome determined
  Yes,       // The event occurred (resolutionCriteria met or API returned true)
  No         // The event did not occur (resolutionCriteria not met or API returned false)
}

export enum ProphitDataSourceType {
  ChainlinkPriceFeed,
  ExternalAPI
}

// --- Enums based on MarketStatus ---

export enum MarketStatus {
  Open, // Market is active and accepting trades
  Locked, // Market is closed for trading but not yet resolved
}

// --- Base Market Interface ---

export interface BaseMarket {
  id: string; // Use string for consistency (Prophit ID might be BigNumber initially)
  question: string;
  category?: string; // Original category from source, if available
  derivedCategory?: string; // Category determined by our logic (optional)
  image?: string; // Optional image URL
  creationTime?: number; // Unix timestamp (seconds)
  expirationTime?: number; // Unix timestamp (seconds) when trading stops
  source: 'prophit' | 'polymarket'; // Discriminator field
}

// --- Prophit Market Specific Interface ---

export interface ProphitMarket extends BaseMarket {
  source: 'prophit';
  settlementTime: number; // Unix timestamp (seconds) target for settlement
  oracleContract: string; // Address
  feedOrEndpointId: string; // bytes32 originally
  resolutionCriteria: BigNumberish; // Threshold or expected outcome (1=Yes, 0=No)
  ammYesShares: BigNumberish;
  ammNoShares: BigNumberish;
  collateralPool: BigNumberish;
  status: ProphitMarketStatus;
  outcome: ProphitOutcome;
  creator: string; // Address
  fee: BigNumberish; // Basis points
  dataSourceType: ProphitDataSourceType;
  settlementRequestId?: string; // bytes32 originally, optional

  // Frontend-added state for user interaction
  userYesShares?: BigNumberish;
  userNoShares?: BigNumberish;
  canClaim?: boolean;
}

// --- Polymarket API Specific Interface ---

export interface PolymarketAPIMarket extends BaseMarket {
  source: 'polymarket' | 'prophit';
  slug?: string;
  outcomes: string[]; // Parsed from JSON string like "[\"Yes\", \"No\"]"
  volume: number; // Maybe use volumeClob/Amm?
  description?: string;
  volumeClob?: number;
  liquidityClob?: number;
  bestBid?: number; // Price for "No" (0-1)
  bestAsk?: number; // Price for "Yes" (0-1)
  startDate?: string;
  endDate?: string;
  url?: string; // Optional url
  marketType?: 'categorical' | 'scalar'; // Optional marketType
  lastPrice?: number; // Optional lastPrice
  state: 'open' | 'closed' | 'resolved';
  tokens?: { id: string; name: string; price: number; color: string }[];
  liquidity?: number;
  // 'endDate' from API could potentially map to 'settlementTime' if needed
  id: `0x${string}`; // Ensure ID matches the address type
}

// --- Unified Display Interface ---

export interface DisplayMarket {
  id: string; // Market address (0x...) or Polymarket ID
  question: string;
  image: string;
  category: string; // Original category or derived category
  derivedCategory?: string; // Keep for consistency
  source: 'polymarket' | 'prophit';
  expirationTime?: number; // Unix timestamp (optional for display flexibility)
  endDate?: string; // Polymarket's end date string (optional)
  bestAsk?: number; // Price for 'Yes' (0-1, optional)
  bestBid?: number; // Price for 'No' (0-1, optional)
  lastPrice?: number; // Last trade price (optional)
  slug?: string; // Polymarket specific (optional)
  url?: string; // Polymarket specific (optional)
  liquidity?: number; // Optional liquidity figure for sorting/filtering
  status?: MarketStatus; // Add the missing status field
  // Add any other common fields required by MarketCard, e.g., volume?
}

// --- Union Type and Type Guards ---

export type Market = ProphitMarket | PolymarketAPIMarket;

export function isProphitMarket(market: Market): market is ProphitMarket {
  return market.source === 'prophit';
}

export function isPolymarketMarket(market: Market): market is PolymarketAPIMarket {
  return market.source === 'polymarket' || market.source === 'prophit';
}
