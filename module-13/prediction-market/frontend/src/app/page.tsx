"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { RootLayout } from "@/components/layout/RootLayout";
import { PredictionMarketCard } from "@/components/ui/prediction-market-card";
import Link from "next/link";
import { PolymarketAPIMarket, DisplayMarket, MarketStatus } from "@/types/market"; // Import DisplayMarket and MarketStatus
import { fetchActivePolymarketMarkets } from "@/services/gamma";
import { ProphitHero } from "@/components/ProphitHero";
import { categorizeMarket, formatTimeRemaining } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketContractSafe } from "@/hooks/useMarketContractSafe";
import { MarketInfo } from "@/types/contracts"; // Import MarketInfo
import { useDebounce } from "../hooks/useDebounce"; // Corrected import path

const ITEMS_PER_PAGE = 30;
const getPaginationNumbers = (
  currentPage: number,
  totalPages: number,
  siblings = 1
): (number | "...")[] => {
  const totalNumbers = siblings * 2 + 3;
  const totalBlocks = totalNumbers + 2;

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblings, 1);
  const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblings;
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "...", lastPageIndex];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblings;
    let rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + 1 + i
    );
    return [firstPageIndex, "...", ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
};

export default function HomePage() {
  const [allMarkets, setAllMarkets] = useState<DisplayMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSource, setSelectedSource] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<string>("timeRemaining");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use the contract hook
  const {
    getMarkets: getProphitMarketAddresses,
    getMarketDetails,
    isReady: contractIsReady,
  } = useMarketContractSafe();

  // Store markets by source
  const [externalMarkets, setExternalMarkets] = useState<DisplayMarket[]>([]);
  const [prophitMarkets, setProphitMarkets] = useState<DisplayMarket[]>([]);

  const loadMarketData = useCallback(async () => {
    console.log("Homepage: Fetching market data...");
    setIsLoading(true);
    setError(null);
    try {
      const currentTimeSeconds = Math.floor(Date.now() / 1000);

      // Fetch and process Polymarket data
      const rawExternalMarkets = await fetchActivePolymarketMarkets();
      const activeExternalMarkets = (rawExternalMarkets || [])
        .map((market: PolymarketAPIMarket) => {
          // Prioritize endDate string, fallback to expirationTime
          const dateSource = market.endDate ?? market.expirationTime;
          let expirationTimestampSeconds: number | undefined = undefined;

          // Parse the date source into a numeric timestamp (seconds)
          if (typeof dateSource === 'string') {
            const parsedDate = new Date(dateSource);
            if (!isNaN(parsedDate.getTime())) {
              expirationTimestampSeconds = Math.floor(parsedDate.getTime() / 1000);
            }
          } else if (typeof dateSource === 'number') {
            expirationTimestampSeconds = dateSource;
          }

          // Prepare input for categorization
          const categoryInput = {
            question: market.question,
            category: market.category ?? "",
          };
          // Calculate prices (ensure yesPrice exists for noPrice calculation)
          const yesPrice = market.bestAsk; // Use bestAsk as primary 'yes' price
          const noPrice = yesPrice !== undefined ? 1 - yesPrice : undefined;

          // Status calculation using the *parsed* numeric timestamp
          const status = expirationTimestampSeconds !== undefined && expirationTimestampSeconds > currentTimeSeconds
                            ? MarketStatus.Open
                            : MarketStatus.Locked; // Default to Locked if parsing failed or date passed

          return {
            id: market.id,
            question: market.question,
            image: market.image,
            category: market.category,
            derivedCategory: categorizeMarket(categoryInput),
            expirationTime: expirationTimestampSeconds, // Store the PARSED numeric timestamp
            volume: market.volume,
            liquidity: market.liquidityClob, // Changed from market.liquidity
            yesPrice: yesPrice, // Use calculated yesPrice
            noPrice: noPrice, // Use calculated noPrice
            bestAsk: market.bestAsk,
            status: status, // Use calculated status
            source: "polymarket",
          } as DisplayMarket;
        })
        .filter((market) => {
          // Filter using the already parsed numeric expirationTime
          const isActive = market.expirationTime !== undefined && market.expirationTime > currentTimeSeconds;
          return isActive;
        });

      console.log(`[Debug] Active Polymarket markets count: ${activeExternalMarkets.length}`);

      // Fetch and process Prophit data
      console.log("Homepage: Fetching Prophit market data...");
      // Fetch addresses first (provide arguments)
      const internalMarketAddresses = await getProphitMarketAddresses(0, 100); // Added arguments
      let activeInternalMarkets: DisplayMarket[] = [];

      if (internalMarketAddresses && internalMarketAddresses.length > 0) {
        console.log(`Homepage: Found ${internalMarketAddresses.length} Prophit market addresses.`);
        // Fetch details for each address
        const prophitDetailsPromises = internalMarketAddresses.map(
          async (address) => {
            try {
              // Call getMarketDetails for EACH address
              const details: MarketInfo | null = await getMarketDetails(address);
              if (details) {
                const categoryInput = {
                  question: details.question,
                  category: details.category ?? "",
                };
                const expirationTimestampSeconds = Number(details.expirationTime);
                return {
                  id: address,
                  question: details.question,
                  image: details.image,
                  category: details.category,
                  derivedCategory: categorizeMarket(categoryInput),
                  expirationTime: expirationTimestampSeconds,
                  volume: 0, // Placeholder
                  liquidity: 0, // Placeholder
                  yesPrice: 0.5, // Placeholder
                  noPrice: 0.5, // Placeholder
                  bestAsk: 0.5, // Placeholder
                  status: details.status,
                  source: "prophit",
                } as DisplayMarket;
              }
            } catch (err) {
              console.error(`Error fetching details for Prophit market ${address}:`, err);
            }
            return null; // Return null if fetch fails or no details
          }
        );
        // Wait for all detail fetches and filter out nulls
        const resolvedProphitDetails = (await Promise.all(prophitDetailsPromises))
          .filter((market): market is DisplayMarket => market !== null);

        // Filter for active markets based on time and status
        activeInternalMarkets = resolvedProphitDetails.filter((market: DisplayMarket) => { // Ensure DisplayMarket type is correct
          const expirationNumber = Number(market.expirationTime);
          const isActiveTime = !isNaN(expirationNumber) && expirationNumber > currentTimeSeconds;
          // Access status property, assuming it exists on DisplayMarket
          return isActiveTime && market.status === MarketStatus.Open;
        });
      } else {
        console.log("Homepage: No Prophit market addresses found or contract functions unavailable.");
      }

      console.log(`[Debug] Active Prophit markets count: ${activeInternalMarkets.length}`);

      // Combine and set state
      const combinedMarkets = [...activeExternalMarkets, ...activeInternalMarkets];
      setAllMarkets(combinedMarkets);

    } catch (error: any) { // Type error as any
      console.error("Error loading market data:", error);
      setError(error.message || "Failed to load market data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      console.log("Homepage: Market data fetching finished.");
    }
  }, []);

  useEffect(() => {
    loadMarketData();
  }, []);

  useEffect(() => {
    const refreshInterval = parseInt(
      process.env.NEXT_PUBLIC_DATA_REFRESH_INTERVAL || "120000",
      10
    );
    const intervalId = setInterval(() => {
      console.log(`Homepage: Polling for fresh data...`);
      loadMarketData();
    }, refreshInterval);
    return () => clearInterval(intervalId);
  }, []);

  const filteredMarkets = useMemo(() => {
    // --- Debug Log at start of useMemo ---
    console.log('[Debug useMemo] Start - allMarkets:', allMarkets);
    // --- End Debug Log ---

    let markets = allMarkets;

    // Filter by search term
    if (debouncedSearchTerm) {
      markets = markets.filter((market) =>
        market.question
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      markets = markets.filter(
        (market) => (market.derivedCategory || market.category) === selectedCategory
      );
    }

    // Filter by source
    if (selectedSource !== "All") {
      // Match source case-insensitively for robustness
      markets = markets.filter((market) => market.source?.toLowerCase() === selectedSource.toLowerCase());
    }

    // --- Sort the filtered markets ---
    // Clone the array before sorting to avoid mutating the cached result directly
    const sortedMarkets = [...markets].sort((a, b) => {
      // Default to time remaining if sortOrder is invalid or 'traders'
      const sortCriteria = ['timeRemaining', 'liquidity'].includes(sortOrder) ? sortOrder : 'timeRemaining';

      if (sortCriteria === 'timeRemaining') {
        // Ending Soon: Sort by expirationTime ASCENDING
        // Treat undefined as furthest away (Infinity)
        const timeA = a.expirationTime ?? Infinity;
        const timeB = b.expirationTime ?? Infinity;
        return timeA - timeB;
      } else if (sortCriteria === 'liquidity') {
        // Liquidity: Sort by liquidity DESCENDING
        // Treat undefined/null as lowest liquidity (-Infinity)
        const liqA = a.liquidity ?? -Infinity;
        const liqB = b.liquidity ?? -Infinity;
        return liqB - liqA;
      }
      // No sorting applied for 'traders' as data is unavailable
      return 0;
    });

    // --- Debug Log at end of useMemo ---
    console.log('[Debug useMemo] End - final filtered/sorted markets:', sortedMarkets);
    // --- End Debug Log ---

    return sortedMarkets;
  }, [allMarkets, debouncedSearchTerm, selectedCategory, selectedSource, sortOrder]); // Add sortOrder dependency

  // Calculate total pages based on filtered markets
  const totalPages = Math.ceil(filteredMarkets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMarkets = filteredMarkets.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSource, debouncedSearchTerm, sortOrder]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <RootLayout>
      <ProphitHero />
      <div className="bg-gradient-to-b from-white to-slate-800">
        <div
          className="container mx-auto px-4 py-12 md:py-16"
          id="market-browser"
        >
          <div className="flex flex-col justify-between items-center gap-4 mb-8">
            <div className="w-full md:w-1/3 relative">
              <Input
                type="search"
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
                aria-label="Search markets"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {!isLoading && filteredMarkets.length > 0 ? (
                Array.from(
                  new Set(filteredMarkets.map((m) => m.derivedCategory || m.category))
                ).map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`transition-colors duration-150 ${
                      selectedCategory === category
                        ? "font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {category}
                  </Button>
                ))
              ) : isLoading ? (
                <>
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <Skeleton className="h-8 w-16 rounded-md" />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No categories found.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-10 justify-center mb-10">
            <ToggleGroup
              type="single"
              value={sortOrder}
              onValueChange={(value: string) => {
                if (value) setSortOrder(value);
              }}
              aria-label="Sort markets by"
              className="bg-muted p-1 rounded-md shadow-lg"
            >
              <ToggleGroupItem
                value="timeRemaining"
                aria-label="Sort by time remaining"
                className="px-3 py-1.5 text-xs sm:text-sm data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md"
              >
                Ending Soon
              </ToggleGroupItem>
              <ToggleGroupItem
                value="liquidity"
                aria-label="Sort by liquidity"
                className="px-3 py-1.5 text-xs sm:text-sm data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md"
              >
                Liquidity
              </ToggleGroupItem>
              <ToggleGroupItem
                value="participants"
                aria-label="Sort by participants"
                className="px-3 py-1.5 text-xs sm:text-sm data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md"
              >
                Traders
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="flex justify-end">
              <ToggleGroup
                type="single"
                value={selectedSource}
                onValueChange={(value) => {
                  if (value) setSelectedSource(value);
                }}
                aria-label="Market Source Filter"
                className="bg-muted p-1 rounded-md gap-3 shadow-lg"
              >
                <ToggleGroupItem
                  value="All"
                  aria-label="All Markets"
                  className="px-3 py-1.5 text-xs sm:text-sm data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md"
                >
                  All
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="Prophit"
                  aria-label="Prophit"
                  className="px-3 py-1.5 text-xs sm:text-sm data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md"
                >
                  Prophit
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="External Markets"
                  aria-label="External Markets"
                  className="px-5 py-1.5 text-xs sm:text-sm data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md"
                >
                  External
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <div className="min-h-[500px]">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-lg border border-border shadow-sm p-5 animate-pulse h-64"
                  >
                    <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
                    <div className="h-6 bg-muted rounded w-full mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
                    <div className="flex justify-between mb-2">
                      <div className="h-5 bg-muted rounded w-1/4"></div>
                      <div className="h-5 bg-muted rounded w-1/4"></div>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full mb-6"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                Error: {error}
              </div>
            ) : paginatedMarkets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedMarkets.map((market) => {
                  // Calculate timeRemaining and log values for debugging
                  const timeRemainingStr = market.expirationTime
                                           ? formatTimeRemaining(market.expirationTime)
                                           : "N/A";
                  console.log(
                    `[Render] Market ID: ${market.id}, Exp Time (s): ${market.expirationTime}, ` +
                    `Formatted Time: ${timeRemainingStr}, Status: ${MarketStatus[market.status ?? MarketStatus.Locked]}`
                  );

                  return (
                   <PredictionMarketCard
                     key={`${market.source}-${market.id}`}
                     id={market.id}
                     title={market.question ?? "N/A"}
                     odds={{
                       // Use bestAsk or the placeholder 0.5
                       yes: Math.round((market.bestAsk ?? 0.5) * 100),
                       no: 100 - Math.round((market.bestAsk ?? 0.5) * 100),
                     }}
                     liquidity={market.liquidity?.toFixed(2) ?? "0"}
                     timeRemaining={timeRemainingStr} // Use the pre-calculated string
                     category={market.derivedCategory || market.category || "Other"} // Use derived, then original, then fallback
                     image={market.image}
                     status={market.status ?? MarketStatus.Locked} // Pass market.status with fallback to MarketStatus.Locked
                   />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-xl font-medium">No markets found</p>
                {(selectedCategory !== "All" || searchTerm) && (
                  <p>Try adjusting your filters.</p>
                )}
              </div>
            )}
          </div>

          {!isLoading && !error && totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-1 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 sm:px-3"
              >
                Previous
              </Button>
              {getPaginationNumbers(currentPage, totalPages).map(
                (pageNumber, index) =>
                  typeof pageNumber === "number" ? (
                    <Button
                      key={`page-${pageNumber}`}
                      variant={
                        currentPage === pageNumber ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className="w-9 h-9 px-0 sm:w-10 sm:h-10"
                    >
                      {pageNumber}
                    </Button>
                  ) : (
                    <span
                      key={`dots-${index}`}
                      className="px-1 sm:px-2 text-muted-foreground"
                    >
                      ...
                    </span>
                  )
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </RootLayout>
  );
}
