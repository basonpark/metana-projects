import { useState, useEffect, useCallback } from 'react';
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Abi, formatUnits, parseEther, decodeEventLog, Address } from 'viem';
import PredictionMarketFactoryABI from '@/abi/PredictionMarketFactory.json';
import PredictionMarketABI from '@/abi/PredictionMarket.json'; // Import individual market ABI
import { /* MarketWithMetadata, */ MarketStatus, Outcome, CreateMarketParams, MarketInfo } from '@/types/contracts'; // Added CreateMarketParams, Add MarketInfo type if needed
// We might need MarketWithMetadata later if getMarkets is expanded
// import { MarketWithMetadata } from '@/types/contracts';

/**
 * Custom hook to safely interact with the PredictionMarketFactory contract.
 * Handles checks for wallet connection, correct chain, and contract address availability.
 */
export const useMarketContractSafe = () => {
  const { address: accountAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const factoryAddress = process.env.NEXT_PUBLIC_PREDICTION_MARKET_FACTORY_ADDRESS as `0x${string}` | undefined;
  const expectedChainId = parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN || '0', 10);

  const isReady =
    isConnected &&
    accountAddress &&
    factoryAddress &&
    chainId === expectedChainId;

  const factoryContractConfig = {
    address: factoryAddress,
    abi: PredictionMarketFactoryABI.abi as Abi,
    chainId: expectedChainId,
  } as const;

  // --- Top-level Hook Calls --- 
  const { data: categoriesData, error: categoriesError, isError: categoriesIsError } = useReadContract({
    ...factoryContractConfig,
    functionName: 'getCategories',
    query: { enabled: isReady }
  });

  const { data: marketsData, error: marketsError, isError: marketsIsError } = useReadContract({
    ...factoryContractConfig,
    functionName: 'getMarkets', // Assuming offset/limit are handled differently or fetched all
    // args: [BigInt(0), BigInt(1000)], // Example: Fetch first 1000, adjust as needed
    query: { enabled: isReady } // Fetch markets only when ready
  });
  
  // NOTE: getMarketDetails still needs refactoring if it uses useReadContract internally.
  // For now, focusing on getCategories and getMarkets.

  // --- Factory Read Functions (Keep as they are) ---
  const getCategories = useCallback(async (): Promise<string[] | null> => {
    if (!isReady) {
      console.warn('[useMarketContractSafe] Prerequisites not met for getCategories.');
      return null;
    }
    if (categoriesIsError) {
      console.error('[useMarketContractSafe] Error fetching categories:', categoriesError);
      return null;
    }
    return categoriesData as string[] | null;
  }, [isReady, categoriesData, categoriesError, categoriesIsError]); // Dependencies for useCallback

  const getMarkets = useCallback(async (offset: number, limit: number): Promise<`0x${string}`[] | null> => {
    if (!isReady) {
      console.warn('[useMarketContractSafe] Prerequisites not met for getMarkets.');
      return null;
    }
    // TODO: This implementation needs refinement. 
    // The top-level useReadContract for markets doesn't take offset/limit.
    // You might need to fetch ALL markets once and then slice, 
    // or use viem's readContract directly inside this function (which is allowed).
    // For now, returning the potentially prefetched data.
    if (marketsIsError) {
        console.error('[useMarketContractSafe] Error fetching markets:', marketsError);
        return null;
    }
    // Example: slicing prefetched data (if applicable)
    const allMarkets = marketsData as `0x${string}`[] | undefined;
    return allMarkets ? allMarkets.slice(offset, offset + limit) : null;
  }, [isReady, marketsData, marketsError, marketsIsError]); // Dependencies for useCallback

  // --- Market Read Functions ---
  // TODO: Refactor getMarketDetails similarly if it directly uses useReadContract
  const getMarketDetails = useCallback(async (marketAddress: `0x${string}`) : Promise<MarketInfo | null> => {
    // ... (Keep existing logic, but be aware of potential hook rule violations if useReadContract is inside)
    // ... It's better to use viem's readContract here if needed dynamically.
    if (!marketAddress || !isReady) return null; // Add isReady check

    console.log(`[useMarketContractSafe] Fetching details for market: ${marketAddress}`);
    // Placeholder logic remains
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async fetch
    return { // Placeholder data
        question: `Details for ${marketAddress.substring(0,10)}... ?`,
        expirationTime: BigInt(Math.floor(Date.now() / 1000) + 86400),
        status: MarketStatus.Open,
        dataFeedId: '0x...', 
        threshold: BigInt(0), 
        category: 'Dummy',
        fee: BigInt(100) 
    };
  }, [isReady, expectedChainId]); // Dependencies for useCallback

  // --- Factory Write Functions ---

  const { data: hash, error: writeError, isPending, writeContract } = useWriteContract();

  const [newMarketAddress, setNewMarketAddress] = useState<`0x${string}` | null>(null);

  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, // Wait for the hash from writeContract 
      confirmations: 1, // Wait for 1 confirmation
    });

  useEffect(() => {
    if (receipt && receipt.status === 'success') {
      console.log('[useMarketContractSafe] Transaction confirmed, checking logs for MarketCreated event...');
      for (const log of receipt.logs) {
        try {
          const decodedEvent = decodeEventLog({
            abi: factoryContractConfig.abi, // Use the factory ABI
            data: log.data,
            topics: log.topics,
          });

          if (decodedEvent.eventName === 'MarketCreated') {
            // Cast args to access the property - adjust type if needed based on ABI
            const marketAddress = (decodedEvent.args as { marketAddress?: Address })?.marketAddress;
            if (marketAddress) {
              console.log(`[useMarketContractSafe] Found MarketCreated event! New Market Address: ${marketAddress}`);
              setNewMarketAddress(marketAddress as `0x${string}`);
              // Clear the hash maybe? Or let the component handle the state transition.
              break; // Found the event, no need to check other logs
            }
          }
        } catch (error) {
          // Ignore logs that don't match the ABI or MarketCreated event
          // console.debug('[useMarketContractSafe] Log decoding skipped or failed:', error);
        }
      }
    } else if (receipt && receipt.status === 'reverted') {
        console.error('[useMarketContractSafe] Transaction reverted:', receipt);
        setNewMarketAddress(null); // Reset if transaction failed
    }
  }, [receipt]); // Rerun when the receipt is available

  const createMarket = useCallback(
    async (params: CreateMarketParams): Promise<void> => {
      if (!isReady || !factoryAddress) {
        console.warn('[useMarketContractSafe] Prerequisites not met for createMarket.');
        return; // Exit if not ready
      }

      try {
        console.log('[useMarketContractSafe] Initiating createMarket transaction...', params);
        const contractArgs = {
          address: factoryAddress,
          abi: factoryContractConfig.abi,
          functionName: 'createMarket',
          args: [
            params.question,
            BigInt(params.expirationTime),
            params.dataFeedId,
            BigInt(params.threshold),
            params.category,
            BigInt(params.fee)
          ],
        } as const;
        
        // Use the writeContract function from useWriteContract hook
        await writeContract(contractArgs);
        // No return here; component will react to hook state changes (hash, isConfirmed, etc.)
      } catch (err) {
        console.error(`[useMarketContractSafe] Failed to execute createMarket:`, err);
        // Don't re-throw here; error is captured in writeError state
        // Let the component react to the `writeError` state from the hook.
      }
    },
    [isReady, factoryAddress, factoryContractConfig.abi, writeContract] // Remove hash from dependencies
  ); // Dependencies for useCallback

  // --- Placeholder Functions for Portfolio (To be implemented) ---
  const getMarketsCreatedByUser = useCallback(async (offset: number, limit: number): Promise<any[]> => {
    console.warn('[useMarketContractSafe] getMarketsCreatedByUser not implemented.');
    return [];
  }, []); // Dependencies for useCallback

  const getUserPositions = useCallback(async (): Promise<any[]> => {
    console.warn('[useMarketContractSafe] getUserPositions not implemented.');
    return [];
  }, []); // Dependencies for useCallback

  const getClaimableRewards = useCallback(async (): Promise<any[]> => {
    console.warn('[useMarketContractSafe] getClaimableRewards not implemented.');
    return [];
  }, []); // Dependencies for useCallback

  const claimReward = useCallback(async (marketId: string): Promise<void> => {
    console.warn('[useMarketContractSafe] claimReward not implemented for market:', marketId);
    // In a real implementation, this would likely call writeContract
    return;
  }, []); // Dependencies for useCallback

  // Return functions and states needed by components
  return {
    // Factory reads
    getCategories,
    getMarkets, // Add getMarkets here
    getMarketsCreatedByUser,
    getUserPositions,
    getClaimableRewards,
    getMarketDetails, // Add getMarketDetails here
    // Factory writes
    createMarket, // Added
    claimReward,
    // Contract connection state
    isReady,
    factoryAddress,
    expectedChainId,
    // Transaction states
    isSubmitting: isPending, // Use isPending from useWriteContract
    isLoading: isPending || isConfirming,
    isConfirming,
    isConfirmed,
    hash, // Transaction hash
    writeError, // Error object from write
    newMarketAddress, // Return the new market address
  };
}; 