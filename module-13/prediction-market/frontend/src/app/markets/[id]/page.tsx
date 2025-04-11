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
import { formatTimeRemaining } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = params.id as string;

  const [market, setMarket] = useState<PolymarketMarket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            question: apiMarket.question,
            slug: apiMarket.slug || undefined,
            description: apiMarket.description || "No description available.",
            category: apiMarket.category || "General",
            endDate: apiMarket.endDate,
            liquidityClob: apiMarket.liquidityClob,
            volumeClob: apiMarket.volumeClob,
            bestBid: apiMarket.bestBid,
            bestAsk: apiMarket.bestAsk,
            created_at: apiMarket.created_at || new Date().toISOString(),
            outcomes: apiMarket.outcomes,
            volume: apiMarket.volume,
          });
        } else {
          console.log(
            `Market ${marketId} not found via Gamma service. Using fallback demo data.`
          );
          // Define demo data matching the PolymarketMarket type structure
          const demoMarket: PolymarketMarket = {
            id: marketId,
            question: "Will Bitcoin exceed $100,000 by the end of 2024?",
            slug: "will-bitcoin-exceed-100000-by-end-of-2024",
            description: "...", // Add description
            outcomes: '["Yes", "No"]', // Example outcomes string
            created_at: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            endDate: "2024-12-31T23:59:59Z",
            volume: 135000, // Example volume
            category: "Crypto",
            bestAsk: 0.65,
            bestBid: 0.35,
            liquidityClob: 135000, // Example liquidity
            // Add other required fields from PolymarketMarket if needed
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
                <h1 className="text-2xl font-bold">{market.question}</h1>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>
                      {market.endDate
                        ? formatTimeRemaining(market.endDate)
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="mr-1 h-4 w-4" />
                    <span>
                      Liquidity: $
                      {market.liquidityClob?.toLocaleString() ?? "0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Tab Content */}
              <div className="space-y-6 mt-6">
                {/* Add Polymarket Link Button */}
                {market.slug && (
                  <a
                    href={`https://polymarket.com/market/${market.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button variant="outline" className="w-full">
                      View / Bet on Polymarket
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                )}

                <div className="space-y-4">
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
                        {/* Ensure endDate exists before formatting */}
                        {market.endDate ? formatDate(market.endDate) : "N/A"}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/10">
                      <div className="text-sm text-muted-foreground">
                        Created
                      </div>
                      <div className="font-medium">
                        {/* Ensure created_at exists before formatting */}
                        {market.created_at
                          ? formatDate(market.created_at)
                          : "N/A"}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/10">
                      <div className="text-sm text-muted-foreground">
                        Creator
                      </div>
                      <div className="font-medium">N/A (via Gamma API)</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/10">
                      <div className="text-sm text-muted-foreground">
                        Status
                      </div>
                      <div className="font-medium">N/A</div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
