"use client";

import { useState, useEffect } from "react";
import { RootLayout } from "@/components/layout/RootLayout";
import { PredictionMarketCard } from "@/components/ui/prediction-market-card";
import Link from "next/link";
import { useMarketContractSafe } from "@/hooks/useMarketContractSafe";
import { Market, MarketStatus, Outcome } from "@/types/contracts";
import polymarketAPI from "@/services/polymarketAPI";
import { ProphitHero } from "@/components/ProphitHero";

export default function HomePage() {
  const [featuredMarkets, setFeaturedMarkets] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const { getMarkets, getCategories } = useMarketContractSafe();

  // Function to load market data
  const loadMarketData = async () => {
    try {
      // If we're already refreshing, don't start a new refresh
      if (isRefreshing) return;

      setIsRefreshing(true);
      console.log("Fetching latest market data from Polymarket API");

      // Define the market data structure for type safety
      interface MarketData {
        id: string | number;
        title: string;
        odds: {
          yes: number;
          no: number;
        };
        liquidity: string | number;
        timeRemaining: string;
        category: string;
        isFeatured?: boolean; // Make it optional
      }

      // Fetch data from Polymarket API
      const polymarketMarkets = await polymarketAPI.getMarkets(6);

      // Check if we're using mock data by looking at the IDs
      const isMockData =
        polymarketMarkets.length > 0 &&
        polymarketMarkets[0].id.toString().startsWith("mock-");
      setUsingMockData(isMockData);

      if (polymarketMarkets && polymarketMarkets.length > 0) {
        console.log(
          `Successfully fetched ${polymarketMarkets.length} markets${
            isMockData ? " (mock data)" : ""
          }`
        );

        const marketsData = polymarketMarkets.map((market) => ({
          id: market.id,
          title: market.question,
          odds: {
            yes: Math.round(market.outcomes[0]?.probability * 100) || 50,
            no: Math.round(market.outcomes[1]?.probability * 100) || 50,
          },
          liquidity: market.liquidity,
          timeRemaining: market.timeRemaining || "Ends soon",
          category: market.category,
        }));

        setFeaturedMarkets(marketsData);
        setLastUpdated(new Date());
      } else {
        console.warn("No markets found from Polymarket API");
        // Only fallback to contract data if we have no markets yet
        if (featuredMarkets.length === 0) {
          await loadFallbackData();
        }
      }
    } catch (error) {
      console.error("Error loading Polymarket data:", error);
      // Only fallback if we have no markets yet
      if (featuredMarkets.length === 0) {
        await loadFallbackData();
        setUsingMockData(true);
      }
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // Function to load categories
  const loadCategories = async () => {
    try {
      // Try to get categories from Polymarket API
      console.log("Fetching categories from Polymarket API");
      const polymarketCategories = await polymarketAPI.getCategories();

      if (polymarketCategories.length > 0) {
        console.log(
          `Successfully fetched ${polymarketCategories.length} categories`
        );
        setCategories(polymarketCategories);
        return;
      }
    } catch (apiError) {
      console.log("Could not fetch categories from Polymarket API", apiError);
    }

    // If no categories from API, try contract
    try {
      console.log("Trying to fetch categories from contract");
      const cats = await getCategories();
      if (cats && cats.length > 0) {
        setCategories(cats);
        return;
      }
    } catch (contractError) {
      console.log("Could not fetch categories from contract", contractError);
    }

    // Use default categories as fallback
    console.log("Using default categories as fallback");
    setCategories([
      "Crypto",
      "Finance",
      "Politics",
      "Sports",
      "Technology",
      "Entertainment",
    ]);
  };

  // Function to load fallback data from contract or mock data
  const loadFallbackData = async () => {
    try {
      // Try to get markets from contract
      try {
        console.log("Trying to load data from contract");
        const markets = await getMarkets(0, 6);
        if (markets && markets.length > 0) {
          const marketsData = markets.map((market) => ({
            id: market.address,
            title: market.question,
            odds: {
              yes: Math.round(market.yesPrice * 100),
              no: Math.round(market.noPrice * 100),
            },
            liquidity: market.liquidity,
            timeRemaining: market.timeRemaining,
            category: market.category,
          }));
          setFeaturedMarkets(marketsData);
          return;
        }
      } catch (contractError) {
        console.log("Contract not ready yet", contractError);
      }

      // If contract data also fails, use mock data
      console.log("Using mock data as last resort");
      setFeaturedMarkets([
        {
          id: 1,
          title: "Will Bitcoin exceed $100,000 by end of 2024?",
          odds: { yes: 65, no: 35 },
          liquidity: 250000,
          timeRemaining: "3 days remaining",
          category: "Crypto",
          isFeatured: true,
        },
        {
          id: 2,
          title: "Will the Federal Reserve cut interest rates in Q3?",
          odds: { yes: 42, no: 58 },
          liquidity: 180000,
          timeRemaining: "5 days remaining",
          category: "Finance",
        },
        {
          id: 3,
          title: "Will Apple release a new AR headset this year?",
          odds: { yes: 78, no: 22 },
          liquidity: 320000,
          timeRemaining: "12 hours remaining",
          category: "Technology",
        },
        {
          id: 4,
          title:
            "Will the Democratic candidate win the 2024 US Presidential Election?",
          odds: { yes: 52, no: 48 },
          liquidity: 500000,
          timeRemaining: "4 months remaining",
          category: "Politics",
        },
        {
          id: 5,
          title: "Will Real Madrid win the Champions League?",
          odds: { yes: 30, no: 70 },
          liquidity: 150000,
          timeRemaining: "2 months remaining",
          category: "Sports",
        },
        {
          id: 6,
          title: "Will Ethereum price be above $5,000 by July 2024?",
          odds: { yes: 45, no: 55 },
          liquidity: 280000,
          timeRemaining: "1 month remaining",
          category: "Crypto",
        },
      ]);
    } catch (error) {
      console.error("Error loading fallback data:", error);
    }
  };

  // Initial data load
  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      await Promise.all([loadMarketData(), loadCategories()]);
    };

    initialLoad();
  }, []);

  // Set up polling to refresh data periodically
  useEffect(() => {
    // Initial load done in separate useEffect to avoid dependencies issues

    // Get refresh interval from environment variable or default to 2 minutes
    const refreshInterval = parseInt(
      process.env.NEXT_PUBLIC_DATA_REFRESH_INTERVAL || "120000",
      10
    );

    // Set up polling interval
    const intervalId = setInterval(() => {
      console.log(
        `Polling for fresh market data (every ${refreshInterval / 1000}s)...`
      );
      loadMarketData();
    }, refreshInterval);

    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <RootLayout>
      {/* Hero section with full-width aurora background */}
      <ProphitHero />

      {/* Content sections with containers */}
      <div className="bg-background">
        {/* Featured Markets */}
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Featured Markets</h2>
              <div className="flex flex-col text-sm text-muted-foreground">
                {lastUpdated && (
                  <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                )}
                <span>
                  Data source:{" "}
                  {usingMockData
                    ? "Demonstration data"
                    : "Polymarket Gamma API"}
                </span>
              </div>
            </div>
            <Link href="/markets" className="text-primary hover:underline">
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-full h-64 rounded-lg bg-muted animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMarkets.map((market) => (
                <PredictionMarketCard
                  key={market.id}
                  id={market.id}
                  title={market.title}
                  odds={market.odds}
                  liquidity={market.liquidity}
                  timeRemaining={market.timeRemaining}
                  category={market.category}
                  isFeatured={market.isFeatured}
                />
              ))}
              {featuredMarkets.length === 0 && !isLoading && (
                <div className="col-span-3 text-center py-10">
                  <p className="text-muted-foreground">
                    No markets available at the moment. Please check again
                    later.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="container mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/markets?category=${category.toLowerCase()}`}
                className="flex flex-col items-center justify-center p-6 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <span className="text-xl text-primary">
                    {category.charAt(0)}
                  </span>
                </div>
                <span className="font-medium">{category}</span>
                <span className="text-sm text-muted-foreground mt-1">
                  {/* This would ideally be fetched from the API */}
                  {Math.floor(Math.random() * 20) + 5} markets
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
