"use client";

import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react"; // Import icons
import { useAccount, useConnect, useDisconnect } from "wagmi";
// Correct import path for newer Wagmi/Viem versions might just be 'wagmi/connectors'
// If this fails, you might need to install `@wagmi/connectors` separately and import from there.
import { injected } from "wagmi/connectors"; // Use the connector directly

export function WalletConnect() {
  // isConnecting from useAccount is usually for auto-reconnect attempts on load
  const { address, isConnected, isConnecting: isReconnecting } = useAccount();
  // isPending from useConnect is for the active connection attempt triggered by the user
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Function to format address (e.g., 0x123...abc)
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleConnect = () => {
    // Call connect with the desired connector instance
    connect({ connector: injected() });
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium hidden sm:inline">
          {formatAddress(address)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
          title="Disconnect Wallet"
        >
          <LogOut className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect} // Use the handler function
      disabled={isPending} // Disable only during active connection attempt
      aria-label="Connect Wallet"
    >
      <Wallet className="h-4 w-4 mr-2" />
      {isPending ? "Connecting..." : "Connect Wallet"}
      {/* Optional: More specific error display if needed */}
      {error && <span className="ml-2 text-xs text-red-500">(Error)</span>}
    </Button>
  );
}
