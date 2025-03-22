"use client";

import { useEffect, useState } from "react";
import { RootLayout } from "@/components/layout/RootLayout";
import Link from "next/link";
import { useMarketContract } from "@/hooks/useMarketContract";
import { useAccount } from "wagmi";
import {
  ArrowUpRight,
  ChevronRight,
  Clock,
  DollarSign,
  PlusCircle,
  Trophy,
  Wallet,
} from "lucide-react";

// Define the interface for user positions
interface UserPosition {
  marketId: string;
  marketTitle: string;
  outcome: string;
  shares: string;
  value: string;
  entryPrice: string;
  currentPrice: string;
  pnl: string;
  isProfitable: boolean;
}

// Define the interface for claimable rewards
interface ClaimableReward {
  marketId: string;
  marketTitle: string;
  amount: string;
  outcome: string;
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const {
    getMarketsCreatedByUser,
    getUserPositions,
    getClaimableRewards,
    claimReward,
    isLoading: contractLoading,
  } = useMarketContract();

  // State management
  const [createdMarkets, setCreatedMarkets] = useState<any[]>([]);
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [claimableRewards, setClaimableRewards] = useState<ClaimableReward[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("positions");
  const [totalEarnings, setTotalEarnings] = useState("0.00");
  const [portfolioValue, setPortfolioValue] = useState("0.00");

  // Wallet mock connection status (would be replaced with real wallet connection)
  const [walletConnected, setWalletConnected] = useState(false);

  // Load user data when wallet is connected
  useEffect(() => {
    // For demo purposes, check if wallet is connected after a short delay
    const timer = setTimeout(() => {
      setWalletConnected(isConnected);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isConnected]);

  // Load user data when wallet is connected
  useEffect(() => {
    if (!walletConnected) return;

    const loadUserData = async () => {
      setIsLoading(true);

      try {
        // Load created markets
        const markets = await getMarketsCreatedByUser(0, 10);
        setCreatedMarkets(markets);

        // Load positions
        const userPositions = await getUserPositions();
        setPositions(userPositions as UserPosition[]);

        // Calculate portfolio value
        if (userPositions && userPositions.length > 0) {
          const totalValue = userPositions.reduce(
            (sum, pos) => sum + parseFloat(pos.value || "0"),
            0
          );
          setPortfolioValue(totalValue.toFixed(2));
        }

        // Load claimable rewards
        const rewards = await getClaimableRewards();
        setClaimableRewards(rewards as ClaimableReward[]);

        // Calculate total earnings
        if (rewards && rewards.length > 0) {
          const total = rewards.reduce(
            (sum, reward) => sum + parseFloat(reward.amount || "0"),
            0
          );
          setTotalEarnings(total.toFixed(2));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [
    walletConnected,
    getMarketsCreatedByUser,
    getUserPositions,
    getClaimableRewards,
  ]);

  // Function to handle claiming rewards
  const handleClaimReward = async (marketId: string) => {
    try {
      await claimReward(marketId);

      // Update claimable rewards after claiming
      const rewards = await getClaimableRewards();
      setClaimableRewards(rewards as ClaimableReward[]);

      // Recalculate total earnings
      if (rewards && rewards.length > 0) {
        const total = rewards.reduce(
          (sum, reward) => sum + parseFloat(reward.amount || "0"),
          0
        );
        setTotalEarnings(total.toFixed(2));
      } else {
        setTotalEarnings("0.00");
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <RootLayout>
        <div className="container mx-auto py-10 min-h-screen flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <h2 className="text-xl font-semibold">Loading portfolio data...</h2>
        </div>
      </RootLayout>
    );
  }

  // Render wallet connection prompt if not connected
  if (!walletConnected) {
    return (
      <RootLayout>
        <div className="container mx-auto py-10 min-h-screen">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please connect your wallet to view your portfolio and positions.
            </p>
            <button
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              onClick={() => setWalletConnected(true)} // In real app, this would trigger wallet connection
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Portfolio</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your portfolio performance and manage your positions.
          </p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Portfolio Value */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">
                Portfolio Value
              </h3>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold mb-1">${portfolioValue}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {positions.length} active positions
            </p>
          </div>

          {/* Total Earnings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">
                Total Earnings
              </h3>
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold mb-1">${totalEarnings}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {claimableRewards.length} markets with claimable rewards
            </p>
          </div>

          {/* Created Markets */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">
                Created Markets
              </h3>
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold mb-1">{createdMarkets.length}</p>
            <Link
              href="/markets/create"
              className="text-sm text-primary flex items-center hover:underline"
            >
              Create a new market <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Tabs for Positions, Created Markets, and Claimable Rewards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === "positions"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap`}
                onClick={() => setActiveTab("positions")}
              >
                Positions
              </button>
              <button
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === "created"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap`}
                onClick={() => setActiveTab("created")}
              >
                Created Markets
              </button>
              <button
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === "rewards"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap`}
                onClick={() => setActiveTab("rewards")}
              >
                Claimable Rewards
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Positions Tab */}
            {activeTab === "positions" && (
              <>
                {positions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Market
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Outcome
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Shares
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Value
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Entry Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Current Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            P&L
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {positions.map((position, index) => (
                          <tr key={index}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              {position.marketTitle}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  position.outcome === "Yes"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {position.outcome}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {position.shares}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              ${position.value}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {position.entryPrice}%
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {position.currentPrice}%
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <span
                                className={
                                  position.isProfitable
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {position.pnl}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                              <Link
                                href={`/markets/${position.marketId}`}
                                className="inline-flex items-center hover:underline"
                              >
                                View <ArrowUpRight className="h-3 w-3 ml-1" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      You don't have any positions yet.
                    </p>
                    <Link
                      href="/markets"
                      className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Explore Markets
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Created Markets Tab */}
            {activeTab === "created" && (
              <>
                {createdMarkets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {createdMarkets.map((market, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                      >
                        <h3 className="text-lg font-medium mb-2">
                          {market.question}
                        </h3>
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {market.timeRemaining}
                          </span>
                          <span>${market.liquidity}</span>
                        </div>
                        <div className="flex justify-between mb-4">
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">
                              Yes
                            </span>
                            <span className="font-medium">
                              {(market.yesPrice * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">
                              No
                            </span>
                            <span className="font-medium">
                              {(market.noPrice * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">
                              Category
                            </span>
                            <span className="font-medium">
                              {market.category}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/markets/${market.address}`}
                          className="text-primary flex items-center text-sm hover:underline"
                        >
                          View details <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      You haven't created any markets yet.
                    </p>
                    <Link
                      href="/markets/create"
                      className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Create a Market
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Claimable Rewards Tab */}
            {activeTab === "rewards" && (
              <>
                {claimableRewards.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Market
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Outcome
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {claimableRewards.map((reward, index) => (
                          <tr key={index}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              {reward.marketTitle}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  reward.outcome === "Yes"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {reward.outcome}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              ${reward.amount}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <button
                                className="px-3 py-1 bg-primary text-white text-xs rounded-md hover:bg-primary/90 transition-colors"
                                onClick={() =>
                                  handleClaimReward(reward.marketId)
                                }
                              >
                                Claim
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">
                      You don't have any claimable rewards at this time.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold mb-2">
            Ready to explore more markets?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Discover new prediction markets and place your bets.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/markets"
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Explore Markets
            </Link>
            <Link
              href="/markets/create"
              className="px-4 py-2 bg-white text-primary border border-primary rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Create a Market
            </Link>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
