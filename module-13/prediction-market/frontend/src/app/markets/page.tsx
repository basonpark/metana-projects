"use client";

import { useState, useEffect } from "react";
import { RootLayout } from "@/components/layout/RootLayout";
import { PredictionMarketCard } from "@/components/ui/prediction-market-card";
import { useMarketContractSafe } from "@/hooks/useMarketContractSafe";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import Link from "next/link";
import {
  fetchActiveMarkets,
  calculateTimeRemaining,
} from "@/services/simplifiedAPI";

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

  const {
    getMarkets: getBlockchainMarkets,
    getMarketsByCategory,
    getCategories,
  } = useMarketContractSafe();

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
      let displayMarkets: any[] = [];
      let errorOccurred = false;

      try {
        console.log("Attempting to fetch markets from simplified API...");
        const apiMarkets = await fetchActiveMarkets();
        console.log(`Fetched ${apiMarkets.length} markets from API.`);

        if (apiMarkets.length > 0) {
          const filteredApiMarkets = selectedCategory
            ? apiMarkets.filter(
                (m) =>
                  m.category.toLowerCase() === selectedCategory.toLowerCase()
              )
            : apiMarkets;

          displayMarkets = filteredApiMarkets.map((market) => ({
            id: market.id,
            title: market.question,
            odds: {
              yes: Math.round(market.yesPrice * 100),
              no: Math.round(market.noPrice * 100),
            },
            liquidity: market.volume,
            timeRemaining: calculateTimeRemaining(market.endDate),
            category: market.category,
          }));
          console.log(
            `Displaying ${displayMarkets.length} markets after filtering/mapping.`
          );
        } else {
          console.log("Simplified API returned no markets.");
          errorOccurred = true;
        }
      } catch (error) {
        console.error("Error loading markets from simplified API:", error);
        errorOccurred = true;
      }

      if (errorOccurred || displayMarkets.length === 0) {
        console.log("Falling back to sample markets...");
        displayMarkets = getSampleMarkets(selectedCategory);
      }

      setMarkets(displayMarkets);
      setIsLoading(false);
    };

    loadMarkets();
  }, [selectedCategory]);

  const filteredMarkets = markets.filter((market) => {
    if (!searchQuery) return true;
    const titleMatch =
      market.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    const categoryMatch =
      market.category?.toLowerCase().includes(searchQuery.toLowerCase()) ??
      false;
    return titleMatch || categoryMatch;
  });

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    const url = new URL(window.location.href);
    if (category) {
      url.searchParams.set("category", category);
    } else {
      url.searchParams.delete("category");
    }
    window.history.pushState({}, "", url.toString());
  };

  const getSampleMarkets = (category: string | null) => {
    const allMarkets = [
      {
        id: "sample-1",
        title: "Will Bitcoin exceed $100,000 by end of 2024?",
        odds: { yes: 65, no: 35 },
        liquidity: "250,000",
        timeRemaining: "3 days remaining",
        category: "Crypto",
      },
      {
        id: "sample-2",
        title: "Will the Federal Reserve cut interest rates in Q3?",
        odds: { yes: 42, no: 58 },
        liquidity: "180,000",
        timeRemaining: "5 days remaining",
        category: "Finance",
      },
      {
        id: "sample-3",
        title: "Will Apple release a new AR headset this year?",
        odds: { yes: 78, no: 22 },
        liquidity: "320,000",
        timeRemaining: "12 hours remaining",
        category: "Technology",
      },
      {
        id: "sample-4",
        title:
          "Will the Democratic candidate win the 2024 US Presidential Election?",
        odds: { yes: 52, no: 48 },
        liquidity: "500,000",
        timeRemaining: "4 months remaining",
        category: "Politics",
      },
      {
        id: "sample-5",
        title: "Will Real Madrid win the Champions League?",
        odds: { yes: 30, no: 70 },
        liquidity: "150,000",
        timeRemaining: "2 months remaining",
        category: "Sports",
      },
      {
        id: "sample-6",
        title: "Will Ethereum price be above $5,000 by July 2024?",
        odds: { yes: 45, no: 55 },
        liquidity: "280,000",
        timeRemaining: "1 month remaining",
        category: "Crypto",
      },
      {
        id: "sample-7",
        title: "Will Spider-Man 4 be announced before the end of the year?",
        odds: { yes: 62, no: 38 },
        liquidity: "120,000",
        timeRemaining: "6 months remaining",
        category: "Entertainment",
      },
      {
        id: "sample-8",
        title: "Will Tesla release full self-driving capability this year?",
        odds: { yes: 35, no: 65 },
        liquidity: "420,000",
        timeRemaining: "8 months remaining",
        category: "Technology",
      },
    ];

    if (!category) return allMarkets;
    return allMarkets.filter(
      (market) => market.category.toLowerCase() === category.toLowerCase()
    );
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-card rounded-lg border shadow-lg p-5 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </div>
                <div className="h-2 bg-muted rounded-full mb-6"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            ))
          ) : filteredMarkets.length > 0 ? (
            filteredMarkets.map((market) => (
              <PredictionMarketCard
                key={market.id}
                id={market.id}
                title={market.title}
                odds={market.odds}
                liquidity={market.liquidity}
                timeRemaining={market.timeRemaining}
                category={market.category}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              No markets found{" "}
              {selectedCategory ? `in the ${selectedCategory} category` : ""}.
            </div>
          )}
        </div>

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
