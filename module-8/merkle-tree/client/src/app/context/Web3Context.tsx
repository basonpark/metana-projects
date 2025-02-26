"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Types
export type NFTSaleState =
  | "Paused"
  | "PresaleActive"
  | "PublicSaleActive"
  | "SoldOut"
  | "Revealed";

type Web3ContextType = {
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  mintNFT: (quantity: number) => Promise<void>;
  presaleMint: (proof: string[], index: number) => Promise<void>;
  currentState: NFTSaleState;
  totalSupply: number;
  maxSupply: number;
  loading: boolean;
  error: string | null;
};

// Default context
const Web3Context = createContext<Web3ContextType>({
  account: null,
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
  mintNFT: async () => {},
  presaleMint: async () => {},
  currentState: "Paused",
  totalSupply: 0,
  maxSupply: 10000,
  loading: false,
  error: null,
});

// Mock state values for development
const MOCK_VALUES = {
  totalSupply: 1234,
  maxSupply: 10000,
  currentState: "PublicSaleActive" as NFTSaleState,
};

// Provider component
export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<NFTSaleState>("Paused");
  const [totalSupply, setTotalSupply] = useState(0);
  const [maxSupply, setMaxSupply] = useState(10000);

  // Connect wallet
  const connect = async () => {
    setLoading(true);
    setError(null);

    try {
      if (typeof window !== "undefined" && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        setIsConnected(true);

        // For development, set mock values
        setCurrentState(MOCK_VALUES.currentState);
        setTotalSupply(MOCK_VALUES.totalSupply);
        setMaxSupply(MOCK_VALUES.maxSupply);
      } else {
        setError("MetaMask is not installed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
  };

  // Mint NFT during public sale
  const mintNFT = async (quantity: number) => {
    setLoading(true);
    setError(null);

    try {
      if (!isConnected) {
        throw new Error("Wallet not connected");
      }

      if (currentState !== "PublicSaleActive") {
        throw new Error("Public sale is not active");
      }

      // In a real implementation, this would call the contract
      console.log(`Minting ${quantity} NFTs for ${account}`);

      // Mock successful mint
      setTotalSupply((prev) => prev + quantity);

      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err: any) {
      setError(err.message || "Failed to mint NFT");
    } finally {
      setLoading(false);
    }
  };

  // Presale mint with Merkle proof
  const presaleMint = async (proof: string[], index: number) => {
    setLoading(true);
    setError(null);

    try {
      if (!isConnected) {
        throw new Error("Wallet not connected");
      }

      if (currentState !== "PresaleActive") {
        throw new Error("Presale is not active");
      }

      // In a real implementation, this would call the contract with the proof
      console.log(
        `Presale minting for ${account} with proof for index ${index}`
      );

      // Mock successful mint
      setTotalSupply((prev) => prev + 1);

      // Simulate blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err: any) {
      setError(err.message || "Failed to mint NFT");
    } finally {
      setLoading(false);
    }
  };

  // Auto-connect if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);

            // For development, set mock values
            setCurrentState(MOCK_VALUES.currentState);
            setTotalSupply(MOCK_VALUES.totalSupply);
            setMaxSupply(MOCK_VALUES.maxSupply);
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, [account]);

  const contextValue: Web3ContextType = {
    account,
    connect,
    disconnect,
    isConnected,
    mintNFT,
    presaleMint,
    currentState,
    totalSupply,
    maxSupply,
    loading,
    error,
  };

  return (
    <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
  );
}

// Custom hook to use the Web3 context
export function useWeb3() {
  return useContext(Web3Context);
}

// Add type definitions for window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}
