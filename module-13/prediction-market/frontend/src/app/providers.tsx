"use client";

import { WagmiProvider, createConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { ReactNode } from "react";
import { injected, metaMask, coinbaseWallet } from "wagmi/connectors";

// Create a query client for React Query (used by Wagmi)
const queryClient = new QueryClient();

// Define which testnet to use - we'll use sepolia for testing
const testnet = sepolia;

// Configure Wagmi
const config = createConfig({
  chains: [mainnet, testnet],
  transports: {
    [mainnet.id]: http(),
    [testnet.id]: http(),
  },
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({
      appName: "Prediction Market Platform",
    }),
  ],
});

// Provider wrapper component
export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
