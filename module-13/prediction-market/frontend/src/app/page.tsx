"use client";

import { useState, useEffect, useMemo } from "react";
import { RootLayout } from "@/components/layout/RootLayout";
import { PredictionMarketCard } from "@/components/ui/prediction-market-card";
import Link from "next/link";
import { PolymarketAPIMarket, DisplayMarket } from "@/types/market"; // Import DisplayMarket
import { fetchActivePolymarketMarkets } from "@/services/gamma";
import { ProphitHero } from "@/components/ProphitHero";
import { categorizeMarket, formatTimeRemaining } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketContractSafe } from "@/hooks/useMarketContractSafe";
import { MarketInfo, MarketStatus } from "@/types/contracts"; // Import MarketInfo AND MarketStatus
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
  const { getMarkets: getProphitMarketAddresses, getMarketDetails, isReady: contractIsReady } = useMarketContractSafe();

  // Store markets by source
  const [externalMarkets, setExternalMarkets] = useState<DisplayMarket[]>([]);
  const [prophitMarkets, setProphitMarkets] = useState<DisplayMarket[]>([]);

  const loadMarketData = async () => {
    if (isRefreshing) return;

    setIsLoading(true);
    setIsRefreshing(true);
    setError(null);
    console.log("Homepage: Fetching market data...");
    try {
      // 1. Fetch raw external (Polymarket) data
      const rawExternalMarkets = await fetchActivePolymarketMarkets();

      // 2. Transform PolymarketAPIMarket[] to DisplayMarket[]
      const transformedExternal: DisplayMarket[] = (rawExternalMarkets || []).map(market => ({
        id: market.id,
        question: market.question,
        image: market.image || '/placeholder.png', // Use image or placeholder
        category: market.category || 'Unknown',
        derivedCategory: market.derivedCategory,
        source: 'polymarket',
        expirationTime: market.expirationTime ? Number(market.expirationTime) : undefined,
        endDate: market.endDate,
        bestAsk: market.bestAsk,
        bestBid: market.bestBid,
        lastPrice: market.lastPrice,
        slug: market.slug,
        url: market.url,
        liquidity: market.liquidity ?? 0, // Map liquidityClob to liquidity
      }));

      // 3. Fetch Prophit market addresses using the hook if ready
      let fetchedProphitData: DisplayMarket[] = [];
      if (contractIsReady) {
        console.log("Homepage: Contract hook is ready, fetching Prophit market addresses...");
        const addresses = (await getProphitMarketAddresses(0, 100)) || []; // Fetch first 100 addresses
        console.log(`Homepage: Fetched ${addresses.length} Prophit market addresses. Fetching details...`);

        // Fetch details for each address
        const detailPromises = addresses.map(addr => getMarketDetails(addr));
        const results = await Promise.allSettled(detailPromises);

        const mergedMarkets = results
          .map((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
              const details: MarketInfo = result.value;
              // --- Map MarketInfo to DisplayMarket --- 
              // This mapping is crucial and depends heavily on your MarketInfo structure
              // and what DisplayMarket expects. Adjust as needed.
              const prophitMarket: DisplayMarket = {
                id: addresses[index], // Use address as ID for now
                question: details.question,
                image: '/placeholder.png', // Use placeholder image directly
                source: 'prophit',
                category: details.category || 'Unknown',
                expirationTime: Number(details.expirationTime),
                bestAsk: 0.5, // Placeholder
                bestBid: 0.5, // Placeholder
                lastPrice: 0.5, // Placeholder
                liquidity: 0, // Placeholder liquidity for Prophit
                derivedCategory: categorizeMarket({ question: details.question, category: details.category || ''}),
                // NOTE: slug, url, endDate are intentionally omitted as they are Polymarket-specific
              };

              return prophitMarket; // Return the market with derived category
            } else {
              console.error(`Failed to fetch details for market ${addresses[index]}:`, result.status === 'rejected' ? result.reason : 'No data');
              return null;
            }
          })
          .filter((market): market is DisplayMarket => market !== null); // Keep DisplayMarket for now, relying on the optional slug

        console.log(`Homepage: Successfully fetched details for ${fetchedProphitData.length} Prophit markets.`);

      } else {
        console.log("Homepage: Contract hook not ready, skipping Prophit market fetch.");
      }
      // 4. Set state with transformed/fetched data
      setExternalMarkets(transformedExternal);
      setProphitMarkets(fetchedProphitData); // Set the detailed market data

    } catch (err) {
      console.error("Homepage: Error loading market data:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
      setExternalMarkets([]);
      setProphitMarkets([]); // Reset markets on error
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

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

  const { categories, filteredMarkets, totalPages, paginatedMarkets } = useMemo(() => {
    // Combine markets based on selected source
    let combinedMarkets: DisplayMarket[] = [];
    // Use the fetched Prophit market data
    if (selectedSource === "All") {
      combinedMarkets = [...externalMarkets, ...prophitMarkets];
    } else if (selectedSource === "Prophit") {
      combinedMarkets = [...prophitMarkets];
    } else if (selectedSource === "External Markets") {
      combinedMarkets = [...externalMarkets];
    }

    // Add derivedCategory and filter/sort the combined list
    const categorizedMarkets = combinedMarkets.map((market) => ({
      ...market,
      derivedCategory: categorizeMarket(market),
    }));

    const uniqueCategories = [
      "All",
      ...Array.from(
        new Set(categorizedMarkets.map((m) => m.derivedCategory))
      ).sort(),
    ];

    // Apply category and search filters
    let currentFilteredMarkets = categorizedMarkets.filter((market) => {
      const matchesCategory =
        selectedCategory === "All" ||
        market.derivedCategory === selectedCategory;
      const matchesSearch = debouncedSearchTerm
        ? market.question.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          (market.slug?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ??
            false)
        : true;
      return matchesCategory && matchesSearch;
    });

    // Apply sorting
    const now = new Date().getTime();
    currentFilteredMarkets.sort((a, b) => {
      switch (sortOrder) {
        case "liquidity":
          return (b.liquidity ?? 0) - (a.liquidity ?? 0);
        case "participants":
          const participantsA = Math.floor((a.liquidity ?? 0) / 200);
          const participantsB = Math.floor((b.liquidity ?? 0) / 200);
          return participantsB - participantsA;
        case "timeRemaining":
        default:
          const timeA = a.expirationTime
            ? new Date(a.expirationTime * 1000).getTime()
            : Infinity;
          const timeB = b.expirationTime
            ? new Date(b.expirationTime * 1000).getTime()
            : Infinity;
          const diffA = timeA - now;
          const diffB = timeB - now;
          if (diffA <= 0 && diffB <= 0) return timeB - timeA;
          if (diffA <= 0) return 1;
          if (diffB <= 0) return -1;
          return diffA - diffB;
      }
    });

    const calculatedTotalPages = Math.ceil(
      currentFilteredMarkets.length / ITEMS_PER_PAGE
    );
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPaginatedMarkets = currentFilteredMarkets.slice(
      startIndex,
      endIndex
    );

    return {
      categories: uniqueCategories,
      filteredMarkets: currentFilteredMarkets,
      totalPages: calculatedTotalPages,
      paginatedMarkets: currentPaginatedMarkets,
    };
  }, [
    externalMarkets, // Depend on specific sources
    prophitMarkets,  // Depend on full prophit data now
    contractIsReady,    // Re-calculate if hook readiness changes
    selectedCategory,
    selectedSource,
    debouncedSearchTerm,
    currentPage,
    sortOrder,
  ]);

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
              {!isLoading && categories.length > 1 ? (
                categories.map((category) => (
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
                {paginatedMarkets.map((market) => (
                  <PredictionMarketCard
                    key={market.id}
                    id={market.id}
                    title={market.question ?? "N/A"}
                    odds={{
                      yes: Math.round((market.bestAsk ?? 0.5) * 100),
                      no: 100 - Math.round((market.bestAsk ?? 0.5) * 100),
                    }}
                    liquidity={market.liquidity?.toFixed(2) ?? "0"}
                    timeRemaining={
                      market.expirationTime
                        ? formatTimeRemaining(market.expirationTime)
                        : "N/A"
                    }
                    category={market.derivedCategory || "Other"}
                    image={market.image}
                  />
                ))}
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
