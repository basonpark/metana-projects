"use client"; // This must be a client component

import * as React from "react";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi"; // Use WagmiProvider instead of WagmiConfig
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import TanStack Query
import {
  mainnet,
  sepolia,
  polygon, // Add polygon
  polygonMumbai, // Add polygonMumbai
  hardhat, // For local testing
} from "wagmi/chains";

// Get WalletConnect Project ID from .env.local
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";
if (!projectId) {
  // It's better to throw an error if this is absolutely required
  console.error("WalletConnect Project ID not found. Please add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your .env.local file.");
  // throw new Error("Missing WalletConnect Project ID");
}

// Configure chains supported by the dApp
const supportedChains = [
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
  // Only include hardhat in development
  ...(process.env.NODE_ENV === "development" ? [hardhat] : []),
] as const; // Use 'as const' for type safety

// Create Wagmi config using RainbowKit's getDefaultConfig
const config = getDefaultConfig({
  appName: "Lumina Finance",
  projectId: projectId, // Ensure this is provided
  chains: supportedChains,
  // Optional: Add Alchemy/Infura transports for specific chains for better reliability
  // transports: {
  //   [sepolia.id]: http(), // Example using default public RPC
  //   [mainnet.id]: http(`https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`), // Example with Alchemy (add NEXT_PUBLIC_ALCHEMY_ID to .env.local)
  // },
  ssr: true, // Enable SSR compatibility
});

// Create a TanStack Query client instance
const queryClient = new QueryClient();

// Export the provider component
export function Web3Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []); // Ensure component is mounted before rendering providers

  // Render null on server until mounted on client
  if (!mounted) return null;

  return (
    <QueryClientProvider client={queryClient}> {/* Wrap with QueryClientProvider */}
      <WagmiProvider config={config}> {/* Use WagmiProvider */}
        <RainbowKitProvider
          // No need to pass chains here explicitly, it's handled by config
          theme={darkTheme({ // Customize theme colors if desired
            accentColor: '#7b3fe4', // Example: A purple accent
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
          modalSize="compact" // Optional: 'compact' or 'wide'
          // appInfo is handled by config
        >
          {children} {/* Directly render children when mounted */}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
