'use client'
import { useState, useEffect, useCallback } from "react";  
import { alchemy, EnrichedBlock, getEnrichedBlock } from "../lib/alchemy";  

export const useBlockData = (tokenAddress: string, blockCount: number = 10) => {  
  const [blocks, setBlocks] = useState<EnrichedBlock[]>([]);  
  const [isConnected, setIsConnected] = useState(false);  
  const [error, setError] = useState<string | null>(null);
  const [latestBlockNumber, setLatestBlockNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load more historical blocks
  const loadMoreBlocks = useCallback(async (endBlock: number, tokenAddress: string) => {
    try {
      const numbers = Array.from(
        { length: blockCount }, 
        (_, i) => endBlock - blockCount + i
      );
      const moreBlocks = await Promise.all(numbers.map((blockNumber) => getEnrichedBlock(blockNumber, tokenAddress)));
      setBlocks(prev => [...prev, ...moreBlocks]);
    } catch (err) {
      console.error('Error loading more blocks:', err);
      setError("Failed to load historical blocks");
    }
  }, [blockCount, tokenAddress]);

  // Handle new blocks  
  const handleNewBlock = useCallback(async (blockNumber: number, tokenAddress: string) => {  
    try {  
      console.log('Handling new block:', blockNumber);
      const newBlock = await getEnrichedBlock(blockNumber, tokenAddress);  
      console.log('New block data:', newBlock);
      setBlocks(prev => {  
        const updated = [...prev, newBlock];
        return updated;  
      });
      setLatestBlockNumber(blockNumber);
    } catch (err) {  
      console.error('Error in handleNewBlock:', err);
      setError("Failed to fetch new block data");  
    }  
  }, [tokenAddress]);  

  // Initial load  
  useEffect(() => {  
    if (isConnected && websocket) {
      // Start with a smaller initial batch of blocks
      const initialBlockCount = 10; // Match the block table page size
      
      // Load initial blocks more gradually
      const loadInitialBlocks = async () => {
        setIsLoading(true);
        try {
          const currentBlock = await provider.getBlockNumber();
          // Load just enough blocks for the first page
          await loadBlocksRange(currentBlock, currentBlock - initialBlockCount + 1, tokenAddress);
        } catch (error) {
          console.error("Error loading initial blocks:", error);
          setError("Failed to load initial blocks. Please refresh the page.");
        } finally {
          setIsLoading(false);
        }
      };
      
      loadInitialBlocks();
    }
  }, [isConnected, websocket, tokenAddress]);  

  // WebSocket subscription  
  useEffect(() => {  
    console.log('Setting up WebSocket subscription...');
    const handler = (blockNumber: number) => handleNewBlock(blockNumber, tokenAddress);
    alchemy.ws.on("block", handler);
    return () => {
      console.log('Cleaning up WebSocket subscription...');
      alchemy.ws.off("block", handler);
    };
  }, [handleNewBlock, tokenAddress]);  

  // Update getEnrichedBlock to use the selected token address
  const getBlockData = useCallback(async (blockNumber: number) => {
    // ... use tokenAddress instead of hardcoded address
  }, [tokenAddress]);

  return { 
    blocks, 
    isConnected, 
    error, 
    latestBlockNumber,
    loadMoreBlocks,
    isLoading
  };  
};  


