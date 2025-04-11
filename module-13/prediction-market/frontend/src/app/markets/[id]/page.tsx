"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { RootLayout } from "@/components/layout/RootLayout";
import { useMarketContractSafe } from "../../../hooks/useMarketContractSafe";
import { MarketStatus, Outcome } from "@/types/contracts";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { fetchMarketById } from "@/services/gamma";
import { PolymarketMarket } from "@/types/polymarket";

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = params.id as string;

  const [market, setMarket] = useState<any>(null);
  const [betAmount, setBetAmount] = useState<string>("10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"trade" | "details">("trade");

  const {
    placeBet,
    isSubmitting: isPlacingBet,
    isConfirming,
    isConfirmed,
    hash,
    writeError,
  } = useMarketContractSafe();

  useEffect(() => {
    const loadMarketData = async () => {
      if (!marketId) return;

      try {
        setIsLoading(true);

        // --- Attempt to load data from Gamma API first ---
        console.log(`Fetching market ${marketId} via Gamma service...`);
        const apiMarket = await fetchMarketById(marketId);

        if (apiMarket) {
          console.log(`Found market ${marketId} via Gamma service.`);
          // Map the found market data (using correct fields from PolymarketMarket type)
          setMarket({
            id: apiMarket.id,
            title: apiMarket.question,
            description: apiMarket.description || "No description available.",
            category: apiMarket.category || "General",
            // TODO: Determine status based on available fields (e.g., active, closed, endDate)
            status: MarketStatus.Open, // Placeholder status - API data might lack this
            // TODO: Determine outcome if market is settled - API data might lack this
            outcome: Outcome.NoOutcome, // Placeholder outcome
            endDate: apiMarket.endDate,
            timeRemaining: apiMarket.endDate
              ? formatTimeRemaining(apiMarket.endDate)
              : "N/A",
            yesPrice: apiMarket.bestAsk ?? 0.5,
            noPrice: apiMarket.bestBid ?? 0.5,
            liquidity: apiMarket.liquidityClob?.toString() ?? "0",
            creationTime: new Date(
              apiMarket.created_at || Date.now()
            ).getTime(),
            creator: "Gamma API", // Indicate source
            fee: 1.0, // Placeholder fee
            // User position needs to be fetched from the contract separately if needed
            // We are removing the direct contract fetch here for simplicity
            userPosition: null, // Assume no user position from Gamma API initially
          });
        } else {
          console.log(
            `Market ${marketId} not found via Gamma service. Using fallback demo data.`
          );
          // If not found in API, use fallback demo data
          const demoMarket = {
            id: marketId,
            title: "Will Bitcoin exceed $100,000 by the end of 2024?",
            description:
              "This market resolves to YES if the price of Bitcoin (BTC) exceeds $100,000 USD at any point before December 31, 2024, 11:59 PM UTC according to the Coinbase Pro BTC/USD market.",
            category: "Crypto",
            status: MarketStatus.Open,
            outcome: Outcome.NoOutcome,
            endDate: "2024-12-31T23:59:59Z",
            timeRemaining: "8 months remaining", // Keep demo data as is
            yesPrice: 0.65,
            noPrice: 0.35,
            liquidity: "135000", // Keep demo data as is
            creationTime: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
            creator: "Demo Data", // Update creator
            fee: 1.0, // 1% fee
            userPosition: null,
          };
          setMarket(demoMarket);
        }

        /* --- Removed Contract Fetch Logic ---
        // Try to get market from our contract
        // const contractMarket = await getMarket(marketId);

        // if (contractMarket) { ... } else { ... API logic ... } 
        */
      } catch (error) {
        // console.error("Error loading market:", error); // Original error log
        console.error("Error loading market data from API:", error);
        // Optionally fallback to demo data on API error too
      } finally {
        setIsLoading(false);
      }
    };

    loadMarketData();
  }, [marketId]); // Only depends on marketId now

  // Helper function to calculate time remaining (copied from HomePage - move to utils?)
  const formatTimeRemaining = (endDateString: string): string => {
    const now = new Date();
    const end = new Date(endDateString);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      return "Ended";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 1) return `${days} days remaining`;
    if (days === 1) return `1 day remaining`;
    if (hours > 1) return `${hours} hours remaining`;
    if (hours === 1) return `1 hour remaining`;
    if (minutes > 1) return `${minutes} minutes remaining`;
    return `1 minute remaining`;
  };

  const handlePlaceBet = async (outcome: Outcome) => {
    // Use market.id (which should now be the API market ID if loaded)
    // Note: placeBet in the hook expects the CONTRACT address, not the API ID.
    // This needs reconciliation. Assuming API ID === Contract Address for now.
    // If they differ, you need a way to map API ID to contract address.
    const contractAddress = market.id; // <<< ASSUMPTION HERE

    if (!contractAddress || isPlacingBet || parseFloat(betAmount) <= 0) return;

    try {
      // setIsSubmitting(true); // Handled by hook state (isPlacingBet)
      console.log(
        `Placing bet on ${contractAddress}, outcome: ${outcome}, amount: ${betAmount}`
      );
      await placeBet(contractAddress, outcome, betAmount);

      // TODO: Add feedback based on isConfirming, isConfirmed, hash, writeError from the hook
      // Maybe show a toast notification on success/error?
      console.log("Transaction submitted. Hash:", hash);

      // --- Optional: Refetch API data after transaction ---
      // Might be better to wait for confirmation (isConfirmed)
      // or update UI optimistically based on events
      // const updatedApiMarket = await fetchMarketById(marketId);
      // if (updatedApiMarket) { ... update state ... }
    } catch (error) {
      console.error("Error placing bet:", error);
      // TODO: Show error message to user
    } finally {
      // setIsSubmitting(false); // Handled by hook state
    }
  };

  // Format price as percentage
  const formatPriceAsPercent = (price: number) => {
    return `${(price * 100).toFixed(0)}%`;
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <RootLayout>
        <div className="container mx-auto py-8">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-lg border border-border bg-background p-6 shadow-sm space-y-6 animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-40 bg-muted rounded"></div>
                <div className="h-40 bg-muted rounded"></div>
              </div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  if (!market) {
    return (
      <RootLayout>
        <div className="container mx-auto py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Market Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The market you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/markets"
              className="inline-flex items-center text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Markets
            </Link>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link
            href="/markets"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Markets
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Market Details Card */}
          <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <div className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                  {market.category}
                </div>
                <h1 className="text-2xl font-bold">{market.title}</h1>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{market.timeRemaining}</span>
                  </div>

                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="mr-1 h-4 w-4" />
                    <span>
                      Liquidity: ${parseInt(market.liquidity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-border">
                <div className="flex -mb-px">
                  <button
                    className={`py-2 px-4 text-sm font-medium border-b-2 ${
                      activeTab === "trade"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("trade")}
                  >
                    Trade
                  </button>
                  <button
                    className={`py-2 px-4 text-sm font-medium border-b-2 ${
                      activeTab === "details"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("details")}
                  >
                    Details
                  </button>
                </div>
              </div>

              {/* Trading Tab Content */}
              {activeTab === "trade" && (
                <div className="space-y-6">
                  {/* Trading cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* YES Card */}
                    <div className="rounded-lg border border-border p-5 hover:border-primary/70 transition-colors">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold">YES</span>
                          <span className="text-sm font-medium">
                            {formatPriceAsPercent(market.yesPrice)}
                          </span>
                        </div>

                        <div className="h-2 w-full rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-primary rounded-l-full"
                            style={{ width: `${market.yesPrice * 100}%` }}
                          />
                          <div
                            className="h-full bg-muted-foreground/30 rounded-r-full"
                            style={{ width: `${market.noPrice * 100}%` }}
                          />
                        </div>

                        <button
                          className="w-full py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
                          onClick={() => handlePlaceBet(Outcome.Yes)}
                          disabled={
                            isPlacingBet || market.status !== MarketStatus.Open
                          }
                        >
                          {isPlacingBet ? "Submitting..." : "Buy YES"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* NO Card */}
                    <div className="rounded-lg border border-border p-5 hover:border-primary/70 transition-colors">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold">NO</span>
                          <span className="text-sm font-medium">
                            {formatPriceAsPercent(market.noPrice)}
                          </span>
                        </div>

                        <div className="h-2 w-full rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-muted-foreground/30 rounded-l-full"
                            style={{ width: `${market.noPrice * 100}%` }}
                          />
                          <div
                            className="h-full bg-primary rounded-r-full"
                            style={{ width: `${market.yesPrice * 100}%` }}
                          />
                        </div>

                        <button
                          className="w-full py-2 rounded-md border border-border bg-background font-medium hover:bg-muted transition-colors flex items-center justify-center"
                          onClick={() => handlePlaceBet(Outcome.No)}
                          disabled={
                            isPlacingBet || market.status !== MarketStatus.Open
                          }
                        >
                          {isPlacingBet ? "Submitting..." : "Buy NO"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bet amount section */}
                  <div className="p-4 rounded-lg border border-border">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Bet Amount</span>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <input
                            type="number"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            className="w-24 p-2 text-right bg-background border border-input rounded-md"
                            min="1"
                            disabled={market.status !== MarketStatus.Open}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">
                          Potential Profit (YES)
                        </div>
                        <div className="font-medium">
                          $
                          {(
                            parseFloat(betAmount) / market.yesPrice -
                            parseFloat(betAmount)
                          ).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">
                          Potential Profit (NO)
                        </div>
                        <div className="font-medium">
                          $
                          {(
                            parseFloat(betAmount) / market.noPrice -
                            parseFloat(betAmount)
                          ).toFixed(2)}
                        </div>
                      </div>

                      {market.fee > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-muted-foreground">
                            Market fee
                          </div>
                          <div className="font-medium">{market.fee}%</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User position section (if connected and has position) */}
                  {market.userPosition && (
                    <div className="p-4 rounded-lg border border-border bg-muted/10">
                      <h3 className="text-sm font-medium mb-3">
                        Your Position
                      </h3>
                      <div className="space-y-2">
                        {parseInt(market.userPosition.yes) > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span>YES shares</span>
                            <span className="font-medium">
                              {parseInt(
                                market.userPosition.yes
                              ).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {parseInt(market.userPosition.no) > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span>NO shares</span>
                            <span className="font-medium">
                              {parseInt(
                                market.userPosition.no
                              ).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span>Potential Payout</span>
                          <span className="font-medium">
                            $
                            {parseInt(
                              market.userPosition.potential
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Details Tab Content */}
              {activeTab === "details" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Market Description</h3>
                    <div className="text-muted-foreground whitespace-pre-line font-light">
                      {market.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/10">
                      <div className="text-sm text-muted-foreground">
                        Resolution Date
                      </div>
                      <div className="font-medium">
                        {formatDate(market.endDate)}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/10">
                      <div className="text-sm text-muted-foreground">
                        Created
                      </div>
                      <div className="font-medium">
                        {new Date(market.creationTime).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/10">
                      <div className="text-sm text-muted-foreground">
                        Creator
                      </div>
                      <div className="font-medium">{market.creator}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/10">
                      <div className="text-sm text-muted-foreground">
                        Status
                      </div>
                      <div className="font-medium">
                        {MarketStatus[market.status]}
                        {market.status === MarketStatus.Settled && (
                          <span> ({Outcome[market.outcome]})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-muted/5">
                    <h3 className="text-sm font-medium mb-2">How This Works</h3>
                    <p className="text-sm text-muted-foreground">
                      Prediction markets allow you to bet on the outcome of
                      real-world events. Buy YES if you think the event will
                      happen, or NO if you think it won't. Prices reflect the
                      market's estimate of the probability of the event
                      occurring. When the market resolves, correct predictions
                      are rewarded with payouts.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
