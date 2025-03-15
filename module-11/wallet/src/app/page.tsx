"use client";

import { useState, useEffect } from "react";
import AccountInfo from "../components/AccountInfo";
import CreateWallet from "../components/CreateWallet";
import SendTransaction from "../components/SendTransaction";
import TransactionHistory from "../components/TransactionHistory";
import NetworkSelector from "../components/NetworkSelector";
import { Wallet } from "../lib/wallet";

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [transactions, setTransactions] = useState<any[]>([]);

  // load wallet from localStorage on component mount
  useEffect(() => {
    const storedWallet = localStorage.getItem("wallet");
    if (storedWallet) {
      try {
        setWallet(JSON.parse(storedWallet));
      } catch (e) {
        console.error("Failed to load wallet", e);
      }
    }
  }, []);

  // save wallet to localStorage when it changes
  useEffect(() => {
    if (wallet) {
      localStorage.setItem("wallet", JSON.stringify(wallet));
    }
  }, [wallet]);

  // fetch balance when wallet changes
  useEffect(() => {
    if (wallet) {
      fetchBalance(wallet.address);
    }
  }, [wallet]);

  async function fetchBalance(address: string) {
    try {
      const response = await fetch("/api/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error("Failed to fetch balance", error);
    }
  }

  function handleTransactionComplete(tx: any) {
    setTransactions((prev) => [tx, ...prev]);

    // refresh balance after transaction
    if (wallet) {
      fetchBalance(wallet.address);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Basic Ethereum Wallet
      </h1>

      <div className="mb-6">
        <NetworkSelector />
      </div>

      {!wallet ? (
        <CreateWallet onWalletCreated={setWallet} />
      ) : (
        <div className="space-y-8">
          <AccountInfo wallet={wallet} balance={balance} />

          <SendTransaction
            wallet={wallet}
            onTransactionComplete={handleTransactionComplete}
          />

          <TransactionHistory transactions={transactions} />
        </div>
      )}

      <div className="mt-12 text-center text-sm text-gray-500">
        <p>This is a demonstration wallet. Never use in production.</p>
        <p>
          All transaction data is handled manually without wallet libraries.
        </p>
      </div>
    </div>
  );
}
