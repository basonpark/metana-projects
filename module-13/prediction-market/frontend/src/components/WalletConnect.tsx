"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState, useEffect } from "react";
import { Wallet, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Connector } from "wagmi";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
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
  };

  // Render a consistent DOM structure regardless of connection state
  // Only change the content once mounted on the client
  return (
    <div className="relative">
      {mounted && isConnected && address ? (
        // Connected state - only rendered after mounting on client
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary hover:bg-primary/20"
          >
            {formatAddress(address)}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => disconnect()}>
            Disconnect
          </Button>
        </div>
      ) : (
        // Disconnected state or initial SSR state
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Select a wallet</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {connectors.map((connector) => (
              <DropdownMenuItem
                key={connector.id}
                onClick={() => handleConnectorSelect(connector.id)}
                disabled={!connector.ready}
                className="flex items-center justify-between"
              >
                {connector.name}
                {Boolean(connector.ready) && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {!Boolean(connector.ready) && (
                  <span className="text-xs text-muted-foreground">
                    (unsupported)
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
