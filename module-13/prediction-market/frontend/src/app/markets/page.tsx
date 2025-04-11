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

const ITEMS_PER_PAGE = 50;

export default function MarketsPage() {
  const [allMarkets, setAllMarkets] = useState<PolymarketMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);

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

      const currentFilteredMarkets = categorizedMarkets.filter((market) => {
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
    }, [allMarkets, selectedCategory, searchTerm, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

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
              placeholder="Search by question or slug..."
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
                    market.endDate ? formatTimeRemaining(market.endDate) : "N/A"
                  }
                  category={market.derivedCategory || "Other"}
                  image={market.image}
                />
              ))}
            </div>
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
          <div className="mt-12 flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
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
