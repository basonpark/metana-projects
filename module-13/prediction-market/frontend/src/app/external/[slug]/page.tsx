"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { RootLayout } from "@/components/layout/RootLayout";
import {
  MarketStatus,
  Outcome,
  MarketWithMetadata, // Keep this for contract data type
} from "@/types/contracts";
import { PolymarketAPIMarket } from "@/types/market"; // Add correct type for API data
import {
  ArrowLeft,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  ExternalLink,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { fetchMarketById } from "@/services/gamma";
// Removed the incorrect PolymarketMarket import
import {
  formatTimeRemaining,
  formatEtherShort,
  formatBalance,
  formatFee,
} from "@/lib/utils";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TradeInterface } from "@/components/TradeInterface";

// --- Wagmi and Ethers Imports ---
import { useAccount, useContractRead } from "wagmi";
import { ethers } from "ethers";
import PredictionMarketABI from "@/abi/PredictionMarket.json";

// Define types for contract data for clarity
interface AmmReserves {
  ammYesShares: bigint;
  ammNoShares: bigint;
}

export default function MarketDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const marketId = params.id as string;
  const marketType = searchParams.get("type") || "polymarket";

  // --- API State (Used primarily for Polymarket type, supplementary for Prophit) ---
  const [polymarketData, setPolymarketData] =
    useState<PolymarketAPIMarket | null>(null); // State specifically for Polymarket API data
  const [isApiLoading, setIsApiLoading] = useState(true);

  // --- Wallet State ---
  const { address: userAddress, isConnected } = useAccount();

  // --- Contract Reads (Only run logic if marketType is 'prophit') ---
  const contractConfig = {
    address: marketId as `0x${string}`,
    abi: PredictionMarketABI.abi,
  };

  const isProphitMarket = marketType === "prophit";

  const { data: contractQuestion, isLoading: isLoadingQuestion } =
    useContractRead({ ...contractConfig, functionName: "question" });
  const { data: isResolved, isLoading: isLoadingResolved } = useContractRead({
    ...contractConfig,
    functionName: "resolved",
  });
  const { data: ammReserves, isLoading: isLoadingReserves } = useContractRead({
    ...contractConfig,
    functionName: "getAmmReserves",
  });
  const { data: resolutionTime, isLoading: isLoadingResolutionTime } =
    useContractRead({ ...contractConfig, functionName: "RESOLUTION_TIME" });
  const { data: platformFeeBps, isLoading: isLoadingPlatformFee } =
    useContractRead({ ...contractConfig, functionName: "platformFeeBps" });
  const { data: creatorFeeBps, isLoading: isLoadingCreatorFee } =
    useContractRead({ ...contractConfig, functionName: "creatorFeeBps" });

  const { data: winningOutcome, isLoading: isLoadingWinningOutcome } =
    useContractRead({
      ...contractConfig,
      functionName: "winningOutcome",
    });

  const { data: userYesBalance, isLoading: isLoadingYesBalance } =
    useContractRead({
      ...contractConfig,
      functionName: "balanceOf",
      args: [userAddress, Outcome.Yes],
    });

  const { data: userNoBalance, isLoading: isLoadingNoBalance } =
    useContractRead({
      ...contractConfig,
      functionName: "balanceOf",
      args: [userAddress, Outcome.No],
    });

  // --- API Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setPolymarketData(null); // Reset previous API market data
      setIsApiLoading(true); // Set loading for API fetch

      // Always try to fetch from Gamma API for context, even for Prophit markets
      if (!marketId) return;
      try {
        const apiMarket = await fetchMarketById(marketId);
        if (apiMarket) {
          setPolymarketData(apiMarket); // Set API data state
        } else {
          console.warn(
            `Market data for ${marketId} not found via Gamma service.`
          );
          // Handle case where API data is crucial for Polymarket type but not found?
          if (marketType === "polymarket") {
            // Maybe set an error state?
          }
        }
      } catch (error) {
        console.error("Error loading market data from API:", error);
        if (marketType === "polymarket") {
          // Maybe set an error state?
        }
      } finally {
        setIsApiLoading(false);
      }
    };
    fetchData();
  }, [marketId, marketType]); // Depend on marketType as well

  // --- Price Calculation (Only for Prophit) ---
  const { priceYes, priceNo } = useMemo(() => {
    if (!isProphitMarket) return { priceYes: 0.5, priceNo: 0.5 }; // Default for non-prophit

    const reserves = ammReserves as AmmReserves | undefined;
    if (!reserves || reserves.ammYesShares + reserves.ammNoShares === 0n) {
      return { priceYes: 0.5, priceNo: 0.5 };
    }
    const totalReserves = reserves.ammYesShares + reserves.ammNoShares;
    const priceYesNum =
      Number((reserves.ammNoShares * 10000n) / totalReserves) / 10000;
    const priceNoNum =
      Number((reserves.ammYesShares * 10000n) / totalReserves) / 10000;
    return { priceYes: priceYesNum, priceNo: priceNoNum };
  }, [isProphitMarket, ammReserves]);

  // --- Formatting Helpers ---
  const formatDate = (timestamp: bigint | string | undefined) => {
    if (timestamp === undefined) return "N/A";
    let date: Date;
    if (typeof timestamp === "string") {
      date = new Date(timestamp); // Handle ISO string from API
    } else {
      // Assume bigint from contract
      date = new Date(Number(timestamp) * 1000);
    }
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatTimeRemainingAny = (
    timestampOrString: bigint | string | undefined
  ) => {
    if (timestampOrString === undefined) return "N/A";
    let endDate: string;
    if (typeof timestampOrString === "string") {
      endDate = timestampOrString;
    } else {
      endDate = new Date(Number(timestampOrString) * 1000).toISOString();
    }
    return formatTimeRemaining(endDate);
  };

  // --- Loading and Error States ---
  const isLoadingCoreContractData =
    isProphitMarket &&
    (isLoadingQuestion ||
      isLoadingResolved ||
      isLoadingReserves ||
      isLoadingResolutionTime ||
      isLoadingPlatformFee ||
      isLoadingCreatorFee);

  const isUserDataLoading =
    isProphitMarket &&
    isConnected &&
    (isLoadingYesBalance || isLoadingNoBalance);

  // Adjust page loading: Wait for API always, wait for contract only if Prophit
  const isPageLoading =
    isApiLoading || (isProphitMarket && isLoadingCoreContractData);

  // Display Data (prioritize contract data for Prophit, API for Polymarket)
  const displayQuestion = isProphitMarket
    ? (contractQuestion as string | undefined) ?? "Loading question..."
    : polymarketData?.question ?? "Loading question...";
  const displayEndDate = isProphitMarket
    ? formatDate(resolutionTime as bigint | undefined)
    : polymarketData?.expirationTime
    ? formatDate(BigInt(polymarketData.expirationTime * 1000)) // Correct conversion
    : "N/A";
  const displayCategory = isProphitMarket
    ? (contractQuestion as string | undefined) ?? "General" // Use contract data for Prophit category
    : polymarketData?.category ?? "General";
  const displayDescription = isProphitMarket
    ? "Trading occurs on the Prophit protocol via smart contracts."
    : polymarketData?.description || "No description available.";
  const displayImage = isProphitMarket ? undefined : polymarketData?.image;

  // Odds/Prices - different sources
  const displayYesOdds = isProphitMarket
    ? Math.round(priceYes * 100)
    : Math.round((polymarketData?.bestAsk ?? 0.5) * 100);
  const displayNoOdds = isProphitMarket
    ? Math.round(priceNo * 100)
    : 100 - Math.round((polymarketData?.bestAsk ?? 0.5) * 100);

  // Get required props for TradeInterface, ensuring they are defined when needed
  const typedAmmReserves = ammReserves as [bigint, bigint] | undefined;
  const tradeInterfaceProps = {
    marketId: marketId as `0x${string}`,
    ammYesShares: isProphitMarket ? typedAmmReserves?.[0] : undefined,
    ammNoShares: isProphitMarket ? typedAmmReserves?.[1] : undefined,
    userYesShares: isProphitMarket
      ? (userYesBalance as bigint | undefined)
      : undefined,
    userNoShares: isProphitMarket
      ? (userNoBalance as bigint | undefined)
      : undefined,
    isResolved: isProphitMarket
      ? (isResolved as boolean | undefined)
      : undefined,
    winningOutcome: isProphitMarket
      ? (Number(winningOutcome) as Outcome | undefined)
      : undefined,
    platformFeeBps: isProphitMarket
      ? (platformFeeBps as bigint | undefined)
      : undefined,
    creatorFeeBps: isProphitMarket
      ? (creatorFeeBps as bigint | undefined)
      : undefined,
    isLoadingContractData: isLoadingCoreContractData,
  };

  // --- Render Logic ---

  // Initial loading skeleton
  if (
    isPageLoading &&
    !(isProphitMarket ? contractQuestion : polymarketData?.question)
  ) {
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

  // Market not found (mainly applies if API fails for Polymarket type)
  if (!polymarketData && marketType === "polymarket") {
    return (
      <RootLayout>
        <div className="container mx-auto py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Market Not Found</h1>
            <p className="text-muted-foreground mb-6">
              Could not load market data from the API.
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

        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                {displayCategory && (
                  <Badge variant="outline">{displayCategory}</Badge>
                )}
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  Ends: {displayEndDate}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                {displayQuestion}
              </CardTitle>
              <CardDescription className="pt-2">
                {displayDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {displayImage && (
                <div className="relative aspect-video w-full overflow-hidden rounded-md mb-4">
                  <Image
                    src={displayImage}
                    alt={displayQuestion}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              {/* Market Status (Only shown for Prophit markets) */}
              {isProphitMarket && (
                <>
                  {isLoadingResolved ? (
                    <Alert variant="default" className="bg-muted/50">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AlertTitle>Loading Status</AlertTitle>
                      <AlertDescription>
                        Checking market resolution status...
                      </AlertDescription>
                    </Alert>
                  ) : isResolved ? (
                    <Alert
                      variant={
                        Number(winningOutcome) === Outcome.Yes
                          ? "default"
                          : Number(winningOutcome) === Outcome.No
                          ? "destructive"
                          : "default"
                      }
                      className="border-2"
                    >
                      {Number(winningOutcome) === Outcome.Yes ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>Market Resolved</AlertTitle>
                      <AlertDescription>
                        The winning outcome is:{" "}
                        <strong className="font-semibold">
                          {Number(winningOutcome) === Outcome.Yes
                            ? "YES"
                            : "NO"}
                        </strong>
                        . You can redeem winnings below if you hold the winning
                        shares.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="default" className="bg-muted/50">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Market Open</AlertTitle>
                      <AlertDescription>
                        This market is currently active for trading.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              {/* Odds/Price Display */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {isProphitMarket
                    ? "Current Price (from AMM)"
                    : "Current Odds"}
                  {isProphitMarket && isLoadingReserves && (
                    <Loader2 className="inline h-3 w-3 ml-2 animate-spin" />
                  )}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`text-center p-4 border rounded-md ${
                      isProphitMarket
                        ? "bg-green-500/10 border-green-500/30"
                        : ""
                    }`}
                  >
                    <div
                      className={`text-lg font-semibold ${
                        isProphitMarket ? "text-green-700" : ""
                      }`}
                    >
                      YES
                    </div>
                    <div
                      className={`text-3xl font-bold ${
                        isProphitMarket ? "text-green-600" : ""
                      }`}
                    >
                      {isProphitMarket && isLoadingReserves ? (
                        <Loader2 className="h-7 w-7 mx-auto animate-spin" />
                      ) : (
                        `${displayYesOdds}%`
                      )}
                    </div>
                  </div>
                  <div
                    className={`text-center p-4 border rounded-md ${
                      isProphitMarket ? "bg-red-500/10 border-red-500/30" : ""
                    }`}
                  >
                    <div
                      className={`text-lg font-semibold ${
                        isProphitMarket ? "text-red-700" : ""
                      }`}
                    >
                      NO
                    </div>
                    <div
                      className={`text-3xl font-bold ${
                        isProphitMarket ? "text-red-600" : ""
                      }`}
                    >
                      {isProphitMarket && isLoadingReserves ? (
                        <Loader2 className="h-7 w-7 mx-auto animate-spin" />
                      ) : (
                        `${displayNoOdds}%`
                      )}
                    </div>
                  </div>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                  <div
                    className={`h-full ${
                      isProphitMarket ? "bg-green-500" : "bg-primary"
                    } transition-all duration-300 ease-in-out`}
                    style={{ width: `${displayYesOdds}%` }}
                  />
                  <div
                    className={`h-full ${
                      isProphitMarket ? "bg-red-500" : "bg-secondary"
                    } transition-all duration-300 ease-in-out`}
                    style={{ width: `${displayNoOdds}%` }}
                  />
                </div>
              </div>

              {/* Separator and User Holdings + Trade Interface (Only for Prophit) */}
              {isProphitMarket && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                      <Wallet className="h-4 w-4 mr-2" /> Your Share Balances
                      {isUserDataLoading && (
                        <Loader2 className="inline h-3 w-3 ml-2 animate-spin" />
                      )}
                    </h3>
                    {isConnected ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <div className="text-muted-foreground mb-1">
                            YES Shares
                          </div>
                          <div className="font-mono text-lg font-medium">
                            {isUserDataLoading ? (
                              <Loader2 className="h-5 w-5 mx-auto animate-spin" />
                            ) : (
                              formatBalance(
                                userYesBalance as bigint | undefined
                              )
                            )}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <div className="text-muted-foreground mb-1">
                            NO Shares
                          </div>
                          <div className="font-mono text-lg font-medium">
                            {isUserDataLoading ? (
                              <Loader2 className="h-5 w-5 mx-auto animate-spin" />
                            ) : (
                              formatBalance(userNoBalance as bigint | undefined)
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Connect your wallet to see your share balances.
                      </p>
                    )}
                  </div>
                  <Separator />
                  {/* --- Render TradeInterface --- */}
                  <TradeInterface {...tradeInterfaceProps} />
                  <Separator />
                </>
              )}

              {/* Polymarket Link Button (Shown for Polymarket type, or if slug exists for Prophit) */}
              {polymarketData?.slug && (
                <a
                  href={`https://polymarket.com/market/${polymarketData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full">
                    {marketType === "polymarket"
                      ? "Trade on Polymarket"
                      : "View on Polymarket (External)"}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              )}

              {/* Details Section - Display varies */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {/* Time Remaining */}
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-muted-foreground mb-1">
                      Time Remaining
                    </div>
                    <div className="font-medium">
                      {isLoadingResolutionTime && isProphitMarket ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        formatTimeRemainingAny(
                          isProphitMarket
                            ? (resolutionTime as bigint | undefined)
                            : polymarketData?.expirationTime
                            ? BigInt(polymarketData.expirationTime)
                            : undefined
                        )
                      )}
                    </div>
                  </div>

                  {/* Fees (Prophit) vs Liquidity/Volume (Polymarket) */}
                  {isProphitMarket ? (
                    <>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-muted-foreground mb-1">
                          Platform Fee
                        </div>
                        <div className="font-medium">
                          {isLoadingPlatformFee ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            formatFee(platformFeeBps as bigint | undefined)
                          )}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-muted-foreground mb-1">
                          Creator Fee
                        </div>
                        <div className="font-medium">
                          {isLoadingCreatorFee ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            formatFee(creatorFeeBps as bigint | undefined)
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-muted-foreground mb-1">
                          Liquidity
                        </div>
                        <div className="font-medium">
                          $
                          {polymarketData?.liquidityClob?.toLocaleString() ??
                            "0"}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-muted-foreground mb-1">
                          Volume (24h)
                        </div>
                        <div className="font-medium">
                          ${polymarketData?.volumeClob?.toLocaleString() ?? "0"}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Created Date (from API if available) */}
                  {polymarketData?.creationTime && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-muted-foreground mb-1">
                        Created (approx)
                      </div>
                      <div className="font-medium">
                        {new Date(
                          polymarketData.creationTime * 1000
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* How it works section - Content varies */}
              <div className="p-4 rounded-lg border border-dashed bg-muted/20">
                <h3 className="text-sm font-medium mb-2">How This Works</h3>
                {isProphitMarket ? (
                  <p className="text-sm text-muted-foreground">
                    This market operates directly on the blockchain via our
                    Prophit protocol. Prices are determined by the smart
                    contract's AMM. Connect your wallet to trade YES/NO shares
                    or redeem winnings after resolution.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This page displays market data from Polymarket via the Gamma
                    API. Trading occurs directly on the Polymarket platform.
                    Prices reflect the market's perceived probability.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RootLayout>
  );
}
