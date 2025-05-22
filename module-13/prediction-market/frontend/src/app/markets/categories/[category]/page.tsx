"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useMarketContractSafe } from "@/hooks/useMarketContractSafe";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketCard } from "@/components/MarketCard";
import { Skeleton } from "@/components/ui/skeleton";
import { MarketWithMetadata } from "@/types/contracts";
import gammaAPI from "@/services/gammaAPI";

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;

  const [markets, setMarkets] = useState<MarketWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { getMarketsByCategory } = useMarketContractSafe();

  useEffect(() => {
    const loadMarkets = async () => {
      try {
        setIsLoading(true);

        // Try to get markets from contract first
        let marketsData: MarketWithMetadata[] = [];
        try {
          // Convert category string for contract (e.g., "crypto" to "Crypto")
          const formattedCategory =
            category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
          marketsData = await getMarketsByCategory(formattedCategory);
        } catch (error) {
          console.warn("Could not load markets from contract:", error);
        }

        // If no markets from contract or error, try fallback to Gamma API
        if (!marketsData || marketsData.length === 0) {
          const apiMarkets = await gammaAPI.getMarketsByCategory(category);
          marketsData = apiMarkets.map((m) => ({
            ...m,
            id: m.id,
            address: `0x${m.id}`,
            question: m.question,
            creationTime:
              new Date(m.createdAt || Date.now() - 86400000).getTime() / 1000,
            expirationTime:
              new Date(m.endDate || Date.now() + 86400000).getTime() / 1000,
            totalLiquidity: m.liquidity || 0,
            volume: m.volume || 0,
            status: m.status === "open" ? 0 : 1,
            outcome: 0,
            yesAmount: Math.floor(Math.random() * 100),
            noAmount: Math.floor(Math.random() * 100),
          }));
        }

        setMarkets(marketsData);
      } catch (error) {
        console.error("Error loading markets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMarkets();
  }, [category, getMarketsByCategory]);

  // Helper to get a human-readable category title
  const getCategoryTitle = () => {
    if (category === "popular") return "Popular Markets";
    return category.charAt(0).toUpperCase() + category.slice(1) + " Markets";
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{getCategoryTitle()}</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="closing-soon">Closing Soon</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="w-full">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-lg p-4 border border-border h-64"
                >
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-6" />
                  <div className="flex justify-between">
                    <Skeleton className="h-12 w-28" />
                    <Skeleton className="h-12 w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : markets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {markets.map((market) => (
                <MarketCard key={market.id || market.address} market={market} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium">No markets found</h3>
              <p className="text-muted-foreground mt-2">
                There are no markets in this category yet.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Other tabs will filter the same data */}
        <TabsContent value="open">
          {/* Similar content with filtered markets */}
          <div className="text-center py-12">
            <p>Open markets will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="closing-soon">
          {/* Similar content with filtered markets */}
          <div className="text-center py-12">
            <p>Markets closing soon will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="resolved">
          {/* Similar content with filtered markets */}
          <div className="text-center py-12">
            <p>Resolved markets will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
