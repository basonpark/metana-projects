import { useState } from "react";
import { Wallet } from "../lib/wallet";
import { shortenAddress } from "../lib/utils";
import { getAddressUrl } from "../lib/network";

interface AccountInfoProps {
  wallet: Wallet;
  balance: string;
}

export default function AccountInfo({ wallet, balance }: AccountInfoProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Account Information</h2>

      <div className="space-y-4">
        {/* address display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <div className="flex items-center">
            <div className="bg-gray-100 rounded px-3 py-2 flex-1 font-mono text-sm break-all">
              {wallet.address}
            </div>
            <button
              onClick={() => copyToClipboard(wallet.address)}
              className="ml-2 p-2 text-blue-600 hover:text-blue-800"
              title="Copy to clipboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            </button>
            <a
              href={getAddressUrl(wallet.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 p-2 text-blue-600 hover:text-blue-800"
              title="View on block explorer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
        </div>

        {/* balance display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Balance
          </label>
          <div className="bg-gray-100 rounded px-3 py-2 font-mono text-sm">
            {balance} ETH
          </div>
        </div>

        {/* private key (hidden by default) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Private Key
            </label>
            <button
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showPrivateKey ? "Hide" : "Show"}
            </button>
          </div>

          {showPrivateKey ? (
            <div className="relative">
              <div className="bg-gray-100 rounded px-3 py-2 font-mono text-sm break-all">
                {wallet.privateKey}
              </div>
              <button
                onClick={() => copyToClipboard(wallet.privateKey)}
                className="absolute right-2 top-2 p-1 text-blue-600 hover:text-blue-800"
                title="Copy to clipboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 rounded px-3 py-2 font-mono text-sm">
              ********************************
            </div>
          )}
          <p className="mt-1 text-xs text-red-600">
            Never share your private key with anyone!
          </p>
        </div>
      </div>
    </div>
  );
}
