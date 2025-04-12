/**
 * Represents the structure of a single outcome within a Polymarket market.
 */
export interface Outcome {
  name: string;
  // Add other relevant outcome fields if needed
}

/**
 * Represents the price information for market outcomes.
 * Assuming a structure where keys are outcome identifiers and values are prices.
 */
export interface OutcomePrices {
  [outcomeId: string]: number; // Example: { "0": 0.65, "1": 0.35 }
}

/**
 * Represents the structure of a Polymarket market fetched from the Gamma API.
 * Updated based on example data provided.
 */
export interface PolymarketMarket {
  id: string;
  slug?: string;
  question: string;
  outcomes: string; // Actual: JSON string like "[\"Yes\", \"No\"]"
  volume: number; // Assuming volume is a number - Keeping this, maybe use volumeClob/Amm?
  created_at: string;
  category?: string; // Kept as optional, might not exist
  endDate?: string; // Example has endDate
  description?: string; // Example has description
  image?: string; // Example has image
  volumeClob?: number; // Example has volumeClob
  liquidityClob?: number; // Example has liquidityClob
  bestBid?: number; // Example has bestBid (likely price for "No" outcome, 0-1)
  bestAsk?: number; // Example has bestAsk (likely price for "Yes" outcome, 0-1)
  // Add any other necessary fields based on the Gamma API response
}

/**
 * Represents the structure of the response from the Gamma API
 * when fetching a list of Polymarket markets.
 */
export interface GammaPolymarketResponse {
  markets: PolymarketMarket[];
  // Add other potential response fields like pagination info if applicable
  // e.g., next_cursor, total_count
} 