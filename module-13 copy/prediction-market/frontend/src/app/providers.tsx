"use client";

// import "@rainbow-me/rainbowkit/styles.css";
// import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig } from "wagmi"; // Use createConfig instead of getDefaultConfig for now
import { sepolia, baseSepolia, arbitrumSepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React from "react";
import { http } from "viem"; // Import http
import { injected } from "wagmi/connectors"; // Import a basic connector

// Configure chains & providers with basic Wagmi config (no RainbowKit)
const config = createConfig({
  chains: [sepolia, baseSepolia, arbitrumSepolia],
  connectors: [
    injected(), // Add basic injected connector (like MetaMask)
    // You can add more connectors here later (e.g., walletConnect, coinbaseWallet)
  ],
  transports: {
    // Define transports for each chain
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

// Define and export the Providers component
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* <RainbowKitProvider> */} {/* Keep RainbowKit commented out */}
        {children}
        {/* </RainbowKitProvider> */}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
