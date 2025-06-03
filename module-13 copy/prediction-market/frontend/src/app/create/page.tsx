"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMarketContractSafe } from "@/hooks/useMarketContractSafe";
import { CreateMarketParams } from "@/types/contracts";
import { RootLayout } from "@/components/layout/RootLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // Assuming sonner is installed
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Added Card components
import { Info } from "lucide-react"; // For info icons

export default function CreateMarketPage() {
  const router = useRouter();
  const { createMarket, isReady, getCategories } = useMarketContractSafe();

  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateMarketParams>>({
    question: "",
    expirationTime: undefined, // Store as Unix timestamp number
    dataFeedId: "", // Optional: Or use a placeholder/default
    threshold: undefined, // Optional: Based on dataFeedId
    category: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    console.log("[CreateMarketPage] handleInputChange fired:", {
      name,
      value,
      type,
    }); // DEBUG
    setFormData((prev) => {
      const newState = {
        ...prev,
        [name]: type === "number" ? parseFloat(value) || undefined : value,
      };
      console.log("[CreateMarketPage] New formData state (pending):", newState); // DEBUG
      return newState;
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value; // yyyy-mm-dd
    console.log("[CreateMarketPage] handleDateChange fired:", { dateValue }); // DEBUG
    if (dateValue) {
      // Convert date string to Unix timestamp (seconds) for the contract
      const timestampSeconds = Math.floor(new Date(dateValue).getTime() / 1000);
      setFormData((prev) => ({
        ...prev,
        expirationTime: timestampSeconds,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        expirationTime: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isReady) {
      toast("Please connect your wallet first.");
      return;
    }

    // Basic validation
    if (
      !formData.question ||
      !formData.expirationTime ||
      !formData.category
      // Add more checks as needed (e.g., for dataFeedId/threshold if required)
    ) {
      toast("Please fill in all required fields.");
      return;
    }

    // Add default values if needed before casting
    const paramsToSubmit: CreateMarketParams = {
      question: formData.question,
      expirationTime: formData.expirationTime,
      dataFeedId: formData.dataFeedId || "N/A", // Provide default if needed
      threshold: formData.threshold || 0, // Provide default if needed
      category: formData.category,
      fee: BigInt(200), // Hardcoded fee: 200 basis points = 2%
    };

    try {
      await createMarket(paramsToSubmit);
      // Feedback handled by useEffect below
    } catch (error) {
      console.error("Create market submission error:", error);
      toast("Failed to submit market creation transaction.");
    }
  };

  // Feedback effect
  useEffect(() => {
    const loadCategories = async () => {
      console.log("[CreateMarketPage] Attempting to load categories..."); // DEBUG
      if (!isReady) {
        console.log(
          "[CreateMarketPage] Hook not ready, skipping category load."
        ); // DEBUG
        return;
      }
      try {
        setLoadingCategories(true);
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories || []); // Handle null case
        console.log("[CreateMarketPage] Categories loaded:", fetchedCategories); // DEBUG
      } catch (error) {
        console.error("Error loading categories:", error);
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        toast(`Failed to load categories: ${errorMessage}`);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, [isReady, getCategories]);

  return (
    <RootLayout>
      <div className="container mx-auto max-w-2xl py-12">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Market</CardTitle>
            <CardDescription>
              Define the parameters for your new prediction market on the
              blockchain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question */}
              <div>
                <Label htmlFor="question">Market Question</Label>
                <Textarea
                  id="question"
                  name="question"
                  required
                  value={formData.question}
                  onChange={handleInputChange}
                  placeholder="e.g., Will ETH reach $5,000 by end of year?"
                  className="mt-1"
                />
              </div>

              {/* Category */}
              <div className="pt-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Crypto, Politics, Sports"
                  className="mt-1"
                />
              </div>

              {/* Expiration Date */}
              <div className="pt-2">
                <Label htmlFor="expirationDate">Expiration Date</Label>
                <Input
                  id="expirationDate"
                  name="expirationDate"
                  type="date"
                  required
                  // Value derived from formData.expirationTime timestamp
                  value={
                    formData.expirationTime
                      ? new Date(formData.expirationTime * 1000)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleDateChange}
                  className="mt-1"
                />
              </div>

              {/* Data Feed ID (Optional/Advanced) */}
              <div className="pt-2">
                <Label htmlFor="dataFeedId">Data Feed ID (Optional)</Label>
                <Input
                  id="dataFeedId"
                  name="dataFeedId"
                  value={formData.dataFeedId}
                  onChange={handleInputChange}
                  placeholder="e.g., Identifier for Chainlink or other oracle"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Needed if market resolves based on specific external data.
                </p>
              </div>

              {/* Threshold (Optional/Advanced) */}
              <div className="pt-2">
                <Label htmlFor="threshold">Threshold (Optional)</Label>
                <Input
                  id="threshold"
                  name="threshold"
                  type="number"
                  value={formData.threshold}
                  onChange={handleInputChange}
                  placeholder="e.g., Price threshold for resolution"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Related to the Data Feed ID for numerical resolutions.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" disabled={!isReady} className="w-full">
                  Create Market
                </Button>
              </div>

              {!isReady && (
                <p className="text-center text-red-500 text-sm pt-2">
                  Please connect your wallet to the correct network (
                  {process.env.NEXT_PUBLIC_DEFAULT_CHAIN}) to create a market.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </RootLayout>
  );
}
