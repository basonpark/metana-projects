"use client";

import { useState, useEffect, useMemo } from "react";
import { RootLayout } from "@/components/layout/RootLayout";
import { PredictionMarketCard } from "@/components/ui/prediction-market-card";
import { Search } from "lucide-react";
import Link from "next/link";
import { fetchActivePolymarketMarkets } from "@/services/gamma";
import { formatTimeRemaining, categorizeMarket } from "@/lib/utils";
import { PolymarketAPIMarket } from "@/types/market";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketStatus } from "@/types/market"; // Import MarketStatus

// Define a type for combined market data
interface CombinedMarket extends PolymarketAPIMarket {
  origin: "polymarket" | "prophit";
  derivedCategory?: string; // Keep derivedCategory optional
}

// Placeholder Prophit Markets Data
const placeholderProphitMarkets: Omit<CombinedMarket, "derivedCategory">[] =
  Array.from({ length: 10 }).map((_, i) => {
    // Dates for conversion
    const createdAtDate = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000);
    const endDateDate = new Date(Date.now() + (30 - i) * 24 * 60 * 60 * 1000);

    return {
      // Fields from original placeholder structure
      id: `0x${(i + 1).toString().padStart(40, '0')}`, // Generate fake hex ID
      question: `Will Prophit Feature ${i + 1} be successful by Q${
        (i % 4) + 1
      } 2025?`,
      slug: `prophit-feature-${i + 1}`,
      description: `Placeholder description for Prophit market ${
        i + 1
      }. This market tracks the success of a key feature. Resolution source TBD.`,
      outcomes: ["Yes", "No"], // Keep outcomes required by PolymarketAPIMarket
      volume: Math.floor(Math.random() * 5000) + 100,
      category: "Prophit",
      bestAsk: 0.5 + (Math.random() - 0.5) * 0.2,
      bestBid: 0.5 - (Math.random() - 0.5) * 0.2, // Not strictly in PolymarketAPIMarket, but keep if used
      liquidityClob: Math.floor(Math.random() * 10000) + 500,

      // --- Fields added/modified to match CombinedMarket (extending PolymarketAPIMarket) ---
      source: "polymarket" as const, // Required by PolymarketAPIMarket extension
      creationTime: Math.floor(createdAtDate.getTime() / 1000), // Add creationTime (Unix seconds)
      expirationTime: Math.floor(endDateDate.getTime() / 1000), // Add expirationTime (Unix seconds)

      // Field from CombinedMarket definition itself
      origin: "prophit" as const,
      state: "open", // Add the missing required 'state' property
    };
  });

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
  const [polymarketApiMarkets, setPolymarketApiMarkets] = useState<
    PolymarketAPIMarket[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<string>("timeRemaining");
  const [marketFilter, setMarketFilter] = useState<string>("all");

  useEffect(() => {
    const loadMarkets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching external (Polymarket) markets...");
        const fetchedMarkets: PolymarketAPIMarket[] =
          await fetchActivePolymarketMarkets();
        console.log(`Fetched ${fetchedMarkets.length} external markets.`);
        setPolymarketApiMarkets(fetchedMarkets || []);
      } catch (err) {
        console.error("Error loading markets:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred while fetching markets."
        );
        setPolymarketApiMarkets([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadMarkets();
  }, []);

  const { categories, filteredMarkets, totalPages, paginatedMarkets } =
    useMemo(() => {
      // 1. Combine Polymarket and Placeholder Prophit markets
      const combinedMarkets: CombinedMarket[] = [
        ...polymarketApiMarkets.map((m) => ({
          ...m,
          origin: "polymarket" as const,
        })),
        ...placeholderProphitMarkets.map((m) => ({
          ...m,
          origin: "prophit" as const,
        })),
      ];

      // 2. Categorize all combined markets
      const categorizedMarkets = combinedMarkets.map((market) => ({
        ...market,
        derivedCategory: categorizeMarket(market),
      }));

      const uniqueCategories = [
        "All",
        ...Array.from(
          new Set(categorizedMarkets.map((m) => m.derivedCategory ?? "Other")) // Handle potential undefined derivedCategory
        ).sort(),
      ];

      // 3. Filter based on the marketFilter state FIRST
      let marketsAfterTypeFilter = categorizedMarkets;
      if (marketFilter === "external") {
        marketsAfterTypeFilter = categorizedMarkets.filter(
          (m) => m.origin === "polymarket"
        );
      } else if (marketFilter === "prophit") {
        marketsAfterTypeFilter = categorizedMarkets.filter(
          (m) => m.origin === "prophit"
        );
      }
      // 'all' uses all categorizedMarkets

      // 4. Apply category and search filters
      let currentFilteredMarkets = marketsAfterTypeFilter.filter((market) => {
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

      // 5. Sort
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
              ? a.expirationTime * 1000
              : Infinity;
            const timeB = b.expirationTime
              ? b.expirationTime * 1000
              : Infinity;
            const diffA = timeA - now;
            const diffB = timeB - now;
            if (diffA <= 0 && diffB <= 0) return timeB - timeA;
            if (diffA <= 0) return 1;
            if (diffB <= 0) return -1;
            return diffA - diffB;
        }
      });

      // 6. Paginate
      const calculatedTotalPages = Math.ceil(
        currentFilteredMarkets.length / ITEMS_PER_PAGE
      );
      // Reset to page 1 if current page is out of bounds after filtering
      const finalCurrentPage =
        currentPage > calculatedTotalPages ? 1 : currentPage;
      const startIndex = (finalCurrentPage - 1) * ITEMS_PER_PAGE;
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
      polymarketApiMarkets,
      selectedCategory,
      searchTerm,
      currentPage,
      sortOrder,
      marketFilter,
    ]);

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
      allMarketsCount: polymarketApiMarkets.length,
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
    polymarketApiMarkets.length,
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
  }, [selectedCategory, searchTerm, sortOrder, marketFilter]);

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
            Explore and trade on the outcomes of future events
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <Tabs
            value={marketFilter}
            onValueChange={setMarketFilter}
            className="w-auto"
          >
            <TabsList className="grid grid-cols-3 w-full sm:w-[400px]">
              <TabsTrigger value="all">All Markets</TabsTrigger>
              <TabsTrigger value="external">External</TabsTrigger>
              <TabsTrigger value="prophit">Prophit</TabsTrigger>
            </TabsList>
          </Tabs>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedMarkets.map((market) => {
                const now = new Date().getTime();
                let inferredStatus: MarketStatus;
                if (market.expirationTime) {
                  const expirationMillis = market.expirationTime * 1000;
                  if (expirationMillis <= now) {
                    inferredStatus = MarketStatus.Locked; // Market ended
                  } else {
                    inferredStatus = MarketStatus.Open; // Market active
                  }
                } else {
                  inferredStatus = MarketStatus.Open; // Default to Open if no expiration time
                }
                const detailUrl = `/markets/${market.id}?type=${market.origin}`;
                const displayYesOdds = Math.round(
                  (market.bestAsk ?? 0.5) * 100
                );
                const displayNoOdds = 100 - displayYesOdds;
                return (
                  <Link
                    key={market.id}
                    href={detailUrl}
                    className="block hover:shadow-lg transition-shadow duration-200 rounded-lg"
                  >
                    <PredictionMarketCard
                      id={market.id}
                      title={market.question ?? "Market Question Unavailable"}
                      odds={{
                        yes: displayYesOdds,
                        no: displayNoOdds,
                      }}
                      liquidity={market.liquidityClob?.toFixed(2) ?? "0"}
                      timeRemaining={
                        market.expirationTime
                          ? formatTimeRemaining(market.expirationTime * 1000)
                          : "N/A"
                      }
                      category={market.derivedCategory || "Other"}
                      image={market.image}
                      origin={market.origin}
                      status={inferredStatus} // Pass the inferred status
                    />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <p className="text-xl font-medium">No markets found</p>
              <p>Try adjusting your filters.</p>
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
