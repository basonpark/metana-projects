"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { RootLayout } from "@/components/layout/RootLayout";
import { useMarketContractSafe } from "@/hooks/useMarketContractSafe";
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
import gammaAPI from "@/services/gammaAPI";

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = params.id as string;

  const [market, setMarket] = useState<any>(null);
  const [betAmount, setBetAmount] = useState<string>("10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"trade" | "details">("trade");

  const {
    getMarket,
    placeBet,
    isLoading: contractLoading,
  } = useMarketContractSafe();

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setIsLoading(true);

        // Try to get market from our contract
        const contractMarket = await getMarket(marketId);

        if (contractMarket) {
          setMarket({
            id: contractMarket.address,
            title: contractMarket.question,
            description: `This market resolves based on the ${contractMarket.dataFeedId} data feed.`,
            category: contractMarket.category,
            status: contractMarket.status,
            outcome: contractMarket.outcome,
            endDate: new Date(
              Number(contractMarket.expirationTime) * 1000
            ).toISOString(),
            timeRemaining: contractMarket.timeRemaining,
            yesPrice: contractMarket.yesPrice,
            noPrice: contractMarket.noPrice,
            liquidity: contractMarket.liquidity,
            creationTime: Number(contractMarket.creationTime) * 1000,
            creator: contractMarket.creator,
            fee: contractMarket.fee / 100, // Convert basis points to percentage
            userPosition: contractMarket.userPosition,
          });
        } else {
          // Fallback to demo data if not found in contracts
          // This would typically be from Gamma API in a real app
          const demoMarket = {
            id: marketId,
            title: "Will Bitcoin exceed $100,000 by the end of 2024?",
            description:
              "This market resolves to YES if the price of Bitcoin (BTC) exceeds $100,000 USD at any point before December 31, 2024, 11:59 PM UTC according to the Coinbase Pro BTC/USD market.",
            category: "Crypto",
            status: MarketStatus.Open,
            outcome: Outcome.NoOutcome,
            endDate: "2024-12-31T23:59:59Z",
            timeRemaining: "8 months remaining",
            yesPrice: 0.65,
            noPrice: 0.35,
            liquidity: "135000",
            creationTime: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
            creator: "0x7a...3f9",
            fee: 1.0, // 1% fee
            userPosition: null,
          };

          setMarket(demoMarket);
        }
      } catch (error) {
        console.error("Error loading market:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMarketData();
  }, [marketId, getMarket]);

  const handlePlaceBet = async (outcome: Outcome) => {
    if (!market || isSubmitting || parseFloat(betAmount) <= 0) return;

    try {
      setIsSubmitting(true);
      await placeBet(market.id, outcome, betAmount);
      // After successful bet, reload market data
      const updatedMarket = await getMarket(marketId);
      if (updatedMarket) {
        setMarket({
          ...market,
          yesPrice: updatedMarket.yesPrice,
          noPrice: updatedMarket.noPrice,
          liquidity: updatedMarket.liquidity,
          userPosition: updatedMarket.userPosition,
        });
      }
    } catch (error) {
      console.error("Error placing bet:", error);
    } finally {
      setIsSubmitting(false);
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

                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${market.yesPrice * 100}%` }}
                          />
                        </div>

                        <button
                          className="w-full py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
                          onClick={() => handlePlaceBet(Outcome.Yes)}
                          disabled={
                            isSubmitting || market.status !== MarketStatus.Open
                          }
                        >
                          Buy YES
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

                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${market.noPrice * 100}%` }}
                          />
                        </div>

                        <button
                          className="w-full py-2 rounded-md border border-border bg-background font-medium hover:bg-muted transition-colors flex items-center justify-center"
                          onClick={() => handlePlaceBet(Outcome.No)}
                          disabled={
                            isSubmitting || market.status !== MarketStatus.Open
                          }
                        >
                          Buy NO
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
                    <div className="text-muted-foreground whitespace-pre-line">
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
