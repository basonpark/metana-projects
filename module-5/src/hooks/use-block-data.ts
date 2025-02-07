'use client'
import { useState, useEffect, useCallback } from "react";  
import { alchemy, EnrichedBlock, getEnrichedBlock } from "../lib/alchemy";  

export const useBlockData = (blockCount: number = 10) => {  
  const [blocks, setBlocks] = useState<EnrichedBlock[]>([]);  
  const [isConnected, setIsConnected] = useState(false);  
  const [error, setError] = useState<string | null>(null);  

  // Handle new blocks  
  const handleNewBlock = useCallback(async (blockNumber: number) => {  
    try {  
      console.log('Handling new block:', blockNumber);
      const newBlock = await getEnrichedBlock(blockNumber);  
      console.log('New block data:', newBlock);
      setBlocks(prev => {  
        const updated = [...prev, newBlock].slice(-blockCount);  
        return updated;  
      });  
    } catch (err) {  
      console.error('Error in handleNewBlock:', err);
      setError("Failed to fetch new block data");  
    }  
  }, [blockCount]);  

  // Initial load  
  useEffect(() => {  
    const initialize = async () => {  
      try {  
        console.log('Initializing block data...');
        const latest = await alchemy.core.getBlockNumber();  
        console.log('Latest block number:', latest);
        const numbers = Array.from({ length: blockCount }, (_, i) => latest - i);  
        console.log('Fetching blocks:', numbers);
        const initialBlocks = await Promise.all(numbers.map(getEnrichedBlock));  
        console.log('Initial blocks:', initialBlocks);
        setBlocks(initialBlocks.reverse());  
        setIsConnected(true);  
      } catch (err) {  
        console.error('Error in initialize:', err);
        setError("Failed to load initial block data");  
      }
    };  

    initialize();  
  }, [blockCount]);  

  // WebSocket subscription  
  useEffect(() => {  
    console.log('Setting up WebSocket subscription...');
    alchemy.ws.on("block", handleNewBlock);
    return () => {
      console.log('Cleaning up WebSocket subscription...');
      alchemy.ws.off("block", handleNewBlock);
    };
  }, [handleNewBlock]);  

  return { blocks, isConnected, error };  
};  


