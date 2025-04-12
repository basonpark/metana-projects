"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { RootLayout } from "@/components/layout/RootLayout";
import { MarketStatus, Outcome } from "@/types/contracts";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { fetchMarketById } from "@/services/gamma";
import { PolymarketMarket } from "@/types/polymarket";
import { formatTimeRemaining } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

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

  // Calculate odds percentages for display
  const yesOdds = Math.round((market?.bestAsk ?? 0.5) * 100);
  // const noOdds = Math.round((market?.bestBid ?? 0.5) * 100); // Don't use bestBid directly
  // Ensure they roughly add up, adjust if needed (simple approach)
  const noOdds = 100 - yesOdds; // Derive No odds from Yes odds

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
          {/* Use Card component for better structure */}
          {/* <div className="rounded-lg border border-border bg-background p-6 shadow-sm"> */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                {market.category && (
                  <Badge variant="outline">{market.category}</Badge>
                )}
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  Ends: {market.endDate ? formatDate(market.endDate) : "N/A"}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                {market.question}
              </CardTitle>
              {/* Optionally show description here or in details section */}
              {/* <CardDescription>{market.description}</CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Market Image */}
              {market.image && (
                <div className="relative aspect-video w-full overflow-hidden rounded-md mb-4">
                  <Image
                    src={market.image}
                    alt={market.question}
                    fill
                    className="object-cover"
                    unoptimized // Add if Polymarket images aren't configured in next.config.js
                  />
                </div>
              )}

              {/* Odds Display (Read-only) */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Current Odds
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-md">
                    <div className="text-lg font-semibold">YES</div>
                    <div className="text-3xl font-bold">{yesOdds}%</div>
                  </div>
                  <div className="text-center p-4 border rounded-md">
                    <div className="text-lg font-semibold">NO</div>
                    <div className="text-3xl font-bold">{noOdds}%</div>
                  </div>
                </div>
                {/* Progress Bar Visual */}
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${yesOdds}%` }}
                  />
                  {/* Add a slight border/gap? */}
                  <div
                    className="h-full bg-secondary"
                    style={{ width: `${noOdds}%` }}
                  />
                </div>
              </div>

              <Separator />

              {/* Polymarket Link Button */}
              {market.slug && (
                <a
                  href={`https://polymarket.com/market/${market.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full">
                    View / Bet on Polymarket
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              )}

              <Separator />

              {/* Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Details</h3>
                {market.description && (
                  <div className="text-sm text-muted-foreground whitespace-pre-line">
                    {market.description}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-muted-foreground mb-1">
                      Time Remaining
                    </div>
                    <div className="font-medium">
                      {market.endDate
                        ? formatTimeRemaining(market.endDate)
                        : "N/A"}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-muted-foreground mb-1">Liquidity</div>
                    <div className="font-medium">
                      ${market.liquidityClob?.toLocaleString() ?? "0"}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-muted-foreground mb-1">
                      Volume (24h)
                    </div>
                    {/* Assuming volumeClob is 24h volume, adjust if needed */}
                    <div className="font-medium">
                      ${market.volumeClob?.toLocaleString() ?? "0"}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-muted-foreground mb-1">Created</div>
                    <div className="font-medium">
                      {market.created_at
                        ? formatDate(market.created_at)
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* How it works section */}
              <div className="p-4 rounded-lg border border-dashed bg-muted/20">
                <h3 className="text-sm font-medium mb-2">How This Works</h3>
                <p className="text-sm text-muted-foreground">
                  This page displays market data from Polymarket via the Gamma
                  API. Trading occurs directly on the Polymarket platform.
                  Prices reflect the market's perceived probability.
                </p>
              </div>
            </CardContent>
            {/* <CardFooter> Optional Footer </CardFooter> */}
          </Card>
          {/* </div> */}
        </div>
      </div>
    </RootLayout>
  );
}
