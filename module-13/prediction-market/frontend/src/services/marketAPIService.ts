/**
 * Simple service to fetch market data from Gamma API
 */

// Simple type for market data
type Market = {
  id: string;
  question: string;
  resolution_time: number;
  yes_price: number;
  no_price: number;
  liquidity: string;
  status: string;
  category: string;
};

/**
 * Fetch market data from Gamma API
 */
export async function fetchMarkets(): Promise<Market[]> {
  try {
    const response = await fetch('https://gamma-api.polymarket.com/events/active');
    const data = await response.json();
    
    // Filter for active markets only
    const activeEvents = data.data.filter(
      (event: any) => event.markets?.length > 0 && event.is_active && !event.is_closed
    );
    
    // Transform to our simplified format
    return activeEvents.map((event: any) => ({
      id: event.slug,
      question: event.title,
      resolution_time: new Date(event.end_date).getTime() / 1000,
      yes_price: event.markets[0]?.yes_price || 0.5,
      no_price: event.markets[0]?.no_price || 0.5,
      liquidity: event.markets[0]?.liquidity?.toString() || "0",
      status: event.is_active ? 'Open' : 'Closed',
      category: event.category || 'Other'
    }));
  } catch (error) {
    console.error('Error fetching markets:', error);
    return [];
  }
}