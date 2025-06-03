import React, { useState, useEffect } from "react";
import { Wallet } from "../lib/wallet";
import { shortenAddress } from "../lib/utils";
import { getAddressUrl } from "../lib/network";
import NetworkSelector from "./NetworkSelector";

// Icons (you can replace these with actual icon components)
const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);
const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);
const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 4v6h-6"></path>
    <path d="M1 20v-6h6"></path>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
    <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);
const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);
const FaucetIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path>
    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path>
    <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path>
    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path>
    <path d="M12 16h3.5a3.5 3.5 0 1 1 0 7H12v-7z"></path>
  </svg>
);

interface AccountInfoProps {
  wallet: Wallet;
  balance: string;
  onSend: () => void;
  refreshBalance: () => void;
}

const AccountInfo: React.FC<AccountInfoProps> = ({
  wallet,
  balance,
  onSend,
  refreshBalance,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ethPrice, setEthPrice] = useState(0);

  useEffect(() => {
    // Fetch ETH price - this is just a placeholder
    // In a real app, you would fetch this from an API
    setEthPrice(1800);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatEther = (wei: string) => {
    // Convert wei to ether (this is a simplified version)
    const etherValue = parseInt(wei, 16) / 1e18;
    return etherValue.toFixed(4);
  };

  const formatFiatValue = (balance: string, price: number) => {
    const etherValue = parseInt(balance, 16) / 1e18;
    return (etherValue * price).toFixed(2);
  };

  const handleRefreshBalance = async () => {
    setIsLoading(true);
    await refreshBalance();
    setIsLoading(false);
  };

  return (
    <div className="account-card glass-effect">
      <div className="account-header flex items-center justify-between">
        <h2>My Wallet</h2>
        <NetworkSelector />
      </div>

      <div className="address-container">
        <div className="address-label">Address</div>
        <div className="address-display flex items-center gap-2">
          <span>{shortenAddress(wallet.address)}</span>
          <button
            className="icon-button"
            onClick={() => copyToClipboard(wallet.address)}
          >
            <CopyIcon />
            <span className="tooltip">Copy</span>
          </button>
          <button
            className="icon-button"
            onClick={() => window.open(getAddressUrl(wallet.address))}
          >
            <ExternalLinkIcon />
            <span className="tooltip">View on Explorer</span>
          </button>
        </div>
      </div>

      <div className="balance-container">
        <div className="balance-amount">
          <span className="balance-value">{formatEther(balance)}</span>
          <span className="balance-symbol">ETH</span>
        </div>
        <div className="balance-fiat">
          ≈ ${formatFiatValue(balance, ethPrice)}
        </div>

        <button
          className="refresh-button icon-button shimmer"
          onClick={handleRefreshBalance}
        >
          <RefreshIcon />
          <span className="tooltip">Refresh</span>
        </button>
      </div>

      <div className="button-container flex gap-4 mt-4">
        <button className="primary-button" onClick={onSend}>
          <SendIcon />
          Send
        </button>
        <button
          className="secondary-button"
          onClick={() => window.open("https://sepoliafaucet.com")}
        >
          <FaucetIcon />
          Get Test ETH
        </button>
      </div>
    </div>
  );
};

export default AccountInfo;
