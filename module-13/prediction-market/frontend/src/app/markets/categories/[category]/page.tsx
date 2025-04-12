"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { PredictionMarketCard } from "@/components/ui/prediction-market-card";
import { fetchActivePolymarketMarkets } from "@/services/gamma";
import { categorizeMarket, formatTimeRemaining } from "@/lib/utils";
import { PolymarketMarket } from "@/types/polymarket";
import { RootLayout } from "@/components/layout/RootLayout";

export default function CategoryPage() {
  const params = useParams();
  const category = useMemo(() => {
    const catParam = params.category as string;
    return catParam
      ? decodeURIComponent(catParam).replace(/-/g, " ")
      : "Unknown";
  }, [params.category]);

  const [categoryMarkets, setCategoryMarkets] = useState<PolymarketMarket[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAndFilterMarkets = async () => {
      if (!category || category === "Unknown") {
        setError("Category not specified in URL.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        console.log(
          `Fetching all markets to filter for category: ${category}...`
        );
        const allMarkets = await fetchActivePolymarketMarkets();
        console.log(`Fetched ${allMarkets.length} total markets. Filtering...`);

        const filtered = allMarkets.filter((market) => {
          const derivedCategory = categorizeMarket(market);
          return derivedCategory.toLowerCase() === category.toLowerCase();
        });

        console.log(
          `Found ${filtered.length} markets for category: ${category}`
        );
        setCategoryMarkets(filtered);
      } catch (err) {
        console.error(`Error loading markets for category ${category}:`, err);
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred while fetching markets."
        );
        setCategoryMarkets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAndFilterMarkets();
  }, [category]);

  const getCategoryTitle = () => {
    if (!category) return "Markets";
    return category
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <RootLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          {getCategoryTitle()} Markets
        </h1>

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
            <div className="text-center py-10 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-md p-4">
              <p className="font-semibold">
                Failed to load markets for {getCategoryTitle()}:
              </p>
              <p>{error}</p>
            </div>
          ) : categoryMarkets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryMarkets.map((market) => (
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
                  category={getCategoryTitle()}
                  image={market.image}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <h3 className="text-xl font-medium">No markets found</h3>
              <p className="mt-2">
                There are currently no active markets matching the "
                {getCategoryTitle()}" category.
              </p>
            </div>
          )}
        </div>
      </div>
    </RootLayout>
  );
}
