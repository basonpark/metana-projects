/**
 * Enum and structure types that mirror those defined in our smart contracts
 */

/**
 * Enum representing the status of a prediction market
 */
export enum MarketStatus {
  Open = 0,      // Market is open for bets
  Locked = 1,    // Market is locked, no more bets allowed
  Settled = 2,   // Market has been settled and payouts processed
  Cancelled = 3  // Market was cancelled
}

/**
 * Enum representing the possible outcomes of a prediction market
 */
export enum Outcome {
  NoOutcome = 0, // Default state, no outcome determined
  Yes = 1,       // The event occurred
  No = 2         // The event did not occur
}

/**
 * Interface representing a prediction market
 */
export interface Market {
  id: number;
  question: string;
  creationTime: number;
  expirationTime: number;
  settlementTime: number;
  oracle: string;
  dataFeedId: string;
  threshold: number;
  totalYesAmount: string; // Stored as string to handle big numbers
  totalNoAmount: string; // Stored as string to handle big numbers
  status: MarketStatus;
  outcome: Outcome;
  category: string;
  creator: string;
  fee: number;
}

/**
 * Interface representing a bet on a prediction market
 */
export interface Bet {
  marketId: number;
  user: string;
  prediction: Outcome;
  amount: string; // Stored as string to handle big numbers
  claimed: boolean;
}

/**
 * Interface representing statistics for a prediction market
 */
export interface MarketStats {
  totalBets: number;
  totalYesAmount: string; // Stored as string to handle big numbers
  totalNoAmount: string; // Stored as string to handle big numbers
  participantCount: number;
}

/**
 * Contract function parameters and response types
 */

/**
 * Interface representing parameters for creating a new market
 */
export interface CreateMarketParams {
  question: string;
  expirationTime: number;
  dataFeedId: string;
  threshold: number;
  category: string;
  fee: bigint; // Fee in basis points (e.g., 100n = 1%)
}

/**
 * Extended market interface with additional calculated fields
 */
export interface MarketWithMetadata extends Market {
  address: string;           // The contract address
  timeRemaining: string;     // Human-readable time remaining
  yesPrice: number;          // Calculated price for Yes outcome (0-1)
  noPrice: number;           // Calculated price for No outcome (0-1)
  liquidity: string;         // Total liquidity (Yes + No amounts)
  volume?: number;           // Trading volume
  totalLiquidity?: number;   // Total liquidity in number format for UI display
  userBets?: Bet[];          // User's bets on this market
  userPosition?: {           // User's position summary
    yes: string;             // Stored as string to handle big numbers
    no: string;              // Stored as string to handle big numbers
    potential: string;       // Stored as string to handle big numbers
  }
}

/**
 * User position in a market
 */
export interface UserPosition {
  market: MarketWithMetadata;
  betAmount: string;
  prediction: Outcome;
  potentialWinnings: string;
  claimed: boolean;
}

/**
 * Claimable reward for a user
 */
export interface ClaimableReward {
  marketAddress: string;
  marketQuestion: string;
  amount: string;
  outcome: Outcome;
}

/**
 * Type for the data returned by getMarketDetails
 * Adjust fields based on what your PredictionMarket contract's view function actually returns
 */
export interface MarketInfo {
  question: string;
  expirationTime: bigint;
  status: MarketStatus; // Use the existing enum
  category: string;
  dataFeedId: string; // Assuming bytes32 is represented as hex string
  threshold: bigint;
  fee: bigint;
  image?: string; // Optional image URL
  // Add other fields returned by your contract's info function, e.g.:
  // outcomeTokenAddresses?: [`0x${string}`, `0x${string}`];
  // currentOdds?: [bigint, bigint]; 
}

// Example structure for a Market object potentially including metadata
// export interface MarketWithMetadata extends MarketInfo {
//   marketAddress: `0x${string}`;