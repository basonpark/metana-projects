import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Market, Outcome } from '@/types/contracts';

/**
 * PolymarketAPI - Service to interact with the Polymarket Gamma Markets API
 * Uses the REST API described in https://docs.polymarket.com/#gamma-markets-api
 */
class PolymarketAPI {
  private apiUrl: string;
  private httpClient: any;
  private useLocalCache: boolean = false;
  
  constructor() {
    // Polymarket Gamma API endpoint
    this.apiUrl = process.env.NEXT_PUBLIC_GAMMA_API_URL || 'https://gamma-api.polymarket.com';
    
    // Configure HTTP client with optional API key from env
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add API key if available
    if (process.env.NEXT_PUBLIC_GAMMA_API_KEY) {
      headers['X-API-KEY'] = process.env.NEXT_PUBLIC_GAMMA_API_KEY;
    }
    
    this.httpClient = axios.create({
      headers,
      // Add a longer timeout for potentially slow API responses
      timeout: 15000
    });
    
    console.log('PolymarketAPI initialized with Gamma Markets API URL:', this.apiUrl);
  }
  
  /**
   * Fetch markets from Polymarket's Gamma Markets API
   * @param limit Maximum number of markets to return
   * @param offset Number of markets to skip
   * @param category Optional category filter
   */
  async getMarkets(limit = 20, offset = 0, category?: string): Promise<any[]> {
    try {
      console.log('Fetching markets from Polymarket Gamma API');
      
      // Prepare query parameters
      const params: any = {
        limit,
        offset,
        sortBy: 'volume',
        sortDirection: 'desc',
        status: 'open'
      };
      
      if (category) {
        params.category = category;
      }
      
      // Make the request to the markets endpoint
      const response = await this.httpClient.get(`${this.apiUrl}/markets`, { params })
        .catch((error: Error) => {
          console.warn('Failed to fetch from Polymarket Gamma API:', error.message);
          return { data: null };
        });
      
      console.log(`Response status: ${response.status}`);
      
      if (response.data && response.data.markets) {
        console.log(`Found ${response.data.markets.length} markets from Gamma API`);
        const transformedMarkets = this.transformGammaMarkets(response.data.markets);
        return transformedMarkets;
      }
      
      console.warn('No valid data from Polymarket Gamma API, using fallback data');
      return this.getMockMarkets(limit, category);
    } catch (error: unknown) {
      console.error('Error fetching from Polymarket Gamma API:', error);
      return this.getMockMarkets(limit, category);
    }
  }
  
  /**
   * Transform markets data from Gamma API format to our application format
   */
  private transformGammaMarkets(marketsData: any[]): any[] {
    console.log('Transforming Gamma markets data');
    return marketsData.map(market => {
      // Calculate time remaining
      const endDate = new Date(market.end_date);
      const timeRemaining = this.calculateTimeRemaining(endDate.toISOString());
      
      // Extract outcomes and probabilities
      // Gamma API typically provides outcomes as an array with YES/NO probabilities
      const outcomes = market.outcomes ? market.outcomes.map((outcome: any) => ({
        id: outcome.id || `${market.id}-${outcome.name}`,
        marketId: market.id,
        title: outcome.name,
        probability: outcome.probability,
        price: outcome.probability
      })) : [];
      
      // Ensure we have Yes/No outcomes
      if (outcomes.length === 0) {
        // Add default YES/NO outcomes if none provided
        outcomes.push(
          {
            id: `${market.id}-yes`,
            marketId: market.id,
            title: 'Yes',
            probability: market.yes_price || 0.5,
            price: market.yes_price || 0.5
          },
          {
            id: `${market.id}-no`,
            marketId: market.id,
            title: 'No',
            probability: market.no_price || 0.5,
            price: market.no_price || 0.5
          }
        );
      } else if (outcomes.length === 1) {
        // Add complementary outcome if only one is present
        outcomes.push({
          id: `${market.id}-opposite`,
          marketId: market.id,
          title: outcomes[0].title === 'Yes' ? 'No' : 'Yes',
          probability: 1 - outcomes[0].probability,
          price: 1 - outcomes[0].price
        });
      }
      
      // Return the transformed market
      return {
        id: market.id,
        marketHash: market.id,
        question: market.question_text || market.title,
        description: market.description || 'No description available',
        category: market.category || 'Uncategorized',
        endDate: endDate.toISOString(),
        liquidity: market.liquidity || 0,
        volume: market.volume || 0,
        outcomes,
        status: market.status || 'open',
        timeRemaining,
        createdAt: market.created_at ? new Date(market.created_at).toISOString() : new Date().toISOString()
      };
    });
  }
  
  /**
   * Calculate readable time remaining from ISO date string
   */
  private calculateTimeRemaining(endDateISO: string): string {
    try {
      const endDate = new Date(endDateISO);
      
      // If the date is invalid, return 'Unknown'
      if (isNaN(endDate.getTime())) {
        return 'Unknown';
      }
      
      // If the date is in the past, return 'Ended'
      if (endDate < new Date()) {
        return 'Ended';
      }
      
      // Otherwise, return time remaining
      return formatDistanceToNow(endDate, { addSuffix: true });
    } catch (error) {
      console.error('Error calculating time remaining:', error);
      return 'Unknown';
    }
  }
  
  /**
   * Get a single market by ID
   */
  async getMarket(marketId: string): Promise<any | null> {
    try {
      console.log(`Fetching market ${marketId} from Polymarket Gamma API`);
      
      const response = await this.httpClient.get(`${this.apiUrl}/markets/${marketId}`)
        .catch((error: Error) => {
          console.warn(`Failed to fetch market ${marketId} from Polymarket Gamma API:`, error.message);
          return { data: null };
        });
      
      if (response.data && response.data.market) {
        console.log(`Found market ${marketId} from Gamma API`);
        const transformedMarket = this.transformGammaMarkets([response.data.market])[0];
        return transformedMarket;
      }
      
      console.warn(`No data for market ${marketId} from Polymarket Gamma API`);
      
      // Try to find in mock data as fallback
      const mockMarket = this.getMockMarkets().find(market => market.id === marketId);
      if (mockMarket) {
        console.log(`Using mock data for market ${marketId}`);
        return mockMarket;
      }
      
      return null;
    } catch (error: unknown) {
      console.error(`Error fetching market ${marketId}:`, error);
      
      // Try to find in mock data
      const mockMarket = this.getMockMarkets().find(market => market.id === marketId);
      return mockMarket || null;
    }
  }
  
  /**
   * Get all available categories
   */
  async getCategories(): Promise<string[]> {
    try {
      console.log('Fetching categories from Polymarket Gamma API');
      
      // For the Gamma API, we can derive categories from the markets
      const markets = await this.getMarkets(100); // Get a large sample of markets
      
      if (markets && markets.length > 0) {
        const categoriesSet = new Set<string>();
        
        markets.forEach(market => {
          if (market.category) {
            categoriesSet.add(market.category);
          }
        });
        
        const categories = Array.from(categoriesSet);
        if (categories.length > 0) {
          console.log('Extracted categories from API:', categories);
          return categories;
        }
      }
      
      // Default categories if none found
      console.warn('No categories found in API response, using defaults');
      return ['Crypto', 'Finance', 'Politics', 'Sports', 'Technology', 'Entertainment'];
    } catch (error: unknown) {
      console.error('Error fetching categories:', error);
      return ['Crypto', 'Finance', 'Politics', 'Sports', 'Technology', 'Entertainment'];
    }
  }
  
  /**
   * Get mock markets data for fallback
   */
  private getMockMarkets(limit = 20, category?: string): any[] {
    const allMockMarkets = [
      {
        id: 'mock-1',
        marketHash: 'hash-1',
        question: 'Will Bitcoin exceed $100,000 by end of 2024?',
        description: 'This market resolves to YES if the price of Bitcoin exceeds $100,000 USD at any point before December 31, 2024.',
        category: 'Crypto',
        endDate: new Date(2024, 11, 31).toISOString(),
        liquidity: 250000,
        volume: 450000,
        outcomes: [
          { id: '1', marketId: 'mock-1', title: 'Yes', probability: 0.65, price: 0.65 },
          { id: '2', marketId: 'mock-1', title: 'No', probability: 0.35, price: 0.35 }
        ],
        status: 'open',
        timeRemaining: '3 months remaining'
      },
      {
        id: 'mock-2',
        marketHash: 'hash-2',
        question: 'Will the Federal Reserve cut interest rates in Q3?',
        description: 'This market resolves to YES if the Federal Reserve cuts interest rates during Q3 2024.',
        category: 'Finance',
        endDate: new Date(2024, 8, 30).toISOString(),
        liquidity: 180000,
        volume: 320000,
        outcomes: [
          { id: '1', marketId: 'mock-2', title: 'Yes', probability: 0.42, price: 0.42 },
          { id: '2', marketId: 'mock-2', title: 'No', probability: 0.58, price: 0.58 }
        ],
        status: 'open',
        timeRemaining: '2 months remaining'
      },
      {
        id: 'mock-3',
        marketHash: 'hash-3',
        question: 'Will Apple release a new AR headset this year?',
        description: 'This market resolves to YES if Apple officially announces and releases a new AR headset product by December 31, 2024.',
        category: 'Technology',
        endDate: new Date(2024, 11, 31).toISOString(),
        liquidity: 320000,
        volume: 510000,
        outcomes: [
          { id: '1', marketId: 'mock-3', title: 'Yes', probability: 0.78, price: 0.78 },
          { id: '2', marketId: 'mock-3', title: 'No', probability: 0.22, price: 0.22 }
        ],
        status: 'open',
        timeRemaining: '3 months remaining'
      },
      {
        id: 'mock-4',
        marketHash: 'hash-4',
        question: 'Will the Democratic candidate win the 2024 US Presidential Election?',
        description: 'This market resolves to YES if the Democratic candidate wins the 2024 US Presidential Election.',
        category: 'Politics',
        endDate: new Date(2024, 10, 5).toISOString(),
        liquidity: 500000,
        volume: 750000,
        outcomes: [
          { id: '1', marketId: 'mock-4', title: 'Yes', probability: 0.52, price: 0.52 },
          { id: '2', marketId: 'mock-4', title: 'No', probability: 0.48, price: 0.48 }
        ],
        status: 'open',
        timeRemaining: '4 months remaining'
      },
      {
        id: 'mock-5',
        marketHash: 'hash-5',
        question: 'Will Real Madrid win the Champions League?',
        description: 'This market resolves to YES if Real Madrid wins the UEFA Champions League this season.',
        category: 'Sports',
        endDate: new Date(2024, 5, 1).toISOString(),
        liquidity: 150000,
        volume: 280000,
        outcomes: [
          { id: '1', marketId: 'mock-5', title: 'Yes', probability: 0.30, price: 0.30 },
          { id: '2', marketId: 'mock-5', title: 'No', probability: 0.70, price: 0.70 }
        ],
        status: 'open',
        timeRemaining: '2 months remaining'
      },
      {
        id: 'mock-6',
        marketHash: 'hash-6',
        question: 'Will Ethereum price be above $5,000 by July 2024?',
        description: 'This market resolves to YES if the price of Ethereum exceeds $5,000 USD at any point before July 31, 2024.',
        category: 'Crypto',
        endDate: new Date(2024, 6, 31).toISOString(),
        liquidity: 280000,
        volume: 420000,
        outcomes: [
          { id: '1', marketId: 'mock-6', title: 'Yes', probability: 0.45, price: 0.45 },
          { id: '2', marketId: 'mock-6', title: 'No', probability: 0.55, price: 0.55 }
        ],
        status: 'open',
        timeRemaining: '1 month remaining'
      }
    ];
    
    // Filter by category if provided
    const filteredMarkets = category 
      ? allMockMarkets.filter(market => market.category.toLowerCase() === category.toLowerCase())
      : allMockMarkets;
    
    // Return requested number of markets
    return filteredMarkets.slice(0, limit);
  }
}

// Create singleton instance
const polymarketAPI = new PolymarketAPI();
export default polymarketAPI; 