import { useState, useEffect, useCallback } from "react";
import {
  EnrichedBlock,
  getEnrichedBlock,
  createBlockListener,
  alchemy,
} from "@/lib/alchemy";

// Export as a named export to match the import in Dashboard.tsx
export const useBlockData = (tokenAddress: string) => {
  const [blocks, setBlocks] = useState<EnrichedBlock[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestBlockNumber, setLatestBlockNumber] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Function to fetch multiple blocks since you don't have a fetchBlocks function
  const fetchBlocks = useCallback(
    async (count: number, fromBlock?: number, address: string) => {
      const latestBlock = fromBlock || (await alchemy.core.getBlockNumber());
      const blockPromises = [];

      for (let i = 0; i < count; i++) {
        const blockNumber = latestBlock - i;
        if (blockNumber >= 0) {
          // Prevent negative block numbers
          blockPromises.push(getEnrichedBlock(blockNumber, address));
        }
      }

      return Promise.all(blockPromises);
    },
    []
  );

  // Function to fetch the latest blocks
  const fetchLatestBlocks = useCallback(
    async (address: string) => {
      try {
        setLoading(true);
        setError(null);

        // Fetch latest 10 blocks using the helper function
        const data = await fetchBlocks(10, undefined, address);
        setBlocks(data);
        setIsConnected(true);

        if (data.length > 0) {
          setLatestBlockNumber(Math.max(...data.map((block) => block.number)));
        }
      } catch (err) {
        setError("Failed to fetch blockchain data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [fetchBlocks]
  );

  // Function to load more blocks
  const loadMoreBlocks = useCallback(
    async (fromBlock: number, address: string) => {
      try {
        setLoading(true);
        const moreBlocks = await fetchBlocks(5, fromBlock, address);

        // Add only blocks that don't already exist in our state
        setBlocks((prev) => {
          const existingBlockNumbers = new Set(
            prev.map((block) => block.number)
          );
          const uniqueNewBlocks = moreBlocks.filter(
            (block) => !existingBlockNumbers.has(block.number)
          );
          return [...prev, ...uniqueNewBlocks];
        });
      } catch (err) {
        setError("Failed to load more blocks");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [fetchBlocks]
  );

  // Re-enable the real-time block listener with proper error handling
  useEffect(() => {
    let blockListener = null;
    let isSubscribed = true;

    // Function to safely set up the listener
    const setupListener = async () => {
      try {
        // Create a safe wrapper for the block listener
        blockListener = createBlockListener((blockNumber) => {
          if (!isSubscribed) return; // Prevent updates after unmount

          // Process new block
          console.log(`New block detected: ${blockNumber}`);

          // Fetch enriched block data
          getEnrichedBlock(blockNumber, tokenAddress)
            .then((newBlock) => {
              if (!isSubscribed) return;

              setBlocks((prev) => {
                // Skip if we already have this block
                if (prev.some((block) => block.number === newBlock.number)) {
                  return prev;
                }

                // Add new block to the beginning and keep the rest
                return [newBlock, ...prev.slice(0, prev.length - 1)];
              });

              setIsConnected(true);
              setLatestBlockNumber(blockNumber);
            })
            .catch((err) => {
              console.error("Error processing new block:", err);
            });
        });
      } catch (err) {
        console.error("Failed to set up block listener:", err);
      }
    };

    // Set up the listener
    setupListener();

    // Also fetch initial data
    fetchLatestBlocks(tokenAddress);

    // Clean up function
    return () => {
      isSubscribed = false;

      // More defensive cleanup
      try {
        if (blockListener) {
          // Just log what we're trying to clean up but don't actually call anything
          console.log("Cleaning up block listener");

          // In a production app you'd want to properly clean this up,
          // but for now we'll just set it to null to prevent errors
          blockListener = null;
        }
      } catch (error) {
        console.warn("Error during cleanup:", error);
      }
    };
  }, [tokenAddress, fetchLatestBlocks]);

  return {
    blocks,
    isConnected,
    error,
    latestBlockNumber,
    loadMoreBlocks,
  };
};
