import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';

// Import contract ABIs
import PredictionMarketABI from '@/abi/PredictionMarket.json';
import PredictionMarketFactoryABI from '@/abi/PredictionMarketFactory.json';
import ChainlinkDataFeedABI from '@/abi/ChainlinkDataFeed.json';

// Import types
import {
  Market,
  Bet,
  MarketStats,
  Outcome,
  MarketStatus,
  MarketWithMetadata,
  CreateMarketParams
} from '@/types/contracts';

/**
 * Custom hook for interacting with Prediction Market contracts
 */
export function useMarketContract() {
  const { address: userAddress, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get configured contract addresses from environment variables
  const factoryAddress = process.env.NEXT_PUBLIC_PREDICTION_MARKET_FACTORY_ADDRESS;
  const dataFeedAddress = process.env.NEXT_PUBLIC_CHAINLINK_DATA_FEED_ADDRESS;
  
  /**
   * Get all available markets
   * @param offset Starting index
   * @param limit Maximum number of items to return
   */
  const getMarkets = useCallback(async (
    offset = 0,
    limit = 10
  ): Promise<MarketWithMetadata[]> => {
    if (!factoryAddress || !publicClient) {
      throw new Error('Factory address or public client not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the factory contract to get market addresses
      const marketAddresses = await publicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: PredictionMarketFactoryABI.abi,
        functionName: 'getMarkets',
        args: [BigInt(offset), BigInt(limit)]
      });
      
      // Fetch details for each market
      const marketPromises = (marketAddresses as string[]).map(async (marketAddress) => {
        // Get market details
        const marketData = await publicClient.readContract({
          address: marketAddress as `0x${string}`,
          abi: PredictionMarketABI.abi,
          functionName: 'getMarketDetails',
          args: []
        });
        
        // Get market stats
        const marketStats = await publicClient.readContract({
          address: marketAddress as `0x${string}`,
          abi: PredictionMarketABI.abi,
          functionName: 'getMarketStats',
          args: []
        });
        
        // Parse market data into our MarketWithMetadata interface
        const market = parseMarketData(marketData as any, marketStats as any);
        
        // Add market address
        market.address = marketAddress;
        
        // If user is connected, get user's bets on this market
        if (isConnected && userAddress) {
          const userBets = await publicClient.readContract({
            address: marketAddress as `0x${string}`,
            abi: PredictionMarketABI.abi,
            functionName: 'getBets',
            args: [userAddress]
          });
          
          market.userBets = userBets as Bet[];
          
          // Calculate user position
          const userPosition = calculateUserPosition(market, userBets as Bet[]);
          market.userPosition = userPosition;
        }
        
        return market;
      });
      
      const markets = await Promise.all(marketPromises);
      return markets;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching markets';
      setError(errorMessage);
      console.error('Error fetching markets:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [factoryAddress, publicClient, isConnected, userAddress]);
  
  /**
   * Get markets by category
   * @param category Category to filter by
   * @param offset Starting index
   * @param limit Maximum number of items to return
   */
  const getMarketsByCategory = useCallback(async (
    category: string,
    offset = 0,
    limit = 10
  ): Promise<MarketWithMetadata[]> => {
    if (!factoryAddress || !publicClient) {
      throw new Error('Factory address or public client not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the factory contract to get market addresses
      const marketAddresses = await publicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: PredictionMarketFactoryABI.abi,
        functionName: 'getMarketsByCategory',
        args: [category, BigInt(offset), BigInt(limit)]
      });
      
      // Similar logic as getMarkets to fetch details
      const marketPromises = (marketAddresses as string[]).map(async (marketAddress) => {
        const marketData = await publicClient.readContract({
          address: marketAddress as `0x${string}`,
          abi: PredictionMarketABI.abi,
          functionName: 'getMarketDetails',
          args: []
        });
        
        const marketStats = await publicClient.readContract({
          address: marketAddress as `0x${string}`,
          abi: PredictionMarketABI.abi,
          functionName: 'getMarketStats',
          args: []
        });
        
        const market = parseMarketData(marketData as any, marketStats as any);
        market.address = marketAddress;
        
        if (isConnected && userAddress) {
          const userBets = await publicClient.readContract({
            address: marketAddress as `0x${string}`,
            abi: PredictionMarketABI.abi,
            functionName: 'getBets',
            args: [userAddress]
          });
          
          market.userBets = userBets as Bet[];
          market.userPosition = calculateUserPosition(market, userBets as Bet[]);
        }
        
        return market;
      });
      
      const markets = await Promise.all(marketPromises);
      return markets;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Unknown error fetching markets for category ${category}`;
      setError(errorMessage);
      console.error(`Error fetching markets for category ${category}:`, err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [factoryAddress, publicClient, isConnected, userAddress]);
  
  /**
   * Get details for a single market
   * @param marketAddress Address of the market contract
   */
  const getMarket = useCallback(async (
    marketAddress: string
  ): Promise<MarketWithMetadata | null> => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get market details
      const marketData = await publicClient.readContract({
        address: marketAddress as `0x${string}`,
        abi: PredictionMarketABI.abi,
        functionName: 'getMarketDetails',
        args: []
      });
      
      // Get market stats
      const marketStats = await publicClient.readContract({
        address: marketAddress as `0x${string}`,
        abi: PredictionMarketABI.abi,
        functionName: 'getMarketStats',
        args: []
      });
      
      const market = parseMarketData(marketData as any, marketStats as any);
      market.address = marketAddress;
      
      // If user is connected, get user's bets on this market
      if (isConnected && userAddress) {
        const userBets = await publicClient.readContract({
          address: marketAddress as `0x${string}`,
          abi: PredictionMarketABI.abi,
          functionName: 'getBets',
          args: [userAddress]
        });
        
        market.userBets = userBets as Bet[];
        market.userPosition = calculateUserPosition(market, userBets as Bet[]);
      }
      
      return market;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Unknown error fetching market at ${marketAddress}`;
      setError(errorMessage);
      console.error('Error fetching market:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, isConnected, userAddress]);
  
  /**
   * Create a new market
   * @param params Parameters for the new market
   */
  const createMarket = useCallback(async (
    params: CreateMarketParams
  ): Promise<string | null> => {
    if (!factoryAddress || !walletClient || !userAddress || !publicClient) {
      throw new Error('Factory address, wallet client, or user address not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Create the market using the factory
      const txHash = await walletClient.writeContract({
        address: factoryAddress as `0x${string}`,
        abi: PredictionMarketFactoryABI.abi,
        functionName: 'createMarket',
        args: [
          params.question,
          BigInt(params.expirationTime),
          params.dataFeedId as `0x${string}`,
          BigInt(params.threshold),
          params.category,
          BigInt(params.fee)
        ]
      });
      
      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      // Extract the newly created market address from event logs
      const log = receipt?.logs.find(log => {
        return log.address.toLowerCase() === factoryAddress?.toLowerCase();
      });
      
      if (log) {
        // Parse the log to get the market address
        const eventInterface = new ethers.Interface(PredictionMarketFactoryABI.abi);
        const marketCreatedEvent = eventInterface.parseLog({ 
          data: log.data, 
          topics: log.topics as string[] 
        });
        
        if (marketCreatedEvent) {
          // Return the market address
          return marketCreatedEvent.args.marketAddress as string;
        }
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating market';
      setError(errorMessage);
      console.error('Error creating market:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [factoryAddress, walletClient, publicClient, userAddress]);
  
  /**
   * Place a bet on a market
   * @param marketAddress Address of the market
   * @param prediction Prediction (Yes or No)
   * @param amount Amount to bet in ETH
   */
  const placeBet = useCallback(async (
    marketAddress: string,
    prediction: Outcome,
    amount: string
  ): Promise<boolean> => {
    if (!walletClient || !userAddress || !publicClient) {
      throw new Error('Wallet client or user address not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Convert amount from ETH to wei
      const valueInWei = parseEther(amount);
      
      // Place the bet
      const txHash = await walletClient.writeContract({
        address: marketAddress as `0x${string}`,
        abi: PredictionMarketABI.abi,
        functionName: 'placeBet',
        args: [prediction],
        value: valueInWei
      });
      
      // Wait for transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error placing bet';
      setError(errorMessage);
      console.error('Error placing bet:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, publicClient, userAddress]);
  
  /**
   * Claim rewards for winning bets
   * @param marketAddress Address of the market
   */
  const claimReward = useCallback(async (
    marketAddress: string
  ): Promise<boolean> => {
    if (!walletClient || !userAddress || !publicClient) {
      throw new Error('Wallet client or user address not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Claim the reward
      const txHash = await walletClient.writeContract({
        address: marketAddress as `0x${string}`,
        abi: PredictionMarketABI.abi,
        functionName: 'claimReward',
        args: []
      });
      
      // Wait for transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error claiming reward';
      setError(errorMessage);
      console.error('Error claiming reward:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, publicClient, userAddress]);
  
  /**
   * Get all categories
   */
  const getCategories = useCallback(async (): Promise<string[]> => {
    if (!factoryAddress || !publicClient) {
      throw new Error('Factory address or public client not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get categories from factory
      const categories = await publicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: PredictionMarketFactoryABI.abi,
        functionName: 'getCategories'
      });
      
      return categories as string[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching categories';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
      return ['Crypto', 'Sports', 'Politics', 'Entertainment', 'Other'];
    } finally {
      setIsLoading(false);
    }
  }, [factoryAddress, publicClient]);
  
  /**
   * Get real-time price data from Chainlink
   * @param dataFeedId ID of the data feed
   */
  const getLatestPrice = useCallback(async (
    dataFeedId: string
  ): Promise<string | null> => {
    if (!dataFeedAddress || !publicClient) {
      throw new Error('Data feed address or public client not available');
    }
    
    try {
      // Get the latest price from Chainlink
      const price = await publicClient.readContract({
        address: dataFeedAddress as `0x${string}`,
        abi: ChainlinkDataFeedABI.abi,
        functionName: 'getLatestPrice',
        args: [dataFeedId as `0x${string}`]
      });
      
      return (price as bigint).toString();
    } catch (err) {
      console.error(`Error fetching price for data feed ${dataFeedId}:`, err);
      return null;
    }
  }, [dataFeedAddress, publicClient]);
  
  /**
   * Helper to parse market data from contract response
   */
  const parseMarketData = (
    marketData: any,
    marketStats: any
  ): MarketWithMetadata => {
    const market: MarketWithMetadata = {
      id: Number(marketData[0]),
      question: marketData[1],
      creationTime: Number(marketData[2]),
      expirationTime: Number(marketData[3]),
      settlementTime: Number(marketData[4]),
      oracle: marketData[5],
      dataFeedId: marketData[6],
      threshold: Number(marketData[7]),
      totalYesAmount: marketData[8].toString(),
      totalNoAmount: marketData[9].toString(),
      status: Number(marketData[10]),
      outcome: Number(marketData[11]),
      category: marketData[12],
      creator: marketData[13],
      fee: Number(marketData[14]),
      
      // Add calculated fields
      address: '',
      liquidity: (BigInt(marketData[8].toString()) + BigInt(marketData[9].toString())).toString(),
      timeRemaining: calculateTimeRemaining(BigInt(marketData[3].toString())),
      yesPrice: 0.5,
      noPrice: 0.5
    };
    
    // Calculate prices
    const totalYes = BigInt(market.totalYesAmount);
    const totalNo = BigInt(market.totalNoAmount);
    const totalLiquidity = totalYes + totalNo;
    
    if (totalLiquidity > BigInt(0)) {
      const yesRatio = Number(totalYes) / Number(totalLiquidity);
      const noRatio = Number(totalNo) / Number(totalLiquidity);
      market.yesPrice = yesRatio;
      market.noPrice = noRatio;
    }
    
    return market;
  };
  
  /**
   * Helper to decode event logs (using ethers.js)
   */
  const decodeEventLog = ({ abi, data, topics }: { abi: any, data: string, topics: string[] }) => {
    const iface = new ethers.Interface(abi);
    return iface.parseLog({ data, topics });
  };
  
  /**
   * Helper to calculate human-readable time remaining
   */
  const calculateTimeRemaining = (expirationTime: bigint): string => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const timeRemaining = expirationTime - now;
    
    if (timeRemaining <= BigInt(0)) {
      return 'Expired';
    }
    
    const days = Number(timeRemaining / BigInt(86400)); // seconds in a day
    const hours = Number((timeRemaining % BigInt(86400)) / BigInt(3600)); // seconds in an hour
    const minutes = Number((timeRemaining % BigInt(3600)) / BigInt(60)); // seconds in a minute
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };
  
  /**
   * Helper to calculate user's position in a market
   */
  const calculateUserPosition = (
    market: MarketWithMetadata,
    bets: Bet[]
  ) => {
    // Initialize totals
    let totalYes = BigInt(0);
    let totalNo = BigInt(0);
    let potentialWinnings = BigInt(0);
    
    // Sum up user's yes and no bets
    for (const bet of bets) {
      if (bet.prediction === Outcome.Yes) {
        totalYes += BigInt(bet.amount);
      } else if (bet.prediction === Outcome.No) {
        totalNo += BigInt(bet.amount);
      }
    }
    
    // Calculate potential winnings based on current market state
    if (market.status === MarketStatus.Open || market.status === MarketStatus.Locked) {
      // If market is not settled, calculate potential winnings
      const totalPool = BigInt(market.totalYesAmount) + BigInt(market.totalNoAmount);
      
      if (totalYes > BigInt(0) && totalPool > BigInt(0)) {
        // Potential winnings from Yes bets
        const yesShare = (totalYes * BigInt(10000)) / BigInt(market.totalYesAmount);
        const yesWinnings = totalYes + ((BigInt(market.totalNoAmount) * yesShare) / BigInt(10000));
        potentialWinnings += yesWinnings;
      }
      
      if (totalNo > BigInt(0) && totalPool > BigInt(0)) {
        // Potential winnings from No bets
        const noShare = (totalNo * BigInt(10000)) / BigInt(market.totalNoAmount);
        const noWinnings = totalNo + ((BigInt(market.totalYesAmount) * noShare) / BigInt(10000));
        potentialWinnings += noWinnings;
      }
    }
    
    return {
      yes: totalYes.toString(),
      no: totalNo.toString(),
      potential: potentialWinnings.toString()
    };
  };
  
  /**
   * Get markets created by the connected user
   * @param offset Starting index
   * @param limit Maximum number of items to return
   */
  const getMarketsCreatedByUser = useCallback(async (
    offset = 0,
    limit = 10
  ): Promise<MarketWithMetadata[]> => {
    if (!factoryAddress || !publicClient || !isConnected || !userAddress) {
      if (!isConnected || !userAddress) {
        setError('Wallet not connected');
        return [];
      }
      throw new Error('Factory address or public client not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the factory contract to get markets created by the user
      const marketAddresses = await publicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: PredictionMarketFactoryABI.abi,
        functionName: 'getMarketsByCreator',
        args: [userAddress, BigInt(offset), BigInt(limit)]
      });
      
      if (!marketAddresses || (marketAddresses as string[]).length === 0) {
        return [];
      }
      
      // Similar logic as getMarkets to fetch details
      const marketPromises = (marketAddresses as string[]).map(async (marketAddress) => {
        const marketData = await publicClient.readContract({
          address: marketAddress as `0x${string}`,
          abi: PredictionMarketABI.abi,
          functionName: 'getMarketDetails',
          args: []
        });
        
        const marketStats = await publicClient.readContract({
          address: marketAddress as `0x${string}`,
          abi: PredictionMarketABI.abi,
          functionName: 'getMarketStats',
          args: []
        });
        
        const market = parseMarketData(marketData as any, marketStats as any);
        market.address = marketAddress;
        
        return market;
      });
      
      const markets = await Promise.all(marketPromises);
      return markets;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching created markets';
      setError(errorMessage);
      console.error('Error fetching created markets:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [factoryAddress, publicClient, isConnected, userAddress]);
  
  /**
   * Get user's positions (bets) across all markets
   * @returns Array of user positions
   */
  const getUserPositions = useCallback(async () => {
    if (!factoryAddress || !publicClient || !isConnected || !userAddress) {
      if (!isConnected || !userAddress) {
        setError('Wallet not connected');
        return [];
      }
      throw new Error('Factory address or public client not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First get all markets
      const marketAddresses = await publicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: PredictionMarketFactoryABI.abi,
        functionName: 'getMarkets',
        args: [BigInt(0), BigInt(100)] // Fetch up to 100 markets
      });
      
      // For each market, check if user has positions
      const positionPromises = (marketAddresses as string[]).map(async (marketAddress) => {
        try {
          // Get user's bets on this market
          const userBets = await publicClient.readContract({
            address: marketAddress as `0x${string}`,
            abi: PredictionMarketABI.abi,
            functionName: 'getBets',
            args: [userAddress]
          });
          
          // If user has no bets, skip
          if (!userBets || (userBets as Bet[]).length === 0) {
            return null;
          }
          
          // Get market details to include title
          const marketData = await publicClient.readContract({
            address: marketAddress as `0x${string}`,
            abi: PredictionMarketABI.abi,
            functionName: 'getMarketDetails',
            args: []
          });
          
          const marketStats = await publicClient.readContract({
            address: marketAddress as `0x${string}`,
            abi: PredictionMarketABI.abi,
            functionName: 'getMarketStats',
            args: []
          });
          
          const market = parseMarketData(marketData as any, marketStats as any);
          market.address = marketAddress;
          
          // Calculate user position
          const userPosition = calculateUserPosition(market, userBets as Bet[]);
          
          // Convert to the format needed for the UI
          return {
            marketId: marketAddress,
            marketTitle: market.question,
            outcome: BigInt(userPosition.yes) > BigInt(userPosition.no) ? "Yes" : "No",
            shares: BigInt(userPosition.yes) > BigInt(userPosition.no) 
              ? userPosition.yes
              : userPosition.no,
            value: parseFloat(formatEther(BigInt(userPosition.potential))).toFixed(2),
            entryPrice: (market.yesPrice).toFixed(2),
            currentPrice: (market.yesPrice).toFixed(2),
            pnl: "+0%", // This would require historical price data to calculate accurately
            isProfitable: true // Default to true for demo
          };
        } catch (error) {
          console.error(`Error fetching user position for market ${marketAddress}:`, error);
          return null;
        }
      });
      
      const positions = await Promise.all(positionPromises);
      return positions.filter(position => position !== null) as any[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching user positions';
      setError(errorMessage);
      console.error('Error fetching user positions:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [factoryAddress, publicClient, isConnected, userAddress]);
  
  /**
   * Get user's claimable rewards from resolved markets
   * @returns Array of claimable rewards
   */
  const getClaimableRewards = useCallback(async () => {
    if (!factoryAddress || !publicClient || !isConnected || !userAddress) {
      if (!isConnected || !userAddress) {
        setError('Wallet not connected');
        return [];
      }
      throw new Error('Factory address or public client not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First get all markets
      const marketAddresses = await publicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: PredictionMarketFactoryABI.abi,
        functionName: 'getMarkets',
        args: [BigInt(0), BigInt(100)] // Fetch up to 100 markets
      });
      
      // For each market, check if user has claimable rewards
      const rewardPromises = (marketAddresses as string[]).map(async (marketAddress) => {
        try {
          // Get market details
          const marketData = await publicClient.readContract({
            address: marketAddress as `0x${string}`,
            abi: PredictionMarketABI.abi,
            functionName: 'getMarketDetails',
            args: []
          });
          
          const market = parseMarketData(marketData as any, {} as any);
          
          // If market is not resolved, skip
          if (market.status !== MarketStatus.Settled) {
            return null;
          }
          
          // Check if user has claimable rewards
          const claimable = await publicClient.readContract({
            address: marketAddress as `0x${string}`,
            abi: PredictionMarketABI.abi,
            functionName: 'getClaimableAmount',
            args: [userAddress]
          });
          
          // If no claimable rewards, skip
          if (!claimable || (claimable as bigint) === BigInt(0)) {
            return null;
          }
          
          return {
            marketId: marketAddress,
            marketTitle: market.question,
            amount: parseFloat(formatEther(claimable as bigint)).toFixed(2),
            outcome: market.outcome === Outcome.Yes ? "Yes" : "No"
          };
        } catch (error) {
          console.error(`Error fetching claimable rewards for market ${marketAddress}:`, error);
          return null;
        }
      });
      
      const rewards = await Promise.all(rewardPromises);
      return rewards.filter(reward => reward !== null) as any[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching claimable rewards';
      setError(errorMessage);
      console.error('Error fetching claimable rewards:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [factoryAddress, publicClient, isConnected, userAddress]);
  
  // Export the new functions along with the existing ones
  return {
    getMarkets,
    getMarketsByCategory,
    getMarket,
    createMarket,
    placeBet,
    claimReward,
    getCategories,
    getLatestPrice,
    isLoading,
    error,
    // New functions
    getMarketsCreatedByUser,
    getUserPositions,
    getClaimableRewards
  };
} 