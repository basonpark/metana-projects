import { GammaPolymarketResponse, PolymarketMarket } from '@/types/polymarket';

// IMPORTANT: Replace with the actual Gamma API endpoint for Polymarket
// const GAMMA_POLYMARKET_API_ENDPOINT = 'https://gamma-api.polymarket.com/markets'; // Placeholder URL - Original Direct URL
const GAMMA_POLYMARKET_API_ENDPOINT = '/api/gamma/markets'; // Use the proxied path via next.config.js rewrites

/**
 * Fetches active Polymarket markets from the Gamma API (via proxy).
 *
 * @returns A promise that resolves to an array of active Polymarket markets.
 * @throws Throws an error if the API request fails.
 */
export async function fetchActivePolymarketMarkets(): Promise<PolymarketMarket[]> {
  // Construct the URL with query parameters for active markets and limit
  // const url = new URL(GAMMA_POLYMARKET_API_ENDPOINT); // Removed: Cannot construct URL from relative path here
  // url.searchParams.append('active', 'true');
  // url.searchParams.append('closed', 'false');
  // url.searchParams.append('limit', '50');

  // Manually construct the URL string with query parameters for fetch
  const params = new URLSearchParams({
    active: 'true',
    closed: 'false',
    limit: '50',
  });
  const urlString = `${GAMMA_POLYMARKET_API_ENDPOINT}?${params.toString()}`;

  try {
    // console.log(`Fetching Polymarket data from: ${url.toString()}`); // Use the constructed string
    console.log(`Fetching Polymarket data from: ${urlString}`); // Log the constructed URL string
    // const response = await fetch(url.toString(), { // Use the constructed string
    const response = await fetch(urlString, {
      method: 'GET',
      headers: {
        // Add any necessary headers like API keys if required by Gamma API
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer YOUR_GAMMA_API_KEY` // Example if auth is needed
      },
    });

    if (!response.ok) {
      // Log detailed error information if possible
      const errorBody = await response.text();
      console.error(`Gamma API request failed with status ${response.status}: ${errorBody}`);
      throw new Error(`Failed to fetch Polymarket data. Status: ${response.status}`);
    }

    // Assuming the API response structure IS the array of markets directly.
    // const data: GammaPolymarketResponse = await response.json(); // Original: Expected { markets: [...] }
    const marketsData: PolymarketMarket[] = await response.json(); // New: Expect [...] directly

    // Validate if the received data is an array
    // if (!data || !Array.isArray(data.markets)) { // Original check
    if (!Array.isArray(marketsData)) { // New check: Validate the data itself
      // console.error('Invalid data structure received from Gamma API:', data); // Original log
      console.error('Invalid data structure received from Gamma API: Expected an array, got:', marketsData);
      throw new Error('Invalid data structure received from Gamma API.');
    }

    // console.log(`Successfully fetched ${data.markets.length} markets.`); // Original log
    console.log(`Successfully fetched ${marketsData.length} markets.`); // New log
    // return data.markets; // Original return
    return marketsData; // Return the array directly

  } catch (error) {
    console.error('Error fetching Polymarket data:', error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
} 