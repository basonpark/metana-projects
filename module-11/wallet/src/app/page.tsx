"use client";

import React, { useState, useEffect } from "react";
import Onboarding from "../components/Onboarding";
import AccountInfo from "../components/AccountInfo";
import SendTransaction from "../components/SendTransaction";
import TransactionHistory from "../components/TransactionHistory";
import { Wallet } from "../lib/wallet";
import { getBalance } from "../lib/balance";

export default function Home() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<string>("0x0");
  const [showSend, setShowSend] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Load wallet from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem("wallet");
    const onboardingComplete = localStorage.getItem("onboardingComplete");

    if (savedWallet) {
      try {
        setWallet(JSON.parse(savedWallet));
        if (onboardingComplete === "true") {
          setHasCompletedOnboarding(true);
        }
      } catch (e) {
        console.error("Failed to parse saved wallet", e);
      }
    }
  }, []);

  // Fetch balance when wallet changes
  useEffect(() => {
    if (wallet) {
      refreshBalance();
      localStorage.setItem("wallet", JSON.stringify(wallet));
    }
  }, [wallet]);

  const refreshBalance = async () => {
    if (!wallet) return;
    try {
      const newBalance = await getBalance(wallet.address);
      setBalance(newBalance);
    } catch (e) {
      console.error("Failed to fetch balance", e);
    }
  };

  const refreshTransactions = async () => {
    // In a real app, this would fetch transactions from an API
    // For now, we'll just use sample data
    const sampleTx = [
      {
        hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        from: "0x1234567890abcdef1234567890abcdef12345678",
        to: wallet?.address || "",
        value: "0x38D7EA4C68000", // 0.001 ETH in wei
        timestamp: Math.floor(Date.now() / 1000) - 3600,
        status: "confirmed",
        direction: "incoming",
      },
      {
        hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        from: wallet?.address || "",
        to: "0xabcdef1234567890abcdef1234567890abcdef12",
        value: "0x16345785D8A0000", // 0.1 ETH in wei
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        status: "confirmed",
        direction: "outgoing",
      },
    ];
    setTransactions(sampleTx);
  };

  useEffect(() => {
    if (wallet) {
      refreshTransactions();
    }
  }, [wallet]);

  const handleOnboardingComplete = (newWallet: Wallet) => {
    setWallet(newWallet);
    setHasCompletedOnboarding(true);
    localStorage.setItem("onboardingComplete", "true");
  };

  const handleSendSuccess = () => {
    setShowSend(false);
    refreshBalance();
    refreshTransactions();
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-3xl">
        {!wallet || !hasCompletedOnboarding ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
          <>
            <AccountInfo
              wallet={wallet}
              balance={balance}
              onSend={() => setShowSend(true)}
              refreshBalance={refreshBalance}
            />

            {showSend && (
              <SendTransaction
                wallet={wallet}
                balance={balance}
                onClose={() => setShowSend(false)}
                onSuccess={handleSendSuccess}
              />
            )}

            <TransactionHistory
              walletAddress={wallet.address}
              refreshTransactions={refreshTransactions}
              transactions={transactions}
            />
          </>
        )}
      </div>
    </main>
  );
}
