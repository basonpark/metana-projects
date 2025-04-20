import { useState } from 'react';
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Abi, formatUnits, parseEther } from 'viem';
import PredictionMarketFactoryABI from '@/abi/PredictionMarketFactory.json';
// import PredictionMarketABI from '@/abi/PredictionMarket.json'; // Keep if placeBet is needed elsewhere, remove if only createMarket
import { /* MarketWithMetadata, */ MarketStatus, Outcome, CreateMarketParams } from '@/types/contracts'; // Added CreateMarketParams
// We might need MarketWithMetadata later if getMarkets is expanded
// import { MarketWithMetadata } from '@/types/contracts';

/**
 * Custom hook to safely interact with the PredictionMarketFactory contract.
 * Handles checks for wallet connection, correct chain, and contract address availability.
 * Focused on reading factory data and creating new markets.
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

  // --- Factory Read Functions (Keep as they are) ---
  const getCategories = async (): Promise<string[] | null> => {
    if (!isReady) {
      console.warn('[useMarketContractSafe] Prerequisites not met for getCategories.');
      return null;
    }
    // ... (rest of getCategories implementation using useReadContract) ...
    // Simplified direct read:
    const { data, error, isError } = useReadContract({
        ...factoryContractConfig,
        functionName: 'getCategories',
        query: { enabled: isReady }
    });
    if (isError) console.error('[useMarketContractSafe] Error fetching categories:', error);
    return data as string[] | null;
  };

  const getMarkets = async (offset: number, limit: number): Promise<`0x${string}`[] | null> => {
    if (!isReady) {
      console.warn('[useMarketContractSafe] Prerequisites not met for getMarkets.');
      return null;
    }
     // ... (rest of getMarkets implementation using useReadContract) ...
     // Simplified direct read:
    const { data, error, isError } = useReadContract({
        ...factoryContractConfig,
        functionName: 'getMarkets',
        args: [BigInt(offset), BigInt(limit)],
        query: { enabled: isReady }
    });
    if (isError) console.error('[useMarketContractSafe] Error fetching markets:', error);
    return data as `0x${string}`[] | null;
   };


  // --- Factory Write Functions ---

  const { data: hash, error: writeError, isPending, writeContract } = useWriteContract();

  /**
   * Creates a new prediction market via the factory contract.
   *
   * @param params - Market creation parameters matching CreateMarketParams type.
   * @returns A promise resolving to the transaction hash or null/throws on error.
   */
  const createMarket = async (params: CreateMarketParams): Promise<`0x${string}` | null> => {
    if (!isReady) {
        console.warn('[useMarketContractSafe] Prerequisites not met for createMarket (not ready).');
        return null;
    }
    // Explicit check to satisfy TypeScript that factoryAddress is defined here
    if (!factoryAddress) {
      console.error('[useMarketContractSafe] Factory address is not defined, cannot create market.');
      return null;
    }

    try {
        console.log('[useMarketContractSafe] Initiating createMarket transaction...', params);
        // Construct args explicitly for writeContract
        const contractArgs = {
            address: factoryAddress, // Use the verified non-null address
            abi: factoryContractConfig.abi,
            functionName: 'createMarket',
            args: [
                params.question,
                BigInt(params.expirationTime),
                params.dataFeedId,
                BigInt(params.threshold),
                params.category,
                params.fee
            ],
            // value: parseEther('0.01') // Example fee
        } as const; // Use 'as const' for type safety

        writeContract(contractArgs);

        return hash ?? null; // Return hash immediately if available from hook state
    } catch (err) {
        console.error(`[useMarketContractSafe] Failed to execute createMarket:`, err);
        throw err; // Re-throw error
    }
  };

  // --- Transaction State --- 
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  // --- Placeholder Functions for Portfolio (To be implemented) ---
  const getMarketsCreatedByUser = async (offset: number, limit: number): Promise<any[]> => {
    console.warn('[useMarketContractSafe] getMarketsCreatedByUser not implemented.');
    return [];
  };
  const getUserPositions = async (): Promise<any[]> => {
    console.warn('[useMarketContractSafe] getUserPositions not implemented.');
    return [];
  };
  const getClaimableRewards = async (): Promise<any[]> => {
    console.warn('[useMarketContractSafe] getClaimableRewards not implemented.');
    return [];
  };
  const claimReward = async (marketId: string): Promise<void> => {
    console.warn('[useMarketContractSafe] claimReward not implemented for market:', marketId);
    // In a real implementation, this would likely call writeContract
    return;
  };

  // Return functions and states needed by components
  return {
    // Factory reads
    getCategories,
    getMarketsCreatedByUser,
    getUserPositions,
    getClaimableRewards,
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
  };
}; 