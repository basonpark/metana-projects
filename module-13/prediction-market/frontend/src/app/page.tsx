"use client";

import { useState, useEffect, useMemo } from "react";
import { RootLayout } from "@/components/layout/RootLayout";
import { PredictionMarketCard } from "@/components/ui/prediction-market-card";
import Link from "next/link";
import { PolymarketAPIMarket } from "@/types/market";
import { fetchActivePolymarketMarkets } from "@/services/gamma";
import { ProphitHero } from "@/components/ProphitHero";
import { categorizeMarket, formatTimeRemaining } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [allMarkets, setAllMarkets] = useState<PolymarketAPIMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSource, setSelectedSource] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<string>("timeRemaining");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMarketData = async () => {
    if (isRefreshing) return;

    setIsLoading(true);
    setIsRefreshing(true);
    setError(null);
    console.log("Homepage: Fetching all active markets...");
    try {
      const fetchedMarkets = await fetchActivePolymarketMarkets();
      console.log(`Homepage: Fetched ${fetchedMarkets.length} markets.`);
      setAllMarkets(fetchedMarkets || []);
    } catch (err) {
      console.error("Homepage: Error loading market data:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
      setAllMarkets([]);
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

  const { categories, filteredMarkets, totalPages, paginatedMarkets } =
    useMemo(() => {
      const categorizedMarkets = allMarkets.map((market) => ({
        ...market,
        derivedCategory: categorizeMarket(market),
      }));
      const uniqueCategories = [
        "All",
        ...Array.from(
          new Set(categorizedMarkets.map((m) => m.derivedCategory))
        ).sort(),
      ];

      // Filter by Source first
      let sourceFilteredMarkets = categorizedMarkets;
      if (selectedSource === "Prophit Markets") {
        sourceFilteredMarkets = []; // Placeholder - no Prophit data yet
      } else if (selectedSource === "External Markets") {
        // Assume allMarkets currently holds external data
        sourceFilteredMarkets = categorizedMarkets;
      } // 'All' uses the default categorizedMarkets

      // Apply category and search filters to the source-filtered list
      let currentFilteredMarkets = sourceFilteredMarkets.filter((market) => {
        const matchesCategory =
          selectedCategory === "All" ||
          market.derivedCategory === selectedCategory;
        const matchesSearch = searchTerm
          ? market.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (market.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ??
              false)
          : true;
        return matchesCategory && matchesSearch;
      });

      const now = new Date().getTime();
      currentFilteredMarkets.sort((a, b) => {
        switch (sortOrder) {
          case "liquidity":
            return (b.liquidityClob ?? 0) - (a.liquidityClob ?? 0);
          case "participants":
            const participantsA = Math.floor((a.liquidityClob ?? 0) / 200);
            const participantsB = Math.floor((b.liquidityClob ?? 0) / 200);
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
      allMarkets,
      selectedCategory,
      selectedSource,
      searchTerm,
      currentPage,
      sortOrder,
    ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSource, searchTerm, sortOrder]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <RootLayout>
      <ProphitHero />

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
            className="bg-muted p-1 rounded-md"
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
              className="bg-muted p-1 rounded-md gap-3"
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
            <div className="text-center py-10 text-red-500">Error: {error}</div>
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
                  liquidity={market.liquidityClob?.toFixed(2) ?? "0"}
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
                    variant={currentPage === pageNumber ? "default" : "outline"}
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
    </RootLayout>
  );
}
