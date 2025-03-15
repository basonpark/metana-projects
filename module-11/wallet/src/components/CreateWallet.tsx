import { useState } from "react";
import { createWallet, importWallet, Wallet } from "../lib/wallet";

interface CreateWalletProps {
  onWalletCreated: (wallet: Wallet) => void;
}

export default function CreateWallet({ onWalletCreated }: CreateWalletProps) {
  const [importKey, setImportKey] = useState("");
  const [error, setError] = useState("");

  function handleCreateWallet() {
    try {
      const wallet = createWallet();
      onWalletCreated(wallet);
    } catch (e) {
      setError("Failed to create wallet");
      console.error(e);
    }
  }

  function handleImportWallet() {
    try {
      if (!importKey) {
        setError("Please enter a private key");
        return;
      }

      const wallet = importWallet(importKey);
      onWalletCreated(wallet);
    } catch (e) {
      setError("Invalid private key format");
      console.error(e);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Create or Import Wallet</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Create New Wallet</h3>
          <p className="text-sm text-gray-600 mb-3">
            Generate a new random wallet address and private key.
          </p>
          <button
            onClick={handleCreateWallet}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Create New Wallet
          </button>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-2">Import Existing Wallet</h3>
          <p className="text-sm text-gray-600 mb-3">
            Enter your private key to access your wallet.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Private Key
            </label>
            <input
              type="text"
              value={importKey}
              onChange={(e) => setImportKey(e.target.value)}
              placeholder="0x..."
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleImportWallet}
            className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 transition"
          >
            Import Wallet
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>
            Warning: This is a demonstration wallet for educational purposes
            only.
          </p>
          <p>Never use in production or with real funds.</p>
        </div>
      </div>
    </div>
  );
}
