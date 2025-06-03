"use client"; // Needs to be a client component

import { ConnectButton } from "@rainbow-me/rainbowkit";

export const WalletConnectButton = () => {
  return (
    <ConnectButton
      accountStatus={{
        smallScreen: "avatar", // Show avatar on small screens
        largeScreen: "full", // Show full address on large screens
      }}
      showBalance={{
        smallScreen: false, // Don't show balance on small screens
        largeScreen: true, // Show balance on large screens
      }}
      chainStatus="icon" // Show chain icon only
    />
  );
};
