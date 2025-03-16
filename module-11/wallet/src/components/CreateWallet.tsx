import React, { useState } from "react";
import { createWallet, importWallet } from "../lib/wallet";

// Icons
const WalletPlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>
    <line x1="17" y1="3" x2="17" y2="21"></line>
    <line x1="12" y1="12" x2="20" y2="12"></line>
    <line x1="16" y1="8" x2="20" y2="8"></line>
    <line x1="16" y1="16" x2="20" y2="16"></line>
    <path d="M8 12h.01"></path>
  </svg>
);

const ImportIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="12" y1="18" x2="12" y2="12"></line>
    <line x1="9" y1="15" x2="15" y2="15"></line>
  </svg>
);

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const AlertCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const ShieldIcon = () => (
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const EthereumLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
  >
    <path d="M32 8L19 32L32 24V8Z" fill="#8A92B2" fillOpacity="0.6"></path>
    <path d="M32 8L45 32L32 24V8Z" fill="#62688F" fillOpacity="0.6"></path>
    <path d="M32 40L19 32L32 24V40Z" fill="#62688F"></path>
    <path d="M32 40L45 32L32 24V40Z" fill="#454A75"></path>
    <path d="M32 44L19 36L32 56V44Z" fill="#8A92B2"></path>
    <path d="M32 44L45 36L32 56V44Z" fill="#62688F"></path>
  </svg>
);

interface CreateWalletProps {
  onWalletCreated: (wallet: { address: string; privateKey: string }) => void;
}

const CreateWallet: React.FC<CreateWalletProps> = ({ onWalletCreated }) => {
  const [showImport, setShowImport] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");

  const handleCreateWallet = () => {
    try {
      const wallet = createWallet();
      onWalletCreated(wallet);
    } catch (err) {
      setError("Failed to create wallet. Please try again.");
      console.error(err);
    }
  };

  const handleImportWallet = () => {
    if (!privateKey) {
      setError("Please enter a private key");
      return;
    }

    try {
      const wallet = importWallet(privateKey);
      onWalletCreated(wallet);
    } catch (err) {
      setError("Invalid private key. Please check and try again.");
      console.error(err);
    }
  };

  return (
    <div className="create-wallet-container flex flex-col items-center justify-center min-h-screen p-4">
      <div className="logo-container flex flex-col items-center mb-8">
        <div className="logo-animation mb-4">
          <EthereumLogo />
        </div>
        <h1>Ethereum Wallet</h1>
      </div>

      <div className="wallet-options glass-effect w-full max-w-md">
        <h2 className="text-center mb-6">Get Started</h2>

        <div className="option-buttons flex flex-col gap-4">
          <button
            className="option-button primary-button flex items-center p-4"
            onClick={handleCreateWallet}
          >
            <WalletPlusIcon />
            <div className="option-text ml-4 text-left">
              <span className="option-title block font-bold">
                Create New Wallet
              </span>
              <span className="option-description block text-sm opacity-80">
                Generate a new wallet with a random private key
              </span>
            </div>
          </button>

          <div className="option-divider relative text-center my-2">
            <span className="bg-gray-800 px-2 relative z-10">OR</span>
            <div className="absolute top-1/2 w-full h-px bg-gray-700"></div>
          </div>

          <button
            className="option-button secondary-button flex items-center p-4"
            onClick={() => setShowImport(true)}
          >
            <ImportIcon />
            <div className="option-text ml-4 text-left">
              <span className="option-title block font-bold">
                Import Existing Wallet
              </span>
              <span className="option-description block text-sm opacity-80">
                Use your private key to access your wallet
              </span>
            </div>
          </button>
        </div>

        {showImport && (
          <div className="import-container mt-6">
            <div className="input-group">
              <label htmlFor="privateKey">Private Key</label>
              <div className="private-key-input relative">
                <input
                  id="privateKey"
                  type={showKey ? "text" : "password"}
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter your private key (0x...)"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="toggle-visibility absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              className="import-button primary-button w-full mt-4"
              onClick={handleImportWallet}
              disabled={!privateKey}
            >
              Import Wallet
            </button>
          </div>
        )}

        {error && (
          <div className="error-alert flex items-center gap-2 bg-red-500 bg-opacity-20 text-red-400 p-3 rounded-md mt-4">
            <AlertCircleIcon />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="security-notice flex items-center gap-2 mt-6 text-sm text-gray-400">
        <ShieldIcon />
        <p>Your keys are stored locally and never sent to any server</p>
      </div>
    </div>
  );
};

export default CreateWallet;
