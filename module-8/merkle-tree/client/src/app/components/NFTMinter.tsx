"use client";

import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";

export default function NFTMinter() {
  const {
    account,
    connect,
    disconnect,
    isConnected,
    mintNFT,
    currentState,
    totalSupply,
    maxSupply,
    loading,
    error,
  } = useWeb3();

  const [mintAmount, setMintAmount] = useState(1);

  // Handle minting
  const handleMint = async () => {
    await mintNFT(mintAmount);
  };

  // Get badge class based on current state
  const getBadgeClass = () => {
    switch (currentState) {
      case "Paused":
        return "badge badge-paused";
      case "PresaleActive":
        return "badge badge-presale";
      case "PublicSaleActive":
        return "badge badge-public";
      case "SoldOut":
        return "badge badge-soldout";
      case "Revealed":
        return "badge badge-revealed";
      default:
        return "badge badge-paused";
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card backdrop-blur-sm bg-white/90 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="heading-lg mb-2 text-[#22223B]">Advanced NFT</h2>
            <p className="body-md text-[#4A4E69]">
              Exclusive digital collectibles on the blockchain
            </p>
          </div>

          {/* Connection Status */}
          <div>
            {isConnected ? (
              <div className="flex flex-col items-end gap-2">
                <p className="body-sm text-[#4A4E69]">
                  Connected:
                  <span className="ml-2 px-3 py-1 bg-[#F2E9E4] text-[#22223B] rounded-full text-xs font-bold">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </p>
                <button onClick={disconnect} className="btn-danger">
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>

        {/* Sale Status */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <p className="body-sm text-[#4A4E69]">Sale Status:</p>
            <span className={getBadgeClass()}>{currentState}</span>
          </div>

          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${(totalSupply / maxSupply) * 100}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <p className="body-sm text-[#9A8C98]">Total Supply</p>
            <p className="body-sm font-medium text-[#4A4E69]">
              {totalSupply} / {maxSupply} minted
            </p>
          </div>
        </div>

        {/* Mint Controls */}
        {isConnected && currentState === "PublicSaleActive" && (
          <div className="p-6 border border-[#C9ADA7]/30 rounded-lg bg-[#F2E9E4]/50 mb-6">
            <h3 className="heading-md mb-4 text-[#22223B]">Public Mint</h3>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex items-center">
                <button
                  onClick={() => setMintAmount((prev) => Math.max(1, prev - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-[#4A4E69] text-white rounded-l-lg hover:bg-[#22223B] transition-colors text-xl"
                  disabled={loading}
                >
                  -
                </button>
                <div className="w-16 h-12 flex items-center justify-center border-t border-b border-[#4A4E69]/20 bg-white text-[#22223B] font-bold">
                  {mintAmount}
                </div>
                <button
                  onClick={() => setMintAmount((prev) => Math.min(5, prev + 1))}
                  className="w-12 h-12 flex items-center justify-center bg-[#4A4E69] text-white rounded-r-lg hover:bg-[#22223B] transition-colors text-xl"
                  disabled={loading}
                >
                  +
                </button>
              </div>

              <div className="flex-1">
                <p className="body-sm text-[#4A4E69] mb-1">
                  Price per NFT: <span className="font-bold">0.08 ETH</span>
                </p>
                <p className="body-sm text-[#4A4E69]">
                  Total:{" "}
                  <span className="font-bold">
                    {(0.08 * mintAmount).toFixed(2)} ETH
                  </span>{" "}
                  + gas
                </p>
              </div>
            </div>

            <button
              onClick={handleMint}
              className="w-full py-4 bg-[#9A8C98] text-white rounded-lg hover:bg-[#4A4E69] transition-colors font-bold text-lg"
              disabled={loading}
            >
              {loading
                ? "Processing Transaction..."
                : `Mint ${mintAmount} NFT${mintAmount > 1 ? "s" : ""}`}
            </button>
          </div>
        )}

        {/* Presale Message */}
        {isConnected && currentState === "PresaleActive" && (
          <div className="p-6 border border-[#4A4E69]/30 rounded-lg bg-[#F2E9E4]/50 mb-6">
            <h3 className="heading-md mb-3 text-[#22223B]">Presale Active</h3>
            <p className="body-md mb-4 text-[#4A4E69]">
              If you're on the allowlist, you can mint one NFT during the
              presale period at a discounted price of 0.05 ETH.
            </p>
            <button
              className="w-full py-3 bg-[#4A4E69] text-white rounded-lg hover:bg-[#22223B] transition-colors font-bold"
              disabled={loading}
            >
              Check Eligibility
            </button>
          </div>
        )}

        {/* Sold Out Message */}
        {isConnected && currentState === "SoldOut" && (
          <div className="p-6 border border-[#22223B]/30 rounded-lg bg-[#F2E9E4]/50 mb-6">
            <h3 className="heading-md mb-3 text-[#22223B]">
              Collection Sold Out
            </h3>
            <p className="body-md mb-4 text-[#4A4E69]">
              All NFTs have been minted. You can still purchase them on
              secondary marketplaces.
            </p>
            <button className="w-full py-3 bg-[#22223B] text-white rounded-lg hover:bg-[#4A4E69] transition-colors font-bold">
              View on OpenSea
            </button>
          </div>
        )}

        {/* Revealed Message */}
        {isConnected && currentState === "Revealed" && (
          <div className="p-6 border border-[#C9ADA7]/30 rounded-lg bg-[#F2E9E4]/50 mb-6">
            <h3 className="heading-md mb-3 text-[#22223B]">NFTs Revealed!</h3>
            <p className="body-md mb-4 text-[#4A4E69]">
              The collection has been revealed. Check your NFTs to see what you
              got!
            </p>
            <button className="w-full py-3 bg-[#C9ADA7] text-[#22223B] rounded-lg hover:bg-[#9A8C98] hover:text-white transition-colors font-bold">
              View My Collection
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg mt-4">
            <p className="font-medium">Error</p>
            <p className="body-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card bg-[#F2E9E4]/80">
          <div className="w-12 h-12 flex items-center justify-center bg-[#22223B] text-white rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="heading-md mb-2 text-[#22223B]">
            Merkle Tree Airdrop
          </h3>
          <p className="body-sm text-[#4A4E69]">
            Efficient verification for presale eligibility using cryptographic
            proofs.
          </p>
        </div>

        <div className="card bg-[#F2E9E4]/80">
          <div className="w-12 h-12 flex items-center justify-center bg-[#4A4E69] text-white rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <h3 className="heading-md mb-2 text-[#22223B]">Commit-Reveal</h3>
          <p className="body-sm text-[#4A4E69]">
            Fair randomization with a two-step process to prevent manipulation.
          </p>
        </div>

        <div className="card bg-[#F2E9E4]/80">
          <div className="w-12 h-12 flex items-center justify-center bg-[#9A8C98] text-white rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="heading-md mb-2 text-[#22223B]">Multicall Support</h3>
          <p className="body-sm text-[#4A4E69]">
            Transfer multiple NFTs in a single transaction for gas efficiency.
          </p>
        </div>
      </div>
    </div>
  );
}
