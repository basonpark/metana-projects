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