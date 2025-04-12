import { PolymarketMarket } from '@/types/polymarket';

// Use the proxied path via next.config.js rewrites
const GAMMA_POLYMARKET_API_ENDPOINT = '/api/gamma/markets';
const MAX_MARKETS_TO_FETCH = 500; // Changed from 1000 to 500
const LIMIT_PER_PAGE = 100; // Max markets per API request (adjust based on API capabilities)

/**
 * Fetches up to MAX_MARKETS_TO_FETCH active, binary Polymarket markets
 * by making sequential calls to the Gamma API (via proxy).
 *
 * @returns A promise that resolves to an array of active, binary Polymarket markets.
 * @throws Throws an error if any API request fails.
 */
export async function fetchActivePolymarketMarkets(): Promise<PolymarketMarket[]> {
  let allBinaryMarkets: PolymarketMarket[] = [];
  let offset = 0;
  let hasMore = true;

  console.log(`Starting fetch loop to get up to ${MAX_MARKETS_TO_FETCH} active binary markets...`);

  while (allBinaryMarkets.length < MAX_MARKETS_TO_FETCH && hasMore) {
    const currentLimit = Math.min(LIMIT_PER_PAGE, MAX_MARKETS_TO_FETCH - allBinaryMarkets.length);
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
      const marketsData: PolymarketMarket[] = await response.json();

      if (!Array.isArray(marketsData)) {
        console.error('Invalid data structure received from Gamma API: Expected an array, got:', marketsData);
        throw new Error('Invalid data structure received from Gamma API.');
      }

      console.log(`Fetched ${marketsData.length} markets from API.`);

      // Filter for binary (Yes/No) markets *from the current page*
      const binaryMarketsFromPage = marketsData.filter(market => {
        try {
            // Ensure outcomes is a string before parsing
            if (typeof market.outcomes !== 'string') {
                 console.warn(`Filtering out market ${market.id} due to non-string outcomes: ${market.outcomes}`);
                 return false;
            }
          const outcomesArray = JSON.parse(market.outcomes);
          // Check if it's an array with exactly 2 outcomes
          return Array.isArray(outcomesArray) && outcomesArray.length === 2;
        } catch (e) {
          console.warn(`Filtering out market ${market.id} due to invalid JSON in outcomes: ${market.outcomes}`, e);
          return false;
        }
      });

      console.log(`Found ${binaryMarketsFromPage.length} binary markets on this page.`);
      allBinaryMarkets = allBinaryMarkets.concat(binaryMarketsFromPage);
      console.log(`Total active binary markets collected so far: ${allBinaryMarkets.length}`);

      // Check if the API returned fewer markets than requested, indicating the end
      if (marketsData.length < currentLimit) {
        hasMore = false;
        console.log('API returned fewer markets than limit, stopping fetch loop.');
      } else {
        offset += marketsData.length; // Increment offset by the number of *total* markets fetched (not just binary)
      }

    } catch (error) {
      console.error(`Error fetching Polymarket data chunk (offset: ${offset}):`, error);
      // Depending on requirements, you might want to return partial data or throw
      // For now, re-throw to indicate the fetch wasn't fully successful
      throw error;
    }
  }

  console.log(`Finished fetching. Total active binary markets retrieved: ${allBinaryMarkets.length}`);
  return allBinaryMarkets;
}

/**
 * Fetches details for a specific Polymarket market from the Gamma API (via proxy).
 *
 * @param marketId The ID of the market to fetch.
 * @returns A promise that resolves to the PolymarketMarket object or null if not found/error.
 */
export async function fetchMarketById(
  marketId: string
): Promise<PolymarketMarket | null> {
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
    const marketData: PolymarketMarket = await response.json();

    // Optional: Basic validation if needed
    if (!marketData || typeof marketData !== 'object' || !marketData.id) {
      console.error(
        "Invalid data structure received for single market:",
        marketData
      );
      throw new Error("Invalid data structure received for single market.");
    }

     // Optional: Validate if it's a binary market if needed here too
     try {
        if (typeof marketData.outcomes !== 'string') {
             console.warn(`Market ${marketData.id} has non-string outcomes: ${marketData.outcomes}`);
             // Decide if this is an error or just needs handling
        } else {
            const outcomesArray = JSON.parse(marketData.outcomes);
            if (!Array.isArray(outcomesArray) || outcomesArray.length !== 2) {
                console.warn(`Market ${marketData.id} is not a binary market based on outcomes:`, outcomesArray);
                // Decide how to handle non-binary markets fetched by ID
            }
        }
    } catch (e) {
        console.warn(`Market ${marketData.id} has invalid JSON outcomes: ${marketData.outcomes}`, e);
        // Decide how to handle this case
    }


    console.log(`Successfully fetched market ${marketData.id}`);
    return marketData;
  } catch (error) {
    console.error(`Error fetching market ${marketId} data:`, error);
    return null; // Return null on error
  }
} 