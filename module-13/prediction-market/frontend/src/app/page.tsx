"use client";

import { useState, useEffect } from "react";
import { RootLayout } from "@/components/layout/RootLayout";
import { PredictionMarketCard } from "@/components/ui/prediction-market-card";
import Link from "next/link";
import { useMarketContract } from "@/hooks/useMarketContract";
import { Market, MarketStatus, Outcome } from "@/types/contracts";
import gammaAPI from "@/services/gammaAPI";

export default function HomePage() {
  const [featuredMarkets, setFeaturedMarkets] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getMarkets, getCategories } = useMarketContract();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load market data
        const markets = await getMarkets(0, 6);

        // If we have markets from our contracts, use those
        if (markets && markets.length > 0) {
          setFeaturedMarkets(
            markets.map((market) => ({
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
          // Otherwise, fallback to Gamma API for demo data
          const gammaMarkets = await gammaAPI.getMarkets(6);
          setFeaturedMarkets(
            gammaMarkets.map((market) => ({
              id: market.id,
              title: market.question,
              odds: {
                yes: Math.round(market.outcomes[0]?.probability * 100) || 50,
                no: Math.round(market.outcomes[1]?.probability * 100) || 50,
              },
              liquidity: market.liquidity,
              timeRemaining: market.timeRemaining || "Ends soon",
              category: market.category,
            }))
          );
        }

        // Load categories
        const cats = await getCategories();
        setCategories(
          cats.length > 0
            ? cats
            : ["Crypto", "Politics", "Sports", "Finance", "Entertainment"]
        );
      } catch (error) {
        console.error("Error loading data:", error);
        // Fallback data
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
        setCategories([
          "Crypto",
          "Politics",
          "Sports",
          "Finance",
          "Entertainment",
          "Technology",
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getMarkets, getCategories]);

  return (
    <RootLayout>
      <section className="relative py-12 md:py-16">
        {/* Hero section */}
        <div className="text-center max-w-3xl mx-auto px-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Predict the Future, Earn Rewards
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Join the decentralized prediction marketplace where you can bet on
            real-world events and earn rewards based on your forecasting skills.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/markets"
              className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Explore Markets
            </Link>
            <Link
              href="/markets/create"
              className="px-6 py-3 rounded-md border border-border bg-background font-medium hover:bg-muted transition-colors"
            >
              Create Market
            </Link>
          </div>
        </div>

        {/* Featured Markets */}
        <div className="container mx-auto px-4 mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Markets</h2>
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
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="container mx-auto px-4">
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

        {/* How It Works */}
        <div className="container mx-auto px-4 mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse Markets</h3>
              <p className="text-muted-foreground">
                Explore a variety of prediction markets across different
                categories and find opportunities.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Place Predictions</h3>
              <p className="text-muted-foreground">
                Buy YES or NO shares based on your prediction of the outcome and
                your confidence level.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
              <p className="text-muted-foreground">
                When the market resolves, collect your rewards for correct
                predictions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </RootLayout>
  );
}
