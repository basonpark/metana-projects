import axios from 'axios';

/**
 * Types for Gamma API responses
 */
export interface Market {
  id: string;
  marketHash: string;
  question: string;
  description: string;
  category: string;
  endDate: string;
  liquidity: number;
  volume: number;
  outcomes: Outcome[];
  status: 'open' | 'closed' | 'resolved';
  imageUrl?: string;
  timeRemaining?: string; // calculated field
}

export interface Outcome {
  id: string;
  marketId: string;
  title: string;
  probability: number;
  price: number;
  imageUrl?: string;
}

/**
 * GammaAPI - Service to interact with the Polymarket Gamma API
 * This provides real-world market data that we can use as inspiration
 * for our own prediction markets
 */
class GammaAPI {
  private apiUrl: string;
  private apiKey: string | undefined;
  
  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_GAMMA_API_URL || 'https://gamma-api.polymarket.com';
    this.apiKey = process.env.NEXT_PUBLIC_GAMMA_API_KEY;
  }
  
  /**
   * Configure the Axios instance with necessary headers
   */
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (this.apiKey) {
      headers['x-gamma-api-key'] = this.apiKey;
    }
    
    return headers;
  }
  
  /**
   * Get all markets from Gamma API
   * @param limit Maximum number of markets to return
   * @param offset Number of markets to skip
   * @param category Optional category filter
   */
  async getMarkets(limit = 20, offset = 0, category?: string): Promise<Market[]> {
    try {
      const params: Record<string, any> = {
        limit,
        offset
      };
      
      if (category) {
        params.category = category;
      }
      
      const response = await axios.get(`${this.apiUrl}/markets`, {
        headers: this.getHeaders(),
        params
      });
      
      // Add calculated fields like timeRemaining
      const markets = response.data.markets.map((market: Market) => {
        market.timeRemaining = this.calculateTimeRemaining(market.endDate);
        return market;
      });
      
      return markets;
    } catch (error) {
      console.error('Error fetching markets from Gamma API:', error);
      return [];
    }
  }
  
  /**
   * Get a single market by its ID
   * @param marketId ID of the market to fetch
   */
  async getMarket(marketId: string): Promise<Market | null> {
    try {
      const response = await axios.get(`${this.apiUrl}/markets/${marketId}`, {
        headers: this.getHeaders()
      });
      
      const market = response.data;
      market.timeRemaining = this.calculateTimeRemaining(market.endDate);
      
      return market;
    } catch (error) {
      console.error(`Error fetching market ${marketId} from Gamma API:`, error);
      return null;
    }
  }
  
  /**
   * Get market categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/categories`, {
        headers: this.getHeaders()
      });
      
      return response.data.categories;
    } catch (error) {
      console.error('Error fetching categories from Gamma API:', error);
      return ['Crypto', 'Politics', 'Sports', 'Entertainment']; // Fallback categories
    }
  }
  
  /**
   * Calculate human-readable time remaining string
   */
  private calculateTimeRemaining(endDate: string): string {
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
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    
    // Format time remaining string
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }
  
  /**
   * Search markets by query
   * @param query Search query
   * @param limit Maximum number of markets to return
   */
  async searchMarkets(query: string, limit = 20): Promise<Market[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/markets/search`, {
        headers: this.getHeaders(),
        params: {
          query,
          limit
        }
      });
      
      const markets = response.data.markets.map((market: Market) => {
        market.timeRemaining = this.calculateTimeRemaining(market.endDate);
        return market;
      });
      
      return markets;
    } catch (error) {
      console.error(`Error searching markets with query "${query}" from Gamma API:`, error);
      return [];
    }
  }
}

// Export singleton instance
const gammaAPI = new GammaAPI();
export default gammaAPI; 