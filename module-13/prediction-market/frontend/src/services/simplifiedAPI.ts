/**
 * Simple API service that fetches active market data through our Next.js API route
 */

// Simplified type for market data needed for the list view
interface MarketListItem {
  id: string; // Using slug as ID
  question: string;
  yesPrice: number;
  noPrice: number;
  volume: string;
  endDate: string;
  category: string;
}

/**
 * Fetch active markets from our API proxy using the /markets endpoint
 */
export async function fetchActiveMarkets(limit = 50): Promise<MarketListItem[]> {
  try {
    // Construct the query parameters
    const params = new URLSearchParams({
      limit: limit.toString(),
      active: 'true',
      closed: 'false',
      orderBy: 'volume',
      ascending: 'false',
    });
    
    // Use our local API route proxy
    const response = await fetch(`/api/gamma/markets?${params.toString()}`);
    
    if (!response.ok) {
      console.error(`Error fetching from proxy: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error(`Proxy error body: ${errorBody}`);
      throw new Error(`Failed to fetch markets via proxy: ${response.status}`);
    }
    
    const data = await response.json();
    
    // The actual market data is usually inside a key, often `data` or `markets`
    const marketsData = data.data || data.markets || data; // Adjust based on actual response
    
    if (!Array.isArray(marketsData)) {
      console.error("API response did not contain a valid markets array:", marketsData);
      return [];
    }

    // Transform to our simplified format
    return marketsData.map((market: any) => {
      // Extract YES/NO prices from outcomePrices or outcomes array
      let yesPrice = 0.5;
      let noPrice = 0.5;
      
      if (market.outcomePrices && market.outcomePrices.length >= 2) {
        // Assuming YES is often the first, NO the second - adjust if needed
        yesPrice = parseFloat(market.outcomePrices[0]) || 0.5;
        noPrice = parseFloat(market.outcomePrices[1]) || 0.5;
      } else if (market.outcomes && market.outcomes.length >= 2) {
        // Fallback to outcomes if outcomePrices isn't available
        yesPrice = market.outcomes[0]?.price || 0.5;
        noPrice = market.outcomes[1]?.price || 0.5;
      }
      
      return {
        id: market.slug, // Use slug as the unique ID for the list
        question: market.question,
        endDate: market.endDate || market.end_date, // Handle different key names
        yesPrice: yesPrice,
        noPrice: noPrice,
        volume: market.volume?.toString() || "0",
        category: market.category || 'Other',
      };
    });
  } catch (error) {
    console.error('Error fetching active markets:', error);
    // Return empty array on error; the page component can handle fallback UI
    return [];
  }
}

/**
 * Calculate human-readable time remaining
 */
export function calculateTimeRemaining(endDate: string): string {
  if (!endDate) return 'Unknown date'; // Guard against undefined dates
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  const distance = end - now;
  
  // Return expired if in the past
  if (distance < 0) {
    return 'Expired';
  }
  
  // Calculate time units
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  // Format time remaining string
  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  } else if (hours >= 0) { // Show 0h if less than an hour left
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  } else {
     return 'Expired'; // Should be caught by distance < 0, but as fallback
  }
}