'use client'; // Mark this component as a Client Component

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { State, WagmiProvider } from 'wagmi'; // Changed from WagmiConfig

import { wagmiConfig } from '@/config/wagmi'; // Adjust path if needed
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { projectId } from '@/config/wagmi'; // Adjust path if needed
import { targetChain } from '@/config/contracts'; // Adjust path if needed

// Setup queryClient
const queryClient = new QueryClient();

if (!projectId) throw new Error('Project ID is not defined');

// Create modal
createWeb3Modal({
  wagmiConfig: wagmiConfig,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  // You can customize the modal further here if needed
  // themeMode: 'light',
  // chains: [targetChain] // Explicitly pass chains if needed
});

// Define the props type including children and initialState
type Web3ProviderProps = {
  children: ReactNode;
  initialState?: State; // Add initialState prop for SSR
};

export function Web3Provider({ children, initialState }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
