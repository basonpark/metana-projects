"use client";

import { useState, useEffect, useMemo } from "react";
import { RootLayout } from "@/components/layout/RootLayout";
import { PredictionMarketCard } from "@/components/ui/prediction-market-card";
import { Search } from "lucide-react";
import Link from "next/link";
import { fetchActivePolymarketMarkets } from "@/services/gamma";
import { formatTimeRemaining, categorizeMarket } from "@/lib/utils";
import { PolymarketMarket } from "@/types/polymarket";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const ITEMS_PER_PAGE = 30;

const getPaginationNumbers = (
  currentPage: number,
  totalPages: number,
  siblings = 1
): (number | "...")[] => {
  const totalNumbers = siblings * 2 + 3; // siblings on each side + first + last + current
  const totalBlocks = totalNumbers + 2; // totalNumbers + 2 ellipses

  if (totalPages <= totalBlocks) {
    // No need for ellipses if total pages is small
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

  // Fallback (should not happen with logic above, but good practice)
  return Array.from({ length: totalPages }, (_, i) => i + 1);
};

export default function MarketsPage() {
  const [allMarkets, setAllMarkets] = useState<PolymarketMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<string>("timeRemaining");

  useEffect(() => {
    const loadMarkets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching all active markets...");
        const fetchedMarkets = await fetchActivePolymarketMarkets();
        console.log(`Fetched a total of ${fetchedMarkets.length} markets.`);
        setAllMarkets(fetchedMarkets || []);
      } catch (err) {
        console.error("Error loading markets:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred while fetching markets."
        );
        setAllMarkets([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadMarkets();
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

      let currentFilteredMarkets = categorizedMarkets.filter((market) => {
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
            const timeA = a.endDate ? new Date(a.endDate).getTime() : Infinity;
            const timeB = b.endDate ? new Date(b.endDate).getTime() : Infinity;
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
    }, [allMarkets, selectedCategory, searchTerm, currentPage, sortOrder]);

  // Add console logs for debugging
  useEffect(() => {
    console.log("[Debug] State Update:", {
      isLoading,
      error,
      selectedCategory,
      searchTerm,
      currentPage,
      sortOrder,
      totalPages,
      allMarketsCount: allMarkets.length,
      filteredMarketsCount: filteredMarkets.length,
      paginatedMarketsCount: paginatedMarkets.length,
    });
  }, [
    isLoading,
    error,
    selectedCategory,
    searchTerm,
    currentPage,
    sortOrder,
    totalPages,
    allMarkets.length,
    filteredMarkets.length,
    paginatedMarkets.length,
  ]);

  // --- DEBUG: Log before returning JSX ---
  console.log("[Debug] Rendering Toggle Group section...");
  console.log(
    `[Debug] Rendering Pagination Controls: currentPage=${currentPage}, totalPages=${totalPages}`
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, sortOrder]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <RootLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">
            Prediction Markets
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore and trade on the outcomes of future events.
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Search markets"
            />
          </div>

          {!isLoading && categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
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
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center mb-6">
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
              className="px-3 py-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md"
            >
              Ending Soon
            </ToggleGroupItem>
            <ToggleGroupItem
              value="liquidity"
              aria-label="Sort by liquidity"
              className="px-3 py-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md"
            >
              Liquidity
            </ToggleGroupItem>
            <ToggleGroupItem
              value="participants"
              aria-label="Sort by participants"
              className="px-3 py-1.5 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md"
            >
              Traders
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg border border-border shadow-sm p-5 animate-pulse"
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
            <div className="col-span-full text-center py-10 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-md p-4">
              <p className="font-semibold">Failed to load markets:</p>
              <p>{error}</p>
            </div>
          ) : paginatedMarkets.length > 0 ? (
            // --- DEBUG: Confirm mapping correct array ---
            (() => {
              console.log(
                `[Debug] Rendering ${paginatedMarkets.length} paginated market cards...`
              );
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedMarkets.map((market) => (
                    <PredictionMarketCard
                      key={market.id}
                      id={market.id}
                      title={market.question ?? "Market Question Unavailable"}
                      odds={{
                        yes: Math.round((market.bestAsk ?? 0.5) * 100),
                        no: 100 - Math.round((market.bestAsk ?? 0.5) * 100),
                      }}
                      liquidity={market.liquidityClob?.toFixed(2) ?? "0"}
                      timeRemaining={
                        market.endDate
                          ? formatTimeRemaining(market.endDate)
                          : "N/A"
                      }
                      category={market.derivedCategory || "Other"}
                      image={market.image}
                    />
                  ))}
                </div>
              );
            })()
          ) : (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <p className="text-xl font-medium">No markets found</p>
              {(selectedCategory !== "All" || searchTerm) && (
                <p>Try adjusting your category or search term.</p>
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

        {!isLoading && !error && (
          <div className="mt-16 text-center border-t border-border pt-8">
            <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">
              Don't see what you're looking for?
            </h3>
            <p className="text-muted-foreground mb-4">
              Suggest a new market for the community.
            </p>
            <Link href="/markets/create" passHref>
              <Button>Create a New Market</Button>
            </Link>
          </div>
        )}
      </div>
    </RootLayout>
  );
}
