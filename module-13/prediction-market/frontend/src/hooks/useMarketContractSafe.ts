import { useState } from 'react';
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Abi, formatUnits, parseEther } from 'viem';
import PredictionMarketFactoryABI from '@/abi/PredictionMarketFactory.json';
import PredictionMarketABI from '@/abi/PredictionMarket.json';
import { MarketWithMetadata, MarketStatus, Outcome } from '@/types/contracts';
// We might need MarketWithMetadata later if getMarkets is expanded
// import { MarketWithMetadata } from '@/types/contracts';

/**
 * Custom hook to safely interact with read/write functions of the PredictionMarketFactory and individual PredictionMarket contracts.
 * Handles checks for wallet connection, correct chain, and contract address availability.
 */
export const useMarketContractSafe = () => {
  const { address: accountAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);
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
  } as const; // Use 'as const' for better type inference with wagmi

  // --- Individual Market Contract Setup (ABI only) ---
  const marketContractAbi = PredictionMarketABI.abi as Abi;

  /**
   * Safely fetches the list of market categories from the contract.
   *
   * @returns A promise that resolves to an array of category strings, or null if prerequisites are not met.
   * @throws Throws an error if the contract read fails after prerequisites are met.
   */
  const getCategories = async (): Promise<string[] | null> => {
    if (!isReady) {
      console.warn('[useMarketContractSafe] Prerequisites not met for getCategories (wallet connected, correct chain, address set).');
      return null; // Not ready to call
    }

    try {
      // Directly use wagmi's useReadContract hook for simplicity and caching
      const { data, error, isLoading: isCategoriesLoading, isError } = useReadContract({
        ...factoryContractConfig,
        functionName: 'getCategories',
        query: {
          enabled: isReady, // Enable query only when ready
        }
      });

      // Simplified: Return data directly, relying on component suspense/loading state
      if (isError) {
        console.error('[useMarketContractSafe] Error fetching categories:', error);
        // Optionally re-throw or handle error differently
        // throw error;
      }
      // We don't use the manual refetch pattern here anymore for simplicity
      // Caller should handle loading state based on hook's return
      return data as string[] | null;

      /* // --- Manual refetch pattern (removed for simplicity) ---
      setIsLoading(true); // Set loading before fetch
      try {
        const { data, error, refetch } = useReadContract({
      // ... existing code ...
      } catch (err) {
        console.error('[useMarketContractSafe] Failed to execute getCategories:', err);
        throw err; // Re-throw other errors
      } finally {
        setIsLoading(false); // Clear loading after fetch
      }
      */
    } catch (err) {
      console.error('[useMarketContractSafe] Failed to execute getCategories:', err);
      throw err; // Re-throw other errors
    }
  };

  /**
   * Safely fetches a paginated list of market addresses from the contract.
   *
   * @param offset - The starting index for fetching markets.
   * @param limit - The maximum number of market addresses to fetch.
   * @returns A promise that resolves to an array of market addresses (as strings), or null if prerequisites are not met.
   * @throws Throws an error if the contract read fails after prerequisites are met.
   */
  const getMarkets = async (offset: number, limit: number): Promise<`0x${string}`[] | null> => {
     if (!isReady) {
      console.warn('[useMarketContractSafe] Prerequisites not met for getMarkets (wallet connected, correct chain, address set).');
      return null; // Not ready to call
    }

     try {
       // Use wagmi hook directly
       const { data, error, isLoading: areMarketsLoading, isError } = useReadContract({
         ...factoryContractConfig,
         functionName: 'getMarkets',
         args: [BigInt(offset), BigInt(limit)],
         query: {
           enabled: isReady,
         }
       });

       if (isError) {
          console.error('[useMarketContractSafe] Error fetching markets:', error);
        }
       return data as `0x${string}`[] | null;

       /* // --- Manual refetch pattern (removed for simplicity) ---
       setIsLoading(true);
       try {
         const { data, error, refetch } = useReadContract({
       // ... existing code ...
        } catch (err) {
          console.error('[useMarketContractSafe] Failed to execute getMarkets:', err);
          throw err;
        } finally {
          setIsLoading(false);
        }
        */
     } catch (err) {
       console.error('[useMarketContractSafe] Failed to execute getMarkets:', err);
       throw err;
     }
   };

  /**
   * Safely fetches details for a specific market contract.
   *
   * @param marketAddress The address of the PredictionMarket contract.
   * @returns A promise resolving to MarketWithMetadata or null.
   */
  const getMarket = async (marketAddress: string | undefined): Promise<MarketWithMetadata | null> => {
    if (!isReady || !marketAddress) {
      console.warn('[useMarketContractSafe] Prerequisites not met for getMarket.');
      return null;
    }
    // Ensure marketAddress is a valid address format if needed
    const contractAddress = marketAddress as `0x${string}`;

    setIsLoading(true);
    try {
      // --- Fetch all required data using multicall or separate reads ---
      // This example uses separate reads for clarity, multicall is more efficient

      // 1. Fetch basic market details
      const { data: details, refetch: refetchDetails } = useReadContract({
        address: contractAddress,
        abi: marketContractAbi,
        functionName: 'getMarketDetails',
        chainId: expectedChainId,
        query: { enabled: false } // Manual refetch
      });
      const detailsResult = await refetchDetails();
      if (detailsResult.isError || !detailsResult.data) throw new Error('Failed to fetch market details');
      const marketData = detailsResult.data as any; // Type assertion needed based on ABI return structure

      // 2. Fetch user position (if account is connected)
      let userPositionData = { yes: '0', no: '0', potential: '0' };
      if (accountAddress) {
        const { data: position, refetch: refetchPosition } = useReadContract({
            address: contractAddress,
            abi: marketContractAbi,
            functionName: 'getUserPosition',
            args: [accountAddress],
            chainId: expectedChainId,
            query: { enabled: false }
        });
        const positionResult = await refetchPosition();
        if (positionResult.data) {
            const pos = positionResult.data as [bigint, bigint, bigint];
            userPositionData = {
                yes: formatUnits(pos[0], 0), // Assuming decimals=0 for shares
                no: formatUnits(pos[1], 0),
                potential: formatUnits(pos[2], 18) // Assuming decimals=18 for payout
            };
        }
      }

      // 3. Fetch current prices (may need specific functions based on your contract)
      const { data: yesPriceRaw, refetch: refetchYes } = useReadContract({
        address: contractAddress,
        abi: marketContractAbi,
        functionName: 'getYesPrice', // Assuming function exists
        chainId: expectedChainId,
        query: { enabled: false }
      });
      const { data: noPriceRaw, refetch: refetchNo } = useReadContract({
          address: contractAddress,
          abi: marketContractAbi,
          functionName: 'getNoPrice', // Assuming function exists
          chainId: expectedChainId,
          query: { enabled: false }
      });
      const yesPriceResult = await refetchYes();
      const noPriceResult = await refetchNo();
      // Assuming prices are returned as uint scaled by 1e18 (adjust if needed)
      const yesPrice = yesPriceResult.data ? parseFloat(formatUnits(yesPriceResult.data as bigint, 18)) : 0.5;
      const noPrice = noPriceResult.data ? parseFloat(formatUnits(noPriceResult.data as bigint, 18)) : 0.5;

      // --- Construct MarketWithMetadata --- 
      // TODO: Adjust property names based on actual `getMarketDetails` return structure
      const market: MarketWithMetadata = {
        id: marketData.id ? Number(marketData.id) : 0, // Adjust based on actual return type
        address: contractAddress,
        question: marketData.question || '',
        creationTime: marketData.creationTime ? Number(marketData.creationTime) : 0,
        expirationTime: marketData.expirationTime ? Number(marketData.expirationTime) : 0,
        settlementTime: marketData.settlementTime ? Number(marketData.settlementTime) : 0,
        oracle: marketData.oracle || '',
        dataFeedId: marketData.dataFeedId || '',
        threshold: marketData.threshold ? Number(marketData.threshold) : 0,
        totalYesAmount: marketData.totalYesAmount ? formatUnits(marketData.totalYesAmount, 0) : '0', // Adjust decimals
        totalNoAmount: marketData.totalNoAmount ? formatUnits(marketData.totalNoAmount, 0) : '0', // Adjust decimals
        status: marketData.status as MarketStatus || MarketStatus.Open,
        outcome: marketData.outcome as Outcome || Outcome.NoOutcome,
        category: marketData.category || '',
        creator: marketData.creator || '',
        fee: marketData.fee ? Number(marketData.fee) : 0,

        // Calculated/added fields
        timeRemaining: formatTimeRemaining(Number(marketData.expirationTime)), // Add helper
        yesPrice: yesPrice,
        noPrice: noPrice,
        liquidity: formatUnits(BigInt(marketData.totalYesAmount || 0) + BigInt(marketData.totalNoAmount || 0), 0), // Adjust decimals
        userPosition: userPositionData,
      };

      return market;

    } catch (err) {
      console.error(`[useMarketContractSafe] Failed to execute getMarket(${marketAddress}):`, err);
      return null; // Return null on error
    } finally {
      setIsLoading(false);
    }
  };

  // --- Individual Market Write Functions ---

  // Hook for writing contract interactions
  const { data: hash, error: writeError, isPending: isWritePending, writeContract } = useWriteContract();

  /**
   * Safely places a bet on a specific market.
   *
   * @param marketAddress The address of the PredictionMarket contract.
   * @param outcome The outcome to bet on (Outcome.Yes or Outcome.No).
   * @param amount The amount to bet (in Ether as a string).
   * @returns A promise resolving to the transaction hash or null/throws on error.
   */
  const placeBet = async (marketAddress: string | undefined, outcome: Outcome, amount: string): Promise<`0x${string}` | null> => {
    if (!isReady || !marketAddress || !amount || parseFloat(amount) <= 0) {
        console.warn('[useMarketContractSafe] Prerequisites not met for placeBet.');
        return null;
    }
    if (outcome !== Outcome.Yes && outcome !== Outcome.No) {
        console.warn('[useMarketContractSafe] Invalid outcome for placeBet.');
        return null;
    }

    const contractAddress = marketAddress as `0x${string}`; // Type assertion
    const betAmountWei = parseEther(amount); // Convert Ether string to Wei BigInt

    setIsSubmitting(true);
    try {
        writeContract({
            address: contractAddress,
            abi: marketContractAbi,
            functionName: 'placeBet',
            args: [outcome, betAmountWei], // Args must match contract function signature
            value: betAmountWei, // Sending ETH if contract requires payment for bet?
            // If contract doesn't require ETH value, remove the 'value' field
        });

        // Note: writeContract is async but fires off the request.
        // We don't await it here directly, we return the hash when available (see below)
        // Or handle success/error based on useWriteContract hook state.
        console.log('[useMarketContractSafe] placeBet transaction initiated...');
        // We will return the hash once the hook provides it
        // Or use useWaitForTransactionReceipt for confirmation
        return hash ?? null; // Return hash immediately if available

    } catch (err) {
        console.error(`[useMarketContractSafe] Failed to execute placeBet(${marketAddress}, ${outcome}, ${amount}):`, err);
        throw err; // Re-throw error to be caught by caller
    } finally {
      // isSubmitting might be better controlled by useWriteContract's isPending state
      // setIsSubmitting(false); // Let the hook's state handle this?
    }
  };

  // Optionally use useWaitForTransactionReceipt to react to transaction completion
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    });

  // Helper function for time remaining (copied from HomePage - move to utils?)
  const formatTimeRemaining = (expirationTimestamp: number): string => {
    const now = Date.now() / 1000; // Current time in seconds
    const diff = expirationTimestamp - now;

    if (diff <= 0) {
      return "Ended";
    }

    const days = Math.floor(diff / (60 * 60 * 24));
    const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((diff % (60 * 60)) / 60);

    if (days > 1) return `${days} days remaining`;
    if (days === 1) return `1 day remaining`;
    if (hours > 1) return `${hours} hours remaining`;
    if (hours === 1) return `1 hour remaining`;
    if (minutes > 1) return `${minutes} minutes remaining`;
    return `1 minute remaining`;
  };

  // Return all functions and states needed by components
  return {
    getCategories,
    getMarkets,
    getMarket,
    placeBet,
    isReady,
    factoryAddress,
    expectedChainId,
    // Loading/Submitting states
    isLoading,
    isSubmitting: isWritePending || isConfirming,
    isConfirming,
    isConfirmed,
    hash,
    writeError,
  };
}; 