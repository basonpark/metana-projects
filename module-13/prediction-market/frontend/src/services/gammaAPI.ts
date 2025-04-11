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
  createdAt?: string; // added for mock data
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
    // Use our local API proxy to avoid CORS issues
    this.apiUrl = '/api/gamma';
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
      
      try {
        const response = await axios.get(`${this.apiUrl}/markets`, {
          headers: this.getHeaders(),
          params,
          timeout: 5000 // Add a timeout to prevent long-hanging requests
        });
        
        // Add calculated fields like timeRemaining
        const markets = response.data.markets.map((market: Market) => {
          market.timeRemaining = this.calculateTimeRemaining(market.endDate);
          return market;
        });
        
        return markets;
      } catch (apiError) {
        console.warn('Failed to fetch from Gamma API, using mock data:', apiError);
        // Return mock data if API call fails
        return this.getMockMarkets(limit, category);
      }
    } catch (error) {
      console.error('Error in Gamma API getMarkets:', error);
      return this.getMockMarkets(limit, category);
    }
  }
  
  /**
   * Get mock markets data when API fails
   * @param limit Maximum number of markets to return
   * @param category Optional category filter
   */
  private getMockMarkets(limit = 20, category?: string): Market[] {
    const allMockMarkets: Market[] = [
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
        timeRemaining: '3 days remaining'
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
        timeRemaining: '5 days remaining'
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
        timeRemaining: '12 hours remaining'
      },
      {
        id: 'mock-4',
        marketHash: 'hash-4',
        question: 'Will the Democratic candidate win the 2024 US Presidential Election?',
        description: 'This market resolves to YES if the Democratic Party candidate wins the 2024 US Presidential Election.',
        category: 'Politics',
        endDate: new Date(2024, 10, 5).toISOString(),
        liquidity: 500000,
        volume: 950000,
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
        description: 'This market resolves to YES if Real Madrid wins the UEFA Champions League in the 2024/2025 season.',
        category: 'Sports',
        endDate: new Date(2025, 4, 30).toISOString(),
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
        volume: 520000,
        outcomes: [
          { id: '1', marketId: 'mock-6', title: 'Yes', probability: 0.45, price: 0.45 },
          { id: '2', marketId: 'mock-6', title: 'No', probability: 0.55, price: 0.55 }
        ],
        status: 'open',
        timeRemaining: '1 month remaining'
      }
    ];
    
    // Filter by category if provided
    let filteredMarkets = category 
      ? allMockMarkets.filter(market => market.category.toLowerCase() === category.toLowerCase())
      : allMockMarkets;
    
    // Apply limit
    return filteredMarkets.slice(0, limit);
  }
  
  /**
   * Get a single market by its ID
   * @param marketId ID of the market to fetch
   */
  async getMarket(marketId: string): Promise<Market | null> {
    try {
      try {
        const response = await axios.get(`${this.apiUrl}/markets/${marketId}`, {
          headers: this.getHeaders(),
          timeout: 5000 // Add a timeout to prevent long-hanging requests
        });
        
        const market = response.data;
        market.timeRemaining = this.calculateTimeRemaining(market.endDate);
        
        return market;
      } catch (apiError) {
        console.warn(`Failed to fetch market ${marketId} from Gamma API, using mock data:`, apiError);
        // Return mock data if API call fails
        return this.getMockMarket(marketId);
      }
    } catch (error) {
      console.error(`Error in Gamma API getMarket:`, error);
      return this.getMockMarket(marketId);
    }
  }
  
  /**
   * Get a mock market when API fails
   * @param marketId ID of the market to mock
   */
  private getMockMarket(marketId: string): Market | null {
    // Try to find in mock markets
    const allMockMarkets = this.getMockMarkets(10);
    const mockMarket = allMockMarkets.find(m => m.id === marketId);
    
    if (mockMarket) {
      return mockMarket;
    }
    
    // If not found, create a generic one
    return {
      id: marketId,
      marketHash: `hash-${marketId}`,
      question: 'Sample prediction market question',
      description: 'This is a sample prediction market with mock data.',
      category: 'Crypto',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      liquidity: 200000,
      volume: 350000,
      outcomes: [
        { id: '1', marketId, title: 'Yes', probability: 0.5, price: 0.5 },
        { id: '2', marketId, title: 'No', probability: 0.5, price: 0.5 }
      ],
      status: 'open',
      timeRemaining: '7 days remaining'
    };
  }
  
  /**
   * Get market categories
   */
  async getCategories(): Promise<string[]> {
    try {
      try {
        const response = await axios.get(`${this.apiUrl}/categories`, {
          headers: this.getHeaders(),
          timeout: 5000 // Add a timeout to prevent long-hanging requests
        });
        
        return response.data.categories;
      } catch (apiError) {
        console.warn('Failed to fetch categories from Gamma API, using fallback categories:', apiError);
        return this.getMockCategories();
      }
    } catch (error) {
      console.error('Error in Gamma API getCategories:', error);
      return this.getMockCategories();
    }
  }
  
  /**
   * Get mock categories when API fails
   */
  private getMockCategories(): string[] {
    return [
      'Crypto',
      'Politics',
      'Sports',
      'Finance',
      'Entertainment',
      'Technology',
      'Science',
      'Health'
    ];
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
      try {
        const response = await axios.get(`${this.apiUrl}/markets/search`, {
          headers: this.getHeaders(),
          params: {
            query,
            limit
          },
          timeout: 5000 // Add a timeout to prevent long-hanging requests
        });
        
        const markets = response.data.markets.map((market: Market) => {
          market.timeRemaining = this.calculateTimeRemaining(market.endDate);
          return market;
        });
        
        return markets;
      } catch (apiError) {
        console.warn(`Failed to search markets with query "${query}" from Gamma API, using mock data:`, apiError);
        // Return filtered mock data if API call fails
        return this.searchMockMarkets(query, limit);
      }
    } catch (error) {
      console.error(`Error in Gamma API searchMarkets:`, error);
      return this.searchMockMarkets(query, limit);
    }
  }
  
  /**
   * Search mock markets when API fails
   * @param query Search query
   * @param limit Maximum number of markets to return
   */
  private searchMockMarkets(query: string, limit = 20): Market[] {
    if (!query) return this.getMockMarkets(limit);
    
    // Simple search on mock markets
    const allMockMarkets = this.getMockMarkets(50); // Get all mocks
    const lowerQuery = query.toLowerCase();
    
    // Filter markets based on question or description containing the query
    const filteredMarkets = allMockMarkets.filter(market => 
      market.question.toLowerCase().includes(lowerQuery) || 
      market.description.toLowerCase().includes(lowerQuery) ||
      market.category.toLowerCase().includes(lowerQuery)
    );
    
    return filteredMarkets.slice(0, limit);
  }
  
  /**
   * Get markets by category
   * 
   * @param category Category to filter markets by
   * @returns List of markets in the specified category
   */
  async getMarketsByCategory(category: string): Promise<Market[]> {
    try {
      // First try to get all markets
      const markets = await this.getMarkets();
      
      // Filter by category (case insensitive comparison)
      if (category === 'popular') {
        // For "popular", return markets with highest liquidity
        return markets
          .sort((a, b) => (b.liquidity || 0) - (a.liquidity || 0))
          .slice(0, 9);
      }
      
      return markets.filter(market => 
        market.category?.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      console.error('Error fetching markets by category:', error);
      // Return mock data for demo purposes
      return this.getMockMarketsByCategory(category);
    }
  }
  
  /**
   * Get mock markets for a category when API fails
   * This is used for demo purposes
   */
  private getMockMarketsByCategory(category: string): Market[] {
    const mockMarkets = this.getMockMarkets();
    
    if (category === 'popular') {
      return mockMarkets.slice(0, 6);
    }
    
    return mockMarkets
      .filter(market => market.category.toLowerCase() === category.toLowerCase())
      .slice(0, 6);
  }

  /**
   * Get mock markets for demo purposes
   */
  private getMockMarkets(): Market[] {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Generate mock markets
    return [
      {
        id: '1',
        marketHash: '0x1',
        question: 'Will Bitcoin price exceed $100,000 by the end of 2024?',
        description: 'Market resolves to "Yes" if the price of Bitcoin (BTC) exceeds $100,000 USD at any point before or on December 31, 2024, 11:59 PM UTC according to the CoinGecko price index.',
        category: 'Crypto',
        endDate: nextMonth.toISOString(),
        liquidity: 250000,
        volume: 500000,
        outcomes: [
          { id: '1', marketId: '1', title: 'Yes', probability: 0.65, price: 0.65 },
          { id: '2', marketId: '1', title: 'No', probability: 0.35, price: 0.35 }
        ],
        status: 'open',
        createdAt: yesterday.toISOString(),
        timeRemaining: '30 days'
      },
      {
        id: '2',
        marketHash: '0x2',
        question: 'Will Ethereum complete the Cancun-Deneb upgrade before July 2024?',
        description: 'Market resolves to "Yes" if Ethereum\'s Cancun-Deneb upgrade (also known as Dencun) is successfully implemented on the Ethereum mainnet before July 1, 2024, 00:00 UTC.',
        category: 'Crypto',
        endDate: nextWeek.toISOString(),
        liquidity: 180000,
        volume: 350000,
        outcomes: [
          { id: '3', marketId: '2', title: 'Yes', probability: 0.8, price: 0.8 },
          { id: '4', marketId: '2', title: 'No', probability: 0.2, price: 0.2 }
        ],
        status: 'open',
        createdAt: yesterday.toISOString(),
        timeRemaining: '7 days'
      },
      {
        id: '3',
        marketHash: '0x3',
        question: 'Will Donald Trump win the 2024 US Presidential Election?',
        description: 'Market resolves to "Yes" if Donald Trump wins the 2024 US Presidential Election and is declared the president-elect by major news networks.',
        category: 'Politics',
        endDate: nextMonth.toISOString(),
        liquidity: 500000,
        volume: 1200000,
        outcomes: [
          { id: '5', marketId: '3', title: 'Yes', probability: 0.52, price: 0.52 },
          { id: '6', marketId: '3', title: 'No', probability: 0.48, price: 0.48 }
        ],
        status: 'open',
        createdAt: yesterday.toISOString(),
        timeRemaining: '30 days'
      },
      {
        id: '4',
        marketHash: '0x4',
        question: 'Will the Kansas City Chiefs win the Super Bowl LIX?',
        description: 'Market resolves to "Yes" if the Kansas City Chiefs win Super Bowl LIX (59) to be held on February 9, 2025.',
        category: 'Sports',
        endDate: nextMonth.toISOString(),
        liquidity: 320000,
        volume: 780000,
        outcomes: [
          { id: '7', marketId: '4', title: 'Yes', probability: 0.28, price: 0.28 },
          { id: '8', marketId: '4', title: 'No', probability: 0.72, price: 0.72 }
        ],
        status: 'open',
        createdAt: yesterday.toISOString(),
        timeRemaining: '30 days'
      },
      {
        id: '5',
        marketHash: '0x5',
        question: 'Will Apple release a foldable iPhone before the end of 2024?',
        description: 'Market resolves to "Yes" if Apple officially announces and releases for sale a foldable iPhone device before December 31, 2024, 11:59 PM UTC.',
        category: 'Technology',
        endDate: tomorrow.toISOString(),
        liquidity: 150000,
        volume: 320000,
        outcomes: [
          { id: '9', marketId: '5', title: 'Yes', probability: 0.15, price: 0.15 },
          { id: '10', marketId: '5', title: 'No', probability: 0.85, price: 0.85 }
        ],
        status: 'open',
        createdAt: yesterday.toISOString(),
        timeRemaining: '1 day'
      },
      {
        id: '6',
        marketHash: '0x6',
        question: 'Will SpaceX successfully complete the first crewed Starship mission to orbit in 2024?',
        description: 'Market resolves to "Yes" if SpaceX launches a Starship vehicle with at least one human passenger that successfully reaches Earth orbit and returns safely before December 31, 2024.',
        category: 'Science',
        endDate: nextWeek.toISOString(),
        liquidity: 200000,
        volume: 450000,
        outcomes: [
          { id: '11', marketId: '6', title: 'Yes', probability: 0.35, price: 0.35 },
          { id: '12', marketId: '6', title: 'No', probability: 0.65, price: 0.65 }
        ],
        status: 'open',
        createdAt: yesterday.toISOString(),
        timeRemaining: '7 days'
      },
      {
        id: '7',
        marketHash: '0x7',
        question: 'Will the Federal Reserve cut interest rates before September 2024?',
        description: 'Market resolves to "Yes" if the Federal Reserve officially announces a reduction in the federal funds rate target before September 1, 2024.',
        category: 'Economics',
        endDate: nextMonth.toISOString(),
        liquidity: 280000,
        volume: 620000,
        outcomes: [
          { id: '13', marketId: '7', title: 'Yes', probability: 0.72, price: 0.72 },
          { id: '14', marketId: '7', title: 'No', probability: 0.28, price: 0.28 }
        ],
        status: 'open',
        createdAt: yesterday.toISOString(),
        timeRemaining: '30 days'
      },
      {
        id: '8',
        marketHash: '0x8',
        question: 'Will OpenAI release GPT-5 before the end of 2024?',
        description: 'Market resolves to "Yes" if OpenAI officially releases a model called GPT-5 before December 31, 2024, 11:59 PM UTC.',
        category: 'Technology',
        endDate: nextMonth.toISOString(),
        liquidity: 220000,
        volume: 480000,
        outcomes: [
          { id: '15', marketId: '8', title: 'Yes', probability: 0.58, price: 0.58 },
          { id: '16', marketId: '8', title: 'No', probability: 0.42, price: 0.42 }
        ],
        status: 'open',
        createdAt: yesterday.toISOString(),
        timeRemaining: '30 days'
      }
    ];
  }
}

// Export singleton instance
const gammaAPI = new GammaAPI();
export default gammaAPI; 