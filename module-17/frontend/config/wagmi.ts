import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { cookieStorage, createStorage } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { targetChain } from './contracts'; // Import our target chain

// 1. Get project ID from WalletConnect Cloud (https://cloud.walletconnect.com/)
// Ensure NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set in your .env file
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set');
}

// 2. Create metadata for your dApp
const metadata = {
  name: 'DAO Governance DApp',
  description: 'Manage proposals and voting for our DAO',
  url: 'http://localhost:3000', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'] // Add your app icon here
};

// 3. Define chains
const chains = [targetChain] as const; // Use the chain defined in contracts.ts

// 4. Create Wagmi config
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true, // Important for Next.js
  storage: createStorage({ // Use cookie storage for SSR compatibility
    storage: cookieStorage
  }),
  // Optional: Add custom transports if needed, e.g., for specific RPC URLs
  // transports: {
  //   [hardhat.id]: http()
  // }
});
