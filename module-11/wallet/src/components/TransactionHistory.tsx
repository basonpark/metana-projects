import React, { useState } from "react";
import { getTransactionUrl } from "../lib/network";
import { shortenAddress } from "../lib/utils";

// Icons
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

const ArrowUpIcon = () => (
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
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
);

const ArrowDownIcon = () => (
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
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
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

const CheckCircleIcon = () => (
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
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const ClockIcon = () => (
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
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const XCircleIcon = () => (
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
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const EmptyBoxIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
  direction: "incoming" | "outgoing";
}

interface TransactionHistoryProps {
  walletAddress: string;
  refreshTransactions: () => Promise<void>;
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  walletAddress,
  refreshTransactions,
  transactions,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    await refreshTransactions();
    setIsLoading(false);
  };

  const formatEther = (wei: string) => {
    // Convert wei to ether
    const etherValue = parseInt(wei, 16) / 1e18;
    return etherValue.toFixed(4);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="history-container glass-effect">
      <div className="history-header flex items-center justify-between mb-4">
        <h2>Transaction History</h2>
        <button className="refresh-button icon-button" onClick={handleRefresh}>
          <RefreshIcon className={isLoading ? "spinning" : ""} />
          <span className="tooltip">Refresh</span>
        </button>
      </div>

      {transactions.length > 0 ? (
        <div className="transaction-list space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.hash}
              className="transaction-item flex items-center p-4 rounded-lg bg-opacity-20 bg-gray-800"
            >
              <div className="tx-icon-container mr-3">
                {tx.direction === "incoming" ? (
                  <div className="bg-opacity-20 bg-green-500 p-2 rounded-full">
                    <ArrowDownIcon />
                  </div>
                ) : (
                  <div className="bg-opacity-20 bg-blue-500 p-2 rounded-full">
                    <ArrowUpIcon />
                  </div>
                )}
              </div>

              <div className="tx-details flex-1">
                <div className="tx-top-row flex justify-between">
                  <span className="tx-type font-medium">
                    {tx.direction === "incoming" ? "Received" : "Sent"}
                  </span>
                  <span
                    className={`tx-amount font-semibold ${
                      tx.direction === "incoming" ? "text-green-500" : ""
                    }`}
                  >
                    {tx.direction === "incoming" ? "+" : "-"}
                    {formatEther(tx.value)} ETH
                  </span>
                </div>

                <div className="tx-bottom-row flex justify-between text-sm text-gray-400 mt-1">
                  <span className="tx-address">
                    {tx.direction === "incoming" ? "From: " : "To: "}
                    {shortenAddress(
                      tx.direction === "incoming" ? tx.from : tx.to
                    )}
                  </span>
                  <span className="tx-time">
                    {formatTimestamp(tx.timestamp)}
                  </span>
                </div>
              </div>

              <div className="tx-status-container ml-3 flex items-center">
                {tx.status === "confirmed" ? (
                  <span className="status-confirmed flex items-center text-green-500 mr-2">
                    <CheckCircleIcon />
                  </span>
                ) : tx.status === "pending" ? (
                  <span className="status-pending flex items-center text-yellow-500 mr-2">
                    <ClockIcon />
                  </span>
                ) : (
                  <span className="status-failed flex items-center text-red-500 mr-2">
                    <XCircleIcon />
                  </span>
                )}

                <button
                  className="explorer-link icon-button"
                  onClick={() => window.open(getTransactionUrl(tx.hash))}
                >
                  <ExternalLinkIcon />
                  <span className="tooltip">View on Explorer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state flex flex-col items-center justify-center py-10 text-center">
          <EmptyBoxIcon className="empty-icon mb-4 text-gray-600" />
          <p className="text-lg font-medium">No transactions yet</p>
          <p className="empty-subtext text-sm text-gray-400 mt-2">
            Transactions will appear here once you send or receive ETH
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
