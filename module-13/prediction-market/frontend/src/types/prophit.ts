/**
 * Represents the structure of an outcome for a Prophit market.
 * Placeholder structure - adjust as needed.
 */
export interface ProphitOutcome {
  id: number | string; // Unique identifier for the outcome
  name: string;        // Display name (e.g., "Yes", "No", "Candidate A")
  price: number;       // Current price (0-1 or specific currency)
  shares: number;      // Total shares outstanding or liquidity
}

/**
 * Represents the structure of a Prophit market from your custom API/blockchain.
 * Placeholder structure - adjust based on your actual data.
 */
export interface ProphitMarket {
  id: string;               // Unique market ID from your system
  creator: string;          // Address of the market creator
  question: string;         // The prediction question
  description?: string;      // Optional detailed description
  outcomes: ProphitOutcome[]; // Array of possible outcomes
  endDate: number;          // Timestamp for market resolution
  volume: number;           // Trading volume
  liquidity: number;        // Market liquidity
  category?: string;         // Market category
  image?: string;            // Optional image URL
  // Add any other relevant fields from your contract/API
}

/**
 * Represents the structure for creating a new Prophit market.
 * Placeholder structure - adjust based on your creation logic.
 */
export interface CreateProphitMarketInput {
    question: string;
    description?: string;
    outcomeNames: string[]; // Names for the outcomes (e.g., ["Yes", "No"])
    endDate: number; // Timestamp
    initialLiquidity?: number;
    category?: string;
    image?: string;
}

/**
 * Represents the structure for buying/selling shares in a Prophit market.
 * Placeholder structure - adjust based on your trading logic.
 */
export interface TradeProphitSharesInput {
    marketId: string;
    outcomeId: number | string;
    amount: number; // Number of shares or amount of collateral
    action: 'buy' | 'sell';
}
