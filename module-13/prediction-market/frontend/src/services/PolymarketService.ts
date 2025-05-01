import { PolymarketAPIMarket, Market } from '../types/market';
import { Outcome, OutcomePrices } from '../types/polymarket'; // Keep if needed for intermediate parsing

// TODO: Verify and replace with the correct Polymarket Gamma API endpoint URL
const POLYMARKET_GAMMA_API_URL = 'https://gamma-api.polymarket.com/markets'; // Example URL

/**
 * Represents the raw structure of a market from the Gamma API.
 * Define this based on the actual API response structure.
 */
interface RawPolymarketMarket {
  id: string;
  slug?: string;
  question: string;
  outcomes: string; // JSON string like "[\"Yes\", \"No\"]"
  volume: number;
  created_at: string;
  category?: string;
  endDate?: string; // Maps to expiration or settlement time?
  description?: string;
  image?: string;
  volumeClob?: number;
  liquidityClob?: number;
  bestBid?: number; // Price for "No"
  bestAsk?: number; // Price for "Yes"
  state?: 'open' | 'closed' | 'resolved'; // Add state field
  // Add any other fields returned by the API
}

/**
 * Represents the expected structure of the Gamma API response.
 */
interface GammaApiResponse {
  markets: RawPolymarketMarket[];
  // Add pagination fields if they exist (e.g., next_cursor)
}

/**
 * Parses the JSON string representation of outcomes.
 * @param outcomesString - The JSON string like "[\"Yes\", \"No\"]"
 * @returns An array of outcome names or an empty array if parsing fails.
 */
function parseOutcomes(outcomesString: string | undefined): string[] {
  if (!outcomesString) {
    return ['Yes', 'No']; // Default for binary markets if outcomes are missing
  }
  // Explicit type check to satisfy linter, though the above should guarantee it's a string
  if (typeof outcomesString !== 'string') {
    console.warn('parseOutcomes received non-string after initial check:', outcomesString);
    return ['Yes', 'No'];
  }
  try {
    const parsed = JSON.parse(outcomesString);
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return parsed;
    }
  } catch (error) {
    console.error('Failed to parse outcomes string:', outcomesString, error);
  }
  return []; // Return empty array on failure
}

/**
 * Converts a date string (like ISO 8601) to a Unix timestamp in seconds.
 * @param dateString - The date string.
 * @returns Unix timestamp in seconds, or 0 if parsing fails.
 */
function dateStringToTimestamp(dateString: string | undefined): number {
  if (!dateString) return 0;
  try {
    const timestamp = Math.floor(new Date(dateString).getTime() / 1000);
    return isNaN(timestamp) ? 0 : timestamp;
  } catch (error) {
    console.error('Failed to parse date string:', dateString, error);
    return 0;
  }
}

/**
 * Maps a raw market object from the Gamma API to our PolymarketAPIMarket interface.
 * @param rawMarket - The raw market data from the API.
 * @returns A PolymarketAPIMarket object.
 */
function mapRawMarketToPolymarket(rawMarket: RawPolymarketMarket): PolymarketAPIMarket {
  return {
    id: rawMarket.id as `0x${string}`,
    source: 'polymarket',
    question: rawMarket.question,
    state: (rawMarket.state === 'open' || rawMarket.state === 'closed' || rawMarket.state === 'resolved')
           ? rawMarket.state
           : 'open',
    outcomes: parseOutcomes(rawMarket.outcomes),
    volume: rawMarket.volume || 0,
    creationTime: dateStringToTimestamp(rawMarket.created_at),
    expirationTime: dateStringToTimestamp(rawMarket.endDate),
    category: rawMarket.category,
    slug: rawMarket.slug,
    description: rawMarket.description,
    image: rawMarket.image,
    volumeClob: rawMarket.volumeClob,
    liquidityClob: rawMarket.liquidityClob,
    bestBid: rawMarket.bestBid,
    bestAsk: rawMarket.bestAsk,
  };
}

/**
 * Fetches markets from the Polymarket Gamma API.
 * @returns A promise that resolves to an array of PolymarketAPIMarket objects.
 */
export async function fetchPolymarketMarkets(): Promise<PolymarketAPIMarket[]> {
  try {
    const response = await fetch(POLYMARKET_GAMMA_API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GammaApiResponse = await response.json();

    if (!data || !Array.isArray(data.markets)) {
        console.error('Invalid API response structure:', data);
        return [];
    }

    // Map the raw data to our structured PolymarketAPIMarket type
    const markets = data.markets.map(mapRawMarketToPolymarket);

    return markets;
  } catch (error) {
    console.error('Failed to fetch Polymarket markets:', error);
    return []; // Return an empty array in case of error
  }
}
