"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { RootLayout } from "@/components/layout/RootLayout";
import { PolymarketAPIMarket, MarketStatus } from "@/types/market"; 
import { fetchPolymarketMarketById } from "@/services/gamma"; 
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
  CalendarDays,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatTimeRemaining } from "@/lib/utils"; 

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = params.id as string;

  const [marketData, setMarketData] = useState<PolymarketAPIMarket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketId) {
      setError("Market ID is missing from the URL.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setMarketData(null); 
      try {
        const data = await fetchPolymarketMarketById(marketId);
        if (data) {
          setMarketData(data);
        } else {
          setError(`Market with ID "${marketId}" not found or failed to load.`);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while fetching market data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [marketId]); 

  if (isLoading) {
    return (
      <RootLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Loading Market Details...
            </span>
          </div>
        </div>
      </RootLayout>
    );
  }

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

  let displayStatus: MarketStatus;
  if (marketData.state === 'open') {
    displayStatus = MarketStatus.Open;
  } else { 
    displayStatus = MarketStatus.Locked;
  }

  const polymarketUrl = `https://polymarket.com/event/${marketData.id}`; 

  const yesProbability = marketData?.bestAsk ?? 0.5; 
  const noProbability = 1 - yesProbability;
  const yesPercent = (yesProbability * 100).toFixed(0);
  const noPercent = (noProbability * 100).toFixed(0);

  const formatDate = (timestampSeconds: number | undefined): string => {
    if (timestampSeconds === undefined || timestampSeconds === null)
      return "N/A";
    try {
      return new Date(timestampSeconds * 1000).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status: MarketStatus | undefined) => {
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
      case MarketStatus.Locked: 
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-300 text-xs px-2 py-0.5"
          >
            Ended / Resolving
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            Unknown Status
          </Badge>
        );
    }
  };

  return (
    <RootLayout>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 group"
        >
          <ArrowLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to All Markets
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-0">
                {marketData.image ? (
                  <div className="relative h-52 sm:h-64 w-full">
                    <Image
                      src={marketData.image}
                      alt={marketData.question}
                      fill
                      className="object-cover" 
                      unoptimized 
                      priority 
                    />
                  </div>
                ) : (
                  <div className="h-52 sm:h-64 w-full bg-muted flex items-center justify-center text-muted-foreground rounded-lg">
                    No Image Available
                  </div>
                )}
              </CardContent>
            </Card>

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

            <Card className="shadow-sm">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-base font-medium">
                  Market Stats
                </CardTitle> 
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    Status
                  </span>
                  {getStatusBadge(displayStatus)} 
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    Market End
                  </span>
                  <span className="font-medium">
                    {marketData.expirationTime
                      ? formatTimeRemaining(marketData.expirationTime)
                      : "Unknown"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center">
                    <DollarSign className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    Liquidity
                  </span>
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

          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl sm:text-2xl font-semibold leading-tight">
                  {marketData.question}
                </CardTitle> 
              </CardHeader>
              <CardContent>
                {marketData.description && (
                  <>
                    <Separator className="mb-4" />
                    <h3 className="text-base font-medium mb-2">
                      Market Description
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {marketData.description}
                    </p>
                  </>
                )}

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
                  </div>
                </div>

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
