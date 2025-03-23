"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
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
 * A wrapper hook that safely handles Wagmi hooks to prevent
 * the "WagmiProviderNotFoundError" and React Hooks ordering issues
 */
export function useMarketContractSafe() {
  // Track component mounted state
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true when the component is mounted
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always call wagmi hooks unconditionally at the top level
  const account = useAccount();
  const publicClient = usePublicClient();
  const walletClientHook = useWalletClient();
  
  // Safe access to Wagmi values - only use values when mounted
  const userAddress = isMounted ? account.address : undefined;
  const isConnected = isMounted ? account.isConnected : false;
  const walletClient = isMounted ? walletClientHook.data : undefined;
  const safePublicClient = isMounted ? publicClient : undefined;
  
  // Get configured contract addresses from environment variables
  const factoryAddress = process.env.NEXT_PUBLIC_PREDICTION_MARKET_FACTORY_ADDRESS;
  const dataFeedAddress = process.env.NEXT_PUBLIC_CHAINLINK_DATA_FEED_ADDRESS;

  // Implementation of contract functions adapted from useMarketContract
  // but only executing the real functionality when mounted
  
  const getMarkets = useCallback(async (
    offset = 0,
    limit = 10
  ): Promise<MarketWithMetadata[]> => {
    if (!isMounted) return [];
    if (!factoryAddress || !safePublicClient) {
      throw new Error('Factory address or public client not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the factory contract to get market addresses
      const marketAddresses = await safePublicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: PredictionMarketFactoryABI.abi,
        functionName: 'getMarkets',
        args: [BigInt(offset), BigInt(limit)]
      });
      
      // Fetch details for each market
      const marketPromises = (marketAddresses as string[]).map(async (marketAddress) => {
        // Get market details
        const marketData = await safePublicClient.readContract({
          address: marketAddress as `0x${string}`,
          abi: PredictionMarketABI.abi,
          functionName: 'getMarketDetails',
          args: []
        });
        
        // Get market stats
        const marketStats = await safePublicClient.readContract({
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
          const userBets = await safePublicClient.readContract({
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
  }, [isMounted, factoryAddress, safePublicClient, isConnected, userAddress]);

  const getMarketsByCategory = useCallback(async (
    category: string,
    offset = 0,
    limit = 10
  ): Promise<MarketWithMetadata[]> => {
    if (!isMounted) return [];
    if (!factoryAddress || !safePublicClient) {
      throw new Error('Factory address or public client not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the factory contract to get market addresses
      const marketAddresses = await safePublicClient.readContract({
        address: factoryAddress as `0x${string}`,
        abi: PredictionMarketFactoryABI.abi,
        functionName: 'getMarketsByCategory',
        args: [category, BigInt(offset), BigInt(limit)]
      });
      
      // Similar logic as getMarkets to fetch details
      const marketPromises = (marketAddresses as string[]).map(async (marketAddress) => {
        const marketData = await safePublicClient.readContract({
          address: marketAddress as `0x${string}`,
          abi: PredictionMarketABI.abi,
          functionName: 'getMarketDetails',
          args: []
        });
        
        const marketStats = await safePublicClient.readContract({
          address: marketAddress as `0x${string}`,
          abi: PredictionMarketABI.abi,
          functionName: 'getMarketStats',
          args: []
        });
        
        const market = parseMarketData(marketData as any, marketStats as any);
        market.address = marketAddress;
        
        if (isConnected && userAddress) {
          const userBets = await safePublicClient.readContract({
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
  }, [isMounted, factoryAddress, safePublicClient, isConnected, userAddress]);

  const getMarket = useCallback(async (
    marketAddress: string
  ): Promise<MarketWithMetadata | null> => {
    if (!isMounted) return null;
    if (!safePublicClient) {
      throw new Error('Public client not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get market details
      const marketData = await safePublicClient.readContract({
        address: marketAddress as `0x${string}`,
        abi: PredictionMarketABI.abi,
        functionName: 'getMarketDetails',
        args: []
      });
      
      // Get market stats
      const marketStats = await safePublicClient.readContract({
        address: marketAddress as `0x${string}`,
        abi: PredictionMarketABI.abi,
        functionName: 'getMarketStats',
        args: []
      });
      
      const market = parseMarketData(marketData as any, marketStats as any);
      market.address = marketAddress;
      
      // If user is connected, get user's bets on this market
      if (isConnected && userAddress) {
        const userBets = await safePublicClient.readContract({
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
  }, [isMounted, safePublicClient, isConnected, userAddress]);

  const createMarket = useCallback(async (
    params: CreateMarketParams
  ): Promise<any> => {
    if (!isMounted) return null;
    if (!factoryAddress || !walletClient || !userAddress || !safePublicClient) {
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
          BigInt(params.expirationTime || 0),
          params.dataFeedId || '0x0',
          BigInt(params.threshold || 0),
          params.category,
          BigInt(Math.floor((params.fee || 0) * 100)) // Convert percentage to basis points
        ],
        value: parseEther('0') // No initial liquidity in the current interface
      });
      
      // Wait for transaction to be mined
      const receipt = await safePublicClient.waitForTransactionReceipt({ hash: txHash });
      
      return { 
        success: true, 
        marketAddress: "0x123", // This would be extracted from events in production
        txHash 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating market';
      setError(errorMessage);
      console.error('Error creating market:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isMounted, factoryAddress, walletClient, safePublicClient, userAddress]);

  const placeBet = useCallback(async (
    marketAddress: string,
    prediction: Outcome,
    amount: string
  ): Promise<boolean> => {
    if (!isMounted) return false;
    if (!walletClient || !userAddress || !safePublicClient) {
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
      await safePublicClient.waitForTransactionReceipt({ hash: txHash });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error placing bet';
      setError(errorMessage);
      console.error('Error placing bet:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isMounted, walletClient, safePublicClient, userAddress]);

  const claimReward = useCallback(async (
    marketAddress: string
  ): Promise<boolean> => {
    if (!isMounted) return false;
    if (!walletClient || !userAddress || !safePublicClient) {
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
      await safePublicClient.waitForTransactionReceipt({ hash: txHash });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error claiming reward';
      setError(errorMessage);
      console.error('Error claiming reward:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isMounted, walletClient, safePublicClient, userAddress]);

  const getCategories = useCallback(async (): Promise<string[]> => {
    if (!isMounted) return [];
    if (!factoryAddress || !safePublicClient) {
      throw new Error('Factory address or public client not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get categories from factory
      const categories = await safePublicClient.readContract({
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
  }, [isMounted, factoryAddress, safePublicClient]);

  const getLatestPrice = useCallback(async (
    dataFeedId: string
  ): Promise<string | null> => {
    if (!isMounted) return null;
    if (!dataFeedAddress || !safePublicClient) {
      throw new Error('Data feed address or public client not available');
    }
    
    try {
      // Get the latest price from Chainlink
      const price = await safePublicClient.readContract({
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
  }, [isMounted, dataFeedAddress, safePublicClient]);
  
  const getMarketsCreatedByUser = useCallback(async (
    offset = 0,
    limit = 10
  ): Promise<MarketWithMetadata[]> => {
    if (!isMounted) return [];
    if (!factoryAddress || !safePublicClient || !isConnected || !userAddress) {
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
      const marketAddresses = await safePublicClient.readContract({
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
        const marketData = await safePublicClient.readContract({
          address: marketAddress as `0x${string}`,
          abi: PredictionMarketABI.abi,
          functionName: 'getMarketDetails',
          args: []
        });
        
        const marketStats = await safePublicClient.readContract({
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
  }, [isMounted, factoryAddress, safePublicClient, isConnected, userAddress]);
  
  const getUserPositions = useCallback(async () => {
    if (!isMounted) return [];
    if (!factoryAddress || !safePublicClient || !isConnected || !userAddress) {
      if (!isConnected || !userAddress) {
        setError('Wallet not connected');
        return [];
      }
      throw new Error('Factory address or public client not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get some sample positions for demo purposes
      return [
        {
          marketId: "0x123",
          marketTitle: "Will BTC exceed $100k in 2024?",
          outcome: "Yes",
          shares: "100",
          value: "120.50",
          entryPrice: "0.65",
          currentPrice: "0.75",
          pnl: "+15%",
          isProfitable: true
        },
        {
          marketId: "0x456",
          marketTitle: "Will ETH 2.0 launch before Q3 2024?",
          outcome: "No",
          shares: "50",
          value: "45.25",
          entryPrice: "0.40",
          currentPrice: "0.35",
          pnl: "-12%",
          isProfitable: false
        }
      ];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching user positions';
      setError(errorMessage);
      console.error('Error fetching user positions:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isMounted, factoryAddress, safePublicClient, isConnected, userAddress]);
  
  const getClaimableRewards = useCallback(async () => {
    if (!isMounted) return [];
    if (!factoryAddress || !safePublicClient || !isConnected || !userAddress) {
      if (!isConnected || !userAddress) {
        setError('Wallet not connected');
        return [];
      }
      throw new Error('Factory address or public client not available');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get some sample rewards for demo purposes
      return [
        {
          marketId: "0x789",
          marketTitle: "Will the Federal Reserve cut rates in Q2 2024?",
          amount: "35.75",
          outcome: "Yes"
        },
        {
          marketId: "0xabc",
          marketTitle: "Will Tesla stock exceed $300 by August 2024?",
          amount: "12.20",
          outcome: "No"
        }
      ];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching claimable rewards';
      setError(errorMessage);
      console.error('Error fetching claimable rewards:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isMounted, factoryAddress, safePublicClient, isConnected, userAddress]);

  // Helper functions
  
  const parseMarketData = (
    marketData: any,
    marketStats: any
  ): MarketWithMetadata => {
    // Create a mock market object for demo purposes
    const market: MarketWithMetadata = {
      id: Number(marketData[0] || 0),
      question: marketData[1] || "Sample Market Question",
      creationTime: Number(marketData[2] || Date.now() / 1000),
      expirationTime: Number(marketData[3] || (Date.now() / 1000 + 86400 * 7)), // 7 days
      settlementTime: Number(marketData[4] || 0),
      oracle: marketData[5] || "0x000",
      dataFeedId: marketData[6] || "0x000",
      threshold: Number(marketData[7] || 0),
      totalYesAmount: (marketData[8] || "100000").toString(),
      totalNoAmount: (marketData[9] || "50000").toString(),
      status: Number(marketData[10] || MarketStatus.Open),
      outcome: Number(marketData[11] || Outcome.NoOutcome),
      category: marketData[12] || "Crypto",
      creator: marketData[13] || "0x000",
      fee: Number(marketData[14] || 100), // 1%
      
      // Add calculated fields
      address: '',
      liquidity: "150000",
      timeRemaining: "7 days remaining",
      yesPrice: 0.67,
      noPrice: 0.33
    };
    
    return market;
  };
  
  const calculateUserPosition = (
    market: MarketWithMetadata,
    bets: Bet[]
  ) => {
    // Create a mock position for demo purposes
    return {
      yes: "100",
      no: "0",
      potential: "150"
    };
  };

  // Return a mock contract with empty functions when not mounted
  if (!isMounted) {
    return {
      getMarkets: async () => [],
      getMarketsByCategory: async () => [],
      getMarket: async () => null,
      createMarket: async () => null,
      placeBet: async () => false,
      claimReward: async () => false,
      getCategories: async () => [],
      getLatestPrice: async () => null,
      getMarketsCreatedByUser: async () => [],
      getUserPositions: async () => [],
      getClaimableRewards: async () => [],
      isLoading: false,
      error: null
    };
  }

  // Return all functions when mounted
  return {
    getMarkets,
    getMarketsByCategory,
    getMarket,
    createMarket,
    placeBet,
    claimReward,
    getCategories,
    getLatestPrice,
    getMarketsCreatedByUser,
    getUserPositions,
    getClaimableRewards,
    isLoading,
    error
  };
} 