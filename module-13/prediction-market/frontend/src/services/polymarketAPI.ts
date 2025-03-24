import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Market, Outcome } from '@/types/contracts';

/**
 * PolymarketAPI - Service to interact with the Polymarket GraphQL API (subgraph)
 * This provides real market data from Polymarket's prediction markets
 */
class PolymarketAPI {
  private subgraphUrl: string;
  private httpClient: any;
  
  constructor() {
    // Polymarket's subgraph URL on The Graph
    // Note: This is an example URL - replace with the actual subgraph URL
    this.subgraphUrl = process.env.NEXT_PUBLIC_POLYMARKET_SUBGRAPH_URL || 
      'https://api.goldsky.com/api/public/project_cl6mb8i9h0003e201j6li0diw/subgraphs/positions-subgraph/0.0.7/gn'
    this.httpClient = axios.create({
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
  
  /**
   * Fetch markets from Polymarket's subgraph
   * @param limit Maximum number of markets to return
   * @param offset Number of markets to skip
   * @param category Optional category filter
   */
  async getMarkets(limit = 20, offset = 0, category?: string): Promise<any[]> {
    try {
      // GraphQL query to fetch markets
      const query = `
        query GetMarkets($limit: Int!, $offset: Int!, $category: String) {
          markets(
            first: $limit,
            skip: $offset,
            where: ${category ? '{ category: $category }' : '{}'},
            orderBy: volume,
            orderDirection: desc
          ) {
            id
            question
            description
            category
            endTimestamp
            volume
            liquidity
            outcomes {
              id
              title
              price
              volume
            }
            status
            creationTimestamp
          }
        }
      `;
      
      const variables = {
        limit,
        offset,
        category
      };
      
      console.log('GraphQL query variables:', variables);
      
      // Execute the GraphQL query with error handling
      const response = await this.httpClient.post(this.subgraphUrl, {
        query,
        variables
      }).catch((error: any) => {
        console.warn('Failed to fetch from Polymarket API:', error.message);
        return { data: null };
      });
      
      console.log('Polymarket API response:', response.data);
      
      // Check if we have valid data
      if (response.data?.data?.markets) {
        const markets = this.transformMarkets(response.data.data.markets);
        console.log('Transformed markets from API:', markets);
        return markets;
      }
      
      console.warn('No data from Polymarket API:', response.data?.errors || 'No markets found');
      
      // Return empty array instead of falling back to mock data
      return [];
    } catch (error) {
      console.error('Error fetching from Polymarket subgraph:', error);
      // Return empty array instead of falling back to mock data
      return [];
    }
  }
  
  /**
   * Transform Polymarket markets data to our application format
   */
  private transformMarkets(marketsData: any[]): any[] {
    console.log('Transforming markets data:', marketsData);
    return marketsData.map(market => {
      // Calculate time remaining
      const endDate = new Date(Number(market.endTimestamp) * 1000);
      const timeRemaining = this.calculateTimeRemaining(endDate.toISOString());
      
      // Transform outcomes to match our format
      const outcomes = market.outcomes.map((outcome: any) => ({
        id: outcome.id,
        marketId: market.id,
        title: outcome.title,
        probability: parseFloat(outcome.price), // Convert from string to number
        price: parseFloat(outcome.price)
      }));
      
      // Ensure we have Yes/No outcomes
      if (outcomes.length === 1) {
        // Add the opposite outcome if only one is present
        outcomes.push({
          id: `${market.id}-opposite`,
          marketId: market.id,
          title: outcomes[0].title === 'Yes' ? 'No' : 'Yes',
          probability: 1 - outcomes[0].probability,
          price: 1 - outcomes[0].price
        });
      }
      
      // Sort outcomes to ensure Yes is first, No is second
      outcomes.sort((a: any, b: any) => {
        if (a.title === 'Yes') return -1;
        if (b.title === 'Yes') return 1;
        return 0;
      });
      
      // Return the transformed market
      return {
        id: market.id,
        marketHash: market.id,
        question: market.question,
        description: market.description || 'No description available',
        category: market.category || 'Uncategorized',
        endDate: endDate.toISOString(),
        liquidity: parseFloat(market.liquidity || '0'),
        volume: parseFloat(market.volume || '0'),
        outcomes,
        status: market.status || 'open',
        timeRemaining,
        createdAt: new Date(Number(market.creationTimestamp) * 1000).toISOString()
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
   * Get mock markets data when API fails
   * This is identical to the mock data in gammaAPI.ts but kept for compatibility
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
      }
    ];
    
    // Filter by category if provided
    const filteredMarkets = category 
      ? allMockMarkets.filter(market => market.category.toLowerCase() === category.toLowerCase())
      : allMockMarkets;
    
    // Return requested number of markets
    return filteredMarkets.slice(0, limit);
  }
  
  /**
   * Get a single market by ID
   */
  async getMarket(marketId: string): Promise<any | null> {
    try {
      console.log(`Fetching market ${marketId} from Polymarket API`);
      
      // GraphQL query to fetch a single market
      const query = `
        query GetMarket($id: ID!) {
          market(id: $id) {
            id
            question
            description
            category
            endTimestamp
            volume
            liquidity
            outcomes {
              id
              title
              price
              volume
            }
            status
            creationTimestamp
          }
        }
      `;
      
      // Execute the GraphQL query with error handling
      const response = await this.httpClient.post(this.subgraphUrl, {
        query,
        variables: {
          id: marketId
        }
      }).catch((error: any) => {
        console.warn(`Failed to fetch market ${marketId} from Polymarket API:`, error.message);
        return { data: null };
      });
      
      console.log(`Polymarket API response for market ${marketId}:`, response.data);
      
      // Check if we have valid data
      if (response.data?.data?.market) {
        const market = this.transformMarkets([response.data.data.market])[0];
        console.log(`Transformed market ${marketId}:`, market);
        return market;
      }
      
      console.warn(`No data for market ${marketId} from Polymarket API:`, response.data?.errors || 'Market not found');
      return null;
    } catch (error) {
      console.error(`Error fetching market ${marketId}:`, error);
      return null;
    }
  }
  
  /**
   * Get all available categories
   */
  async getCategories(): Promise<string[]> {
    try {
      console.log('Fetching categories from Polymarket API');
      
      // GraphQL query to fetch categories
      const query = `
        query GetCategories {
          categories: markets(first: 1000) {
            category
          }
        }
      `;
      
      // Execute the GraphQL query with error handling
      const response = await this.httpClient.post(this.subgraphUrl, {
        query
      }).catch((error: any) => {
        console.warn('Failed to fetch categories from Polymarket API:', error.message);
        return { data: null };
      });
      
      console.log('Polymarket API response for categories:', response.data);
      
      // Extract unique categories
      if (response.data?.data?.categories) {
        const categoriesSet = new Set<string>();
        
        response.data.data.categories.forEach((item: any) => {
          if (item.category) {
            categoriesSet.add(item.category);
          }
        });
        
        const categories = Array.from(categoriesSet);
        console.log('Extracted categories:', categories);
        return categories;
      }
      
      // Default categories if none found
      console.warn('No categories found in API response, using defaults');
      return ['Crypto', 'Finance', 'Politics', 'Sports', 'Technology', 'Entertainment'];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return ['Crypto', 'Finance', 'Politics', 'Sports', 'Technology', 'Entertainment'];
    }
  }
}

// Create singleton instance
const polymarketAPI = new PolymarketAPI();
export default polymarketAPI; 