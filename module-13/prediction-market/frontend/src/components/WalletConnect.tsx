"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Use useEffect to handle client-side-only operations
  useEffect(() => {
    setMounted(true);
  }, []);

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Handle connector selection
  const handleConnectorSelect = (connectorId: string) => {
    const connector = connectors.find((c) => c.id === connectorId);
    if (connector) {
      connect({ connector });
    }
    setIsMenuOpen(false);
  };

  // Render a consistent DOM structure regardless of connection state
  // Only change the content once mounted on the client
  return (
    <div className="relative">
      {mounted && isConnected && address ? (
        // Connected state - only rendered after mounting on client
        <div className="flex items-center">
          <div className="mr-3 py-1 px-3 bg-primary/10 text-primary rounded-lg text-sm">
            {formatAddress(address)}
          </div>
          <button
            onClick={() => disconnect()}
            className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium"
          >
            Disconnect
          </button>
        </div>
      ) : (
        // Disconnected state or initial SSR state
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center py-2 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </button>
      )}

      {mounted && isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
          <div className="p-2">
            <p className="text-sm font-medium mb-2">Select a wallet</p>
            <div className="space-y-1">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnectorSelect(connector.id)}
                  disabled={!connector.ready}
                  className="w-full text-left text-sm py-2 px-3 rounded hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-white"
                >
                  {connector.name}
                  {!connector.ready && " (unsupported)"}
                </button>
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-2">
                {error.message || "Failed to connect"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
