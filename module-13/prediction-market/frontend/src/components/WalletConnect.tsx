"use client";

// import { ConnectButton } from '@rainbow-me/rainbowkit'; // <--- Comment out this import
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react"; // Import Wallet icon

export function WalletConnect() {
  // Return a simple placeholder button since the real functionality is commented out
  return (
    <Button disabled>
      {" "}
      {/* Disable the button as it won't work */}
      <Wallet className="h-4 w-4 mr-2" />
      Connect Wallet
    </Button>
  );

  /* // <--- Start comment block for the original RainbowKit code
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} type="button">
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} type="button" variant="destructive">
                    Wrong network
                  </Button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button
                    onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    type="button"
                    variant="outline"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16, // Smaller icon
                          height: 16, // Smaller icon
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 6, // Spacing
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }} // Smaller icon
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </Button>
                  <Button onClick={openAccountModal} type="button" variant="outline">
                    {account.displayName}
                    {
                      account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ''
                    }
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
  */ // <--- End comment block
}
