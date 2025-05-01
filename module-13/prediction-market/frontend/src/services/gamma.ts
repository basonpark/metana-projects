import { PolymarketAPIMarket } from '@/types/market';

// Use the proxied path via next.config.js rewrites
const GAMMA_POLYMARKET_API_ENDPOINT = '/api/gamma/markets';
const MAX_MARKETS_TO_FETCH = 500; // Changed from 1000 to 500
const LIMIT_PER_PAGE = 100; // Max markets per API request (adjust based on API capabilities)

/**
 * Represents the raw structure of a market from the Gamma API.
 * Define this based on the actual API response structure.
 * NOTE: This duplicates the old PolymarketMarket type definition somewhat,
 * but keeps the raw API structure separate before mapping.
 */
interface RawPolymarketMarket {
  id: string;
  slug?: string;
  question: string;
  outcomes: string; // JSON string like "[\"Yes\", \"No\"]"
  volume: number;
  created_at: string;
  category?: string;
  endDate?: string;
  description?: string;
  image?: string;
  volumeClob?: number;
  liquidityClob?: number;
  bestBid?: number;
  bestAsk?: number;
}

/**
 * Parses the JSON string representation of outcomes.
 */
function parseOutcomes(outcomesString: string): string[] {
  try {
    // Ensure outcomes is a string before parsing
    if (typeof outcomesString !== 'string') {
         console.warn(`Attempted to parse non-string outcomes: ${outcomesString}`);
         return [];
    }
    const parsed = JSON.parse(outcomesString);
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return parsed;
    }
  } catch (error) {
    console.error('Failed to parse outcomes string:', outcomesString, error);
  }
  return [];
}

/**
 * Converts a date string to a Unix timestamp in seconds.
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
 */
function mapRawMarketToPolymarket(rawMarket: RawPolymarketMarket): PolymarketAPIMarket {
  const parsedOutcomes = parseOutcomes(rawMarket.outcomes);
  // Basic validation for binary market based on parsed outcomes
  const isBinary = parsedOutcomes.length === 2;

  return {
    id: rawMarket.id,
    source: 'polymarket', // Added source field
    question: rawMarket.question,
    outcomes: parsedOutcomes, // Use parsed array
    volume: rawMarket.volume ?? 0,
    creationTime: dateStringToTimestamp(rawMarket.created_at),
    expirationTime: dateStringToTimestamp(rawMarket.endDate), // Assuming endDate maps to expirationTime
    category: rawMarket.category,
    slug: rawMarket.slug,
    description: rawMarket.description,
    image: rawMarket.image,
    volumeClob: rawMarket.volumeClob,
    liquidityClob: rawMarket.liquidityClob,
    // Only include bestBid/bestAsk if it's identified as binary
    bestBid: isBinary ? rawMarket.bestBid : undefined,
    bestAsk: isBinary ? rawMarket.bestAsk : undefined,
  };
}

/**
 * Fetches up to MAX_MARKETS_TO_FETCH active, binary Polymarket markets
 * by making sequential calls to the Gamma API (via proxy).
 *
 * @returns A promise that resolves to an array of active, binary Polymarket markets.
 * @throws Throws an error if any API request fails.
 */
export async function fetchActivePolymarketMarkets(): Promise<PolymarketAPIMarket[]> {
  let allMappedMarkets: PolymarketAPIMarket[] = [];
  let offset = 0;
  let hasMore = true;

  while (allMappedMarkets.length < MAX_MARKETS_TO_FETCH && hasMore) {
    const currentLimit = Math.min(LIMIT_PER_PAGE, MAX_MARKETS_TO_FETCH - allMappedMarkets.length);
    const params = new URLSearchParams({
      active: 'true',
      closed: 'false', // Ensure we only get markets that haven't ended
      limit: currentLimit.toString(),
      offset: offset.toString()
    });
    const urlString = `${GAMMA_POLYMARKET_API_ENDPOINT}?${params.toString()}`;

    try {
      console.log(`Fetching page: offset=${offset}, limit=${currentLimit} from ${urlString}`);
      const response = await fetch(urlString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add other headers like 'Accept': 'application/json' if needed
        },
        // Consider adding a timeout
        // signal: AbortSignal.timeout(10000) // Example: 10 second timeout
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Gamma API request failed with status ${response.status}: ${errorBody} for URL: ${urlString}`);
        throw new Error(`Failed to fetch Polymarket data. Status: ${response.status}`);
      }

      // Expect an array of markets directly from the proxy
      // IMPORTANT: Assuming the proxy returns the *raw* structure matching RawPolymarketMarket
      const rawMarketsData: RawPolymarketMarket[] = await response.json();

      if (!Array.isArray(rawMarketsData)) {
        console.error('Invalid data structure received from Gamma API: Expected an array, got:', rawMarketsData);
        throw new Error('Invalid data structure received from Gamma API.');
      }

      console.log(`Fetched ${rawMarketsData.length} markets from API.`);

      // Filter for binary (Yes/No) markets *after mapping*
      const mappedMarketsFromPage = rawMarketsData.map(mapRawMarketToPolymarket);
      const binaryMarketsFromPage = mappedMarketsFromPage.filter(market => market.outcomes.length === 2);

      console.log(`Found ${binaryMarketsFromPage.length} binary markets on this page.`);
      allMappedMarkets = allMappedMarkets.concat(binaryMarketsFromPage);
      console.log(`Total active binary markets collected so far: ${allMappedMarkets.length}`);

      // Check if the API returned fewer markets than requested, indicating the end
      if (rawMarketsData.length < currentLimit) {
        hasMore = false;
        console.log('API returned fewer markets than limit, stopping fetch loop.');
      } else {
        offset += rawMarketsData.length; // Increment offset by the number of *total* raw markets fetched
      }

    } catch (error) {
      console.error(`Error fetching Polymarket data chunk (offset: ${offset}):`, error);
      // Depending on requirements, you might want to return partial data or throw
      // For now, re-throw to indicate the fetch wasn't fully successful
      throw error;
    }
  }

  console.log(`Finished fetching. Total active binary markets retrieved: ${allMappedMarkets.length}`);
  return allMappedMarkets;
}

/**
 * Fetches details for a specific Polymarket market from the Gamma API (via proxy).
 *
 * @param marketId The ID of the market to fetch.
 * @returns A promise that resolves to the PolymarketAPIMarket object or null if not found/error.
 */
export async function fetchMarketById(
  marketId: string
): Promise<PolymarketAPIMarket | null> {
  if (!marketId) {
    console.error("fetchMarketById requires a marketId.");
    return null;
  }

  // Construct the URL string for the specific market
  // IMPORTANT: Ensure the API endpoint supports fetching by ID like this.
  // If the proxy needs a different structure (e.g., /api/gamma/markets?id=...), adjust this.
  const urlString = `${GAMMA_POLYMARKET_API_ENDPOINT}/${marketId}`;

  try {
    console.log(`Fetching market details from: ${urlString}`);
    const response = await fetch(urlString, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Market with ID ${marketId} not found via Gamma API.`);
        return null; // Return null specifically for 404
      }
      const errorBody = await response.text();
      console.error(
        `Gamma API request for market ${marketId} failed with status ${response.status}: ${errorBody}`
      );
      throw new Error(
        `Failed to fetch Polymarket market data. Status: ${response.status}`
      );
    }

    // Expect a single market object directly
    // IMPORTANT: Assuming the proxy returns the *raw* structure matching RawPolymarketMarket
    const rawMarketData: RawPolymarketMarket = await response.json();

    // Optional: Basic validation if needed
    if (!rawMarketData || typeof rawMarketData !== 'object' || !rawMarketData.id) {
      console.error(
        "Invalid data structure received for single market:",
        rawMarketData
      );
      throw new Error("Invalid data structure received for single market.");
    }

    // Map the raw data to our structured type
    const mappedMarket = mapRawMarketToPolymarket(rawMarketData);

     // Optional: Validate if it's a binary market if needed here too
     if (mappedMarket.outcomes.length !== 2) {
        console.warn(`Market ${mappedMarket.id} fetched by ID is not a binary market based on outcomes:`, mappedMarket.outcomes);
        // Decide how to handle non-binary markets fetched by ID - maybe return null or the mapped market anyway?
        // For now, returning it, but filtering might be desired upstream.
     }

    console.log(`Successfully fetched and mapped market ${mappedMarket.id}`);
    return mappedMarket;
  } catch (error) {
    console.error(`Error fetching market ${marketId} data:`, error);
    return null; // Return null on error
  }
}