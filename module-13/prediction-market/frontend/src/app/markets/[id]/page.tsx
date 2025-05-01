"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { RootLayout } from "@/components/layout/RootLayout";
import { PolymarketAPIMarket, MarketStatus } from "@/types/market"; // Use types for API data
import { fetchPolymarketMarketById } from "@/services/gamma"; // Fetch by ID function
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  TrendingUp,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatTimeRemaining } from "@/lib/utils"; // Ensure this utility handles undefined correctly

export default function MarketDetailPage() {
  console.log("MarketDetailPage: Component mounted.");
  const params = useParams();
  console.log("MarketDetailPage: Raw params:", params);
  // Ensure param name matches the directory name '[id]'
  const marketId = params.id as string;
  console.log(`MarketDetailPage: Extracted marketId: ${marketId}`);

  const [marketData, setMarketData] = useState<PolymarketAPIMarket | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`MarketDetailPage: useEffect triggered for marketId: ${marketId}`);
    // Ensure marketId is available before fetching
    if (!marketId) {
      console.error("MarketDetailPage: Market ID is missing from the URL in useEffect.");
      setError("Market ID is missing from the URL.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      console.log(`MarketDetailPage: Starting fetch for ID: ${marketId}`);
      setIsLoading(true);
      setError(null);
      setMarketData(null); // Reset previous data
      try {
        const data = await fetchPolymarketMarketById(marketId);
        if (data) {
          setMarketData(data);
          console.log(`MarketDetailPage: Successfully fetched data for ${marketId}:`, data);
        } else {
          console.warn(`MarketDetailPage: fetchPolymarketMarketById returned null/undefined for ID: ${marketId}`);
          setError(`Market with ID "${marketId}" not found or failed to load.`);
        }
      } catch (err: any) {
        console.error(
          `MarketDetailPage: Error fetching market data for ID ${marketId}:`,
          err
        );
        setError(
          err.message ||
            "An unexpected error occurred while fetching market data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    console.log(`MarketDetailPage: Calling fetchData for ID: ${marketId}`);
    fetchData();
  }, [marketId]); // Dependency array includes marketId

  console.log("MarketDetailPage: Rendering component state:", { isLoading, error, marketData });

  // --- Helper: Format Date ---
  const formatDate = (timestampSeconds: number | undefined): string => {
    if (timestampSeconds === undefined || timestampSeconds === null)
      return "N/A";
    try {
      // Multiply by 1000 because JS Date expects milliseconds
      return new Date(timestampSeconds * 1000).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // --- Helper: Get Status Badge ---
  const getStatusBadge = (status: MarketStatus | undefined) => {
    // Default to Locked if API doesn't provide status or mapping is unclear
    const currentStatus = status ?? MarketStatus.Locked;
    switch (currentStatus) {
      case MarketStatus.Open:
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 border-green-300 text-xs px-2 py-0.5"
          >
            Open
          </Badge>
        );
      case MarketStatus.Locked: // Represents ended/resolved for Polymarket view
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-300 text-xs px-2 py-0.5"
          >
            Ended / Resolving
          </Badge>
        );
      // Add cases for Settled, Cancelled if needed based on API data mapping
      default:
        return (
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            Unknown Status
          </Badge>
        );
    }
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <RootLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            {" "}
            {/* Centering loader */}
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Loading Market Details...
            </span>
          </div>
        </div>
      </RootLayout>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <RootLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Markets
          </Link>
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Market</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </RootLayout>
    );
  }

  // --- No Data State ---
  if (!marketData) {
    return (
      <RootLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Markets
          </Link>
          <p className="text-center text-muted-foreground mt-10">
            Market data could not be loaded or the market was not found.
          </p>
        </div>
      </RootLayout>
    );
  }

  // --- Main Content Display ---
  const polymarketUrl = `https://polymarket.com/event/${marketData.id}`; // Construct Polymarket URL

  // Calculate probabilities
  const yesProbability = marketData?.bestAsk ?? 0.5; // Default to 0.5 if undefined
  const noProbability = 1 - yesProbability;
  const yesPercent = (yesProbability * 100).toFixed(0);
  const noPercent = (noProbability * 100).toFixed(0);

  return (
    <RootLayout>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        {" "}
        {/* Slightly wider container */}
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 group"
        >
          <ArrowLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to All Markets
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Image & Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image Card */}
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-0">
                {marketData.image ? (
                  <div className="relative h-52 sm:h-64 w-full">
                    {" "}
                    {/* Adjusted height */}
                    <Image
                      src={marketData.image}
                      alt={marketData.question}
                      fill
                      className="object-cover" // Image covers the area
                      unoptimized // Assume external images
                      priority // Prioritize loading image
                    />
                  </div>
                ) : (
                  <div className="h-52 sm:h-64 w-full bg-muted flex items-center justify-center text-muted-foreground rounded-lg">
                    {" "}
                    {/* Add rounding */}
                    No Image Available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Polymarket Link Button */}
            <Button variant="outline" className="w-full" asChild>
              <Link
                href={polymarketUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View this market directly on Polymarket"
              >
                View on Polymarket
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            {/* Quick Stats Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-base font-medium">
                  Market Stats
                </CardTitle>{" "}
                {/* Adjusted title size */}
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    Status
                  </span>
                  {getStatusBadge(marketData.status)}
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    Ends
                  </span>
                  {/* Use helper, ensure it handles undefined */}
                  <span className="font-medium">
                    {formatTimeRemaining(marketData.expirationTime)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center">
                    <DollarSign className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    Liquidity
                  </span>
                  {/* Format large numbers nicely */}
                  <span className="font-medium">
                    $
                    {marketData.liquidity?.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    }) ?? "0"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    Volume (24h)
                  </span>
                  <span className="font-medium">
                    $
                    {marketData.volume?.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    }) ?? "0"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Category</span>
                  <Badge
                    variant="outline"
                    className="capitalize text-xs px-2 py-0.5"
                  >
                    {marketData.category ?? "N/A"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {formatDate(marketData.creationTime)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Details & Placeholders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Market Details Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl sm:text-2xl font-semibold leading-tight">
                  {marketData.question}
                </CardTitle>
                {/* Optional: Display current price indication if available and relevant */}
                {/* <p className="text-lg text-primary font-medium mt-2">Current Price: {marketData.yesPrice ? `${(marketData.yesPrice * 100).toFixed(0)}¢` : 'N/A'}</p> */}
              </CardHeader>
              <CardContent>
                {/* Description */}
                {marketData.description && (
                  <>
                    <Separator className="mb-4" />
                    <h3 className="text-base font-medium mb-2">
                      Market Description
                    </h3>
                    {/* Use whitespace-pre-wrap to respect formatting */}
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {marketData.description}
                    </p>
                  </>
                )}

                {/* Probability Display (Market Card Style) */}
                <Separator className="my-6" />
                <div className="space-y-1.5">
                  <div className="flex items-center text-sm font-medium text-muted-foreground">
                    <TrendingUp className="mr-1.5 h-4 w-4" />
                    <span>Current Odds</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-semibold text-foreground">
                    <span>Yes: {yesPercent}%</span>
                    <span>No: {noPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gray-800 dark:bg-gray-200"
                      style={{ width: `${yesPercent}%` }}
                    />
                    {/* The remaining width will implicitly be the 'No' probability */}
                  </div>
                </div>

                {/* Placeholder for Trade Interface - Directing to Polymarket */}
                <Separator className="my-6" />
                <div className="p-4 rounded-lg border border-dashed bg-muted/30 text-center text-muted-foreground">
                  Trading for this market takes place on Polymarket.
                  <Button
                    variant="link"
                    className="p-0 h-auto ml-1 text-sm"
                    asChild
                  >
                    <Link
                      href={polymarketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Trade Now
                      <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* About Market Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-base font-medium">
                  About This Market
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This page displays information for a market listed on
                  Polymarket, accessed via their public API. All betting, odds
                  calculation, and resolution occur directly on the Polymarket
                  platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
