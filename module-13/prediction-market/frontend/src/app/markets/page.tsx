"use client";

import { useState, useEffect } from "react";
import { RootLayout } from "@/components/layout/RootLayout";
import { PredictionMarketCard } from "@/components/ui/prediction-market-card";
import { useMarketContractSafe } from "@/hooks/useMarketContractSafe";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import Link from "next/link";
import { fetchMarkets } from "@/services/marketAPIService";

export default function MarketsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [markets, setMarkets] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categoryParam || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { getMarkets, getMarketsByCategory, getCategories } =
    useMarketContractSafe();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        if (cats && cats.length > 0) {
          setCategories(cats);
        } else {
          // Fallback categories
          setCategories([
            "Crypto",
            "Politics",
            "Sports",
            "Finance",
            "Entertainment",
            "Technology",
          ]);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([
          "Crypto",
          "Politics",
          "Sports",
          "Finance",
          "Entertainment",
          "Technology",
        ]);
      }
    };

    loadCategories();
  }, [getCategories]);

  useEffect(() => {
    const loadMarkets = async () => {
      setIsLoading(true);
      try {
        let fetchedMarkets;

        if (selectedCategory) {
          // Get markets by selected category
          fetchedMarkets = await getMarketsByCategory(selectedCategory, 0, 20);
        } else {
          // Get all markets
          fetchedMarkets = await getMarkets(0, 20);
        }

        if (fetchedMarkets && fetchedMarkets.length > 0) {
          setMarkets(
            fetchedMarkets.map((market) => ({
              id: market.address,
              title: market.question,
              odds: {
                yes: Math.round(market.yesPrice * 100),
                no: Math.round(market.noPrice * 100),
              },
              liquidity: market.liquidity,
              timeRemaining: market.timeRemaining,
              category: market.category,
            }))
          );
        } else {
          // Fetch from our simplified API service
          const apiMarkets = await fetchMarkets();

          // Filter by category if needed
          const filtered = selectedCategory
            ? apiMarkets.filter(
                (m) =>
                  m.category.toLowerCase() === selectedCategory.toLowerCase()
              )
            : apiMarkets;

          if (filtered.length > 0) {
            setMarkets(
              filtered.map((market) => ({
                id: market.id,
                title: market.question,
                odds: {
                  yes: Math.round(market.yes_price * 100),
                  no: Math.round(market.no_price * 100),
                },
                liquidity: market.liquidity,
                timeRemaining: getTimeRemaining(market.resolution_time),
                category: market.category,
              }))
            );
          } else {
            // Fallback to sample data
            setMarkets(getSampleMarkets(selectedCategory));
          }
        }
      } catch (error) {
        console.error("Error loading markets:", error);
        setMarkets(getSampleMarkets(selectedCategory));
      } finally {
        setIsLoading(false);
      }
    };

    loadMarkets();
  }, [getMarkets, getMarketsByCategory, selectedCategory]);

  // Filter markets by search query
  const filteredMarkets = markets.filter((market) => {
    if (!searchQuery) return true;
    return (
      market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    // Update URL without full page reload
    const url = new URL(window.location.href);
    if (category) {
      url.searchParams.set("category", category);
    } else {
      url.searchParams.delete("category");
    }
    window.history.pushState({}, "", url.toString());
  };

  // Sample markets for fallback
  const getSampleMarkets = (category: string | null) => {
    const allMarkets = [
      {
        id: 1,
        title: "Will Bitcoin exceed $100,000 by end of 2024?",
        odds: { yes: 65, no: 35 },
        liquidity: 250000,
        timeRemaining: "3 days remaining",
        category: "Crypto",
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
      {
        id: 7,
        title: "Will Spider-Man 4 be announced before the end of the year?",
        odds: { yes: 62, no: 38 },
        liquidity: 120000,
        timeRemaining: "6 months remaining",
        category: "Entertainment",
      },
      {
        id: 8,
        title: "Will Tesla release full self-driving capability this year?",
        odds: { yes: 35, no: 65 },
        liquidity: 420000,
        timeRemaining: "8 months remaining",
        category: "Technology",
      },
    ];

    if (!category) return allMarkets;
    return allMarkets.filter(
      (market) => market.category.toLowerCase() === category.toLowerCase()
    );
  };

  // Helper function to calculate time remaining
  const getTimeRemaining = (resolutionTime: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = resolutionTime - now;

    if (timeRemaining <= 0) return "Expired";

    const days = Math.floor(timeRemaining / 86400);
    const hours = Math.floor((timeRemaining % 86400) / 3600);

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <RootLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Prediction Markets</h1>
          <p className="text-muted-foreground">
            Explore prediction markets across various categories and bet on
            real-world outcomes.
          </p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              onClick={() => handleCategoryChange(null)}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Market listings */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-full h-64 rounded-lg bg-muted animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredMarkets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((market) => (
              <PredictionMarketCard
                key={market.id}
                id={market.id}
                title={market.title}
                odds={market.odds}
                liquidity={market.liquidity}
                timeRemaining={market.timeRemaining}
                category={market.category}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No markets found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? `No markets matching "${searchQuery}"`
                : selectedCategory
                ? `No markets in the ${selectedCategory} category`
                : "No markets available at this time"}
            </p>
            <Link
              href="/markets/create"
              className="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground"
            >
              Create a New Market
            </Link>
          </div>
        )}

        {/* Create Market CTA */}
        {filteredMarkets.length > 0 && (
          <div className="mt-12 text-center">
            <h3 className="text-xl font-medium mb-2">
              Don't see what you're looking for?
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your own prediction market and let others bet on the
              outcome.
            </p>
            <Link
              href="/markets/create"
              className="inline-block px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium"
            >
              Create a New Market
            </Link>
          </div>
        )}
      </div>
    </RootLayout>
  );
}
