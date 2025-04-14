"use client";

import { useState, useEffect } from "react";
import { RootLayout } from "@/components/layout/RootLayout";
import { useMarketContractSafe } from "@/hooks/useMarketContractSafe";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Info, Clock, DollarSign, Calendar } from "lucide-react";

export default function CreateMarketPage() {
  const router = useRouter();
  const { createMarket, getCategories } = useMarketContractSafe();

  const [formState, setFormState] = useState({
    title: "",
    description: "",
    category: "",
    resolutionTime: "",
    dataFeedId: "",
    targetPrice: "",
    initialLiquidity: "0.1",
    fee: "2",
    outcomes: ["Yes", "No"],
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [customCategory, setCustomCategory] = useState("");
  const [resolutionTimeType, setResolutionTimeType] = useState<"date" | "days">(
    "date"
  );
  const [daysToResolution, setDaysToResolution] = useState<number>(7);

  // Load categories from contract
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        if (cats && cats.length > 0) {
          setCategories(cats);
          setFormState((prev) => ({ ...prev, category: cats[0] }));
        } else {
          // Fallback categories
          const defaultCategories = [
            "Crypto",
            "Politics",
            "Sports",
            "Finance",
            "Entertainment",
            "Technology",
          ];
          setCategories(defaultCategories);
          setFormState((prev) => ({ ...prev, category: defaultCategories[0] }));
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        const defaultCategories = [
          "Crypto",
          "Politics",
          "Sports",
          "Finance",
          "Entertainment",
          "Technology",
        ];
        setCategories(defaultCategories);
        setFormState((prev) => ({ ...prev, category: defaultCategories[0] }));
      }
    };

    loadCategories();
  }, [getCategories]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formState.title.trim()) {
      errors.title = "Market question is required";
    }

    if (!formState.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formState.category) {
      errors.category = "Category is required";
    }

    if (resolutionTimeType === "date" && !formState.resolutionTime) {
      errors.resolutionTime = "Resolution date is required";
    }

    if (resolutionTimeType === "date") {
      const resolutionDate = new Date(formState.resolutionTime);
      const now = new Date();
      if (resolutionDate <= now) {
        errors.resolutionTime = "Resolution date must be in the future";
      }
    }

    const initialLiquidity = parseFloat(formState.initialLiquidity);
    if (isNaN(initialLiquidity) || initialLiquidity <= 0) {
      errors.initialLiquidity = "Initial liquidity must be a positive number";
    }

    const fee = parseFloat(formState.fee);
    if (isNaN(fee) || fee < 0 || fee > 5) {
      errors.fee = "Fee must be between 0% and 5%";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate resolution time
      let resolutionTimestamp: number;
      if (resolutionTimeType === "date") {
        resolutionTimestamp =
          new Date(formState.resolutionTime).getTime() / 1000;
      } else {
        // Calculate days from now
        resolutionTimestamp =
          Math.floor(Date.now() / 1000) + daysToResolution * 24 * 60 * 60;
      }

      // Use final category (custom or selected)
      const finalCategory =
        formState.category === "Custom" ? customCategory : formState.category;

      const marketParams = {
        question: formState.title,
        category: finalCategory,
        expirationTime: resolutionTimestamp,
        dataFeedId: formState.dataFeedId || "0", // Default to 0 if not provided
        threshold: parseFloat(formState.targetPrice) || 0, // Map targetPrice to threshold
        fee: parseFloat(formState.fee) / 100, // Convert to decimal
      };

      const newMarketAddress = await createMarket(marketParams);

      if (newMarketAddress) {
        // Navigate to the new market with type parameter
        console.log(`Market created: ${newMarketAddress}, redirecting...`);
        router.push(`/markets/${newMarketAddress}?type=prophit`);
      } else {
        // Handle case where address is unexpectedly null/undefined
        throw new Error("Failed to create market or retrieve address");
      }
    } catch (error) {
      console.error("Error creating market:", error);
      setFormErrors({
        submit:
          "Failed to create market. Please check your inputs and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Calculate minimum date for resolution (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <RootLayout>
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Create a New Prediction Market
          </h1>
          <p className="text-muted-foreground">
            Create your own prediction market and let others bet on the outcome.
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <form onSubmit={handleSubmit}>
            {/* Market question */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Market Question
                <span className="text-destructive ml-1">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formState.title}
                onChange={handleInputChange}
                placeholder="e.g., Will Bitcoin exceed $100,000 by the end of 2025?"
                className={`w-full p-3 rounded-md border ${
                  formErrors.title ? "border-destructive" : "border-border"
                } bg-background`}
              />
              {formErrors.title && (
                <p className="text-destructive text-sm mt-1">
                  {formErrors.title}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Frame your question so it can be clearly resolved as Yes or No
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Description
                <span className="text-destructive ml-1">*</span>
              </label>
              <textarea
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Provide details about this market, including how it will be resolved..."
                className={`w-full p-3 rounded-md border ${
                  formErrors.description
                    ? "border-destructive"
                    : "border-border"
                } bg-background`}
              />
              {formErrors.description && (
                <p className="text-destructive text-sm mt-1">
                  {formErrors.description}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Category
                <span className="text-destructive ml-1">*</span>
              </label>
              <select
                name="category"
                value={formState.category}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-md border ${
                  formErrors.category ? "border-destructive" : "border-border"
                } bg-background`}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value="Custom">Custom...</option>
              </select>
              {formState.category === "Custom" && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  className="w-full p-3 rounded-md border border-border bg-background mt-2"
                />
              )}
              {formErrors.category && (
                <p className="text-destructive text-sm mt-1">
                  {formErrors.category}
                </p>
              )}
            </div>

            {/* Resolution Time */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Resolution Time
                <span className="text-destructive ml-1">*</span>
              </label>

              <div className="flex items-center space-x-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="resolutionTimeType"
                    checked={resolutionTimeType === "date"}
                    onChange={() => setResolutionTimeType("date")}
                    className="mr-2"
                  />
                  Specific Date
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="resolutionTimeType"
                    checked={resolutionTimeType === "days"}
                    onChange={() => setResolutionTimeType("days")}
                    className="mr-2"
                  />
                  Days from Now
                </label>
              </div>

              {resolutionTimeType === "date" ? (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <input
                    type="date"
                    name="resolutionTime"
                    value={formState.resolutionTime}
                    onChange={handleInputChange}
                    min={minDate}
                    className={`w-full p-3 rounded-md border ${
                      formErrors.resolutionTime
                        ? "border-destructive"
                        : "border-border"
                    } bg-background`}
                  />
                </div>
              ) : (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <select
                    value={daysToResolution}
                    onChange={(e) =>
                      setDaysToResolution(parseInt(e.target.value))
                    }
                    className="w-full p-3 rounded-md border border-border bg-background"
                  >
                    <option value={1}>1 day</option>
                    <option value={3}>3 days</option>
                    <option value={7}>1 week</option>
                    <option value={14}>2 weeks</option>
                    <option value={30}>1 month</option>
                    <option value={90}>3 months</option>
                    <option value={180}>6 months</option>
                    <option value={365}>1 year</option>
                  </select>
                </div>
              )}

              {formErrors.resolutionTime && (
                <p className="text-destructive text-sm mt-1">
                  {formErrors.resolutionTime}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                When should this market be resolved?
              </p>
            </div>

            {/* Advanced options collapsible section */}
            <div className="mb-6">
              <details className="group">
                <summary className="flex items-center cursor-pointer font-medium mb-2">
                  <span>Advanced Options</span>
                  <div className="ml-2 transition-transform group-open:rotate-180">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </summary>

                <div className="pl-4 border-l border-border mt-4 space-y-4">
                  {/* Data Feed ID (for automated resolution) */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Chainlink Data Feed ID (Optional)
                    </label>
                    <input
                      type="text"
                      name="dataFeedId"
                      value={formState.dataFeedId}
                      onChange={handleInputChange}
                      placeholder="For automated price resolution (e.g. cryptocurrency prices)"
                      className="w-full p-3 rounded-md border border-border bg-background"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use this for automated market resolution based on
                      Chainlink data feeds
                    </p>
                  </div>

                  {/* Target Price (for automated resolution) */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Target Price (Optional)
                    </label>
                    <input
                      type="text"
                      name="targetPrice"
                      value={formState.targetPrice}
                      onChange={handleInputChange}
                      placeholder="Target price for automated resolution"
                      className="w-full p-3 rounded-md border border-border bg-background"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      If using a data feed, specify the target price for YES
                      outcome
                    </p>
                  </div>

                  {/* Initial Liquidity */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Initial Liquidity (ETH)
                    </label>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                      <input
                        type="number"
                        name="initialLiquidity"
                        value={formState.initialLiquidity}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0.01"
                        className={`w-full p-3 rounded-md border ${
                          formErrors.initialLiquidity
                            ? "border-destructive"
                            : "border-border"
                        } bg-background`}
                      />
                    </div>
                    {formErrors.initialLiquidity && (
                      <p className="text-destructive text-sm mt-1">
                        {formErrors.initialLiquidity}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Amount of ETH to seed the market with (minimum 0.01 ETH)
                    </p>
                  </div>

                  {/* Market Fee */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Market Fee (%)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        name="fee"
                        value={formState.fee}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                        max="5"
                        className={`w-full p-3 rounded-md border ${
                          formErrors.fee
                            ? "border-destructive"
                            : "border-border"
                        } bg-background`}
                      />
                      <span className="ml-2">%</span>
                    </div>
                    {formErrors.fee && (
                      <p className="text-destructive text-sm mt-1">
                        {formErrors.fee}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Fee you'll earn from each trade (0-5%)
                    </p>
                  </div>
                </div>
              </details>
            </div>

            {/* Submit error */}
            {formErrors.submit && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive mb-6">
                <p>{formErrors.submit}</p>
              </div>
            )}

            {/* Submit button */}
            <div className="flex justify-end gap-3">
              <Link
                href="/markets"
                className="px-4 py-2 rounded-md border border-border text-foreground"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium flex items-center justify-center min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Market"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-muted p-4 rounded-lg border border-border">
          <div className="flex items-start mb-2">
            <Info className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
            <h3 className="font-medium">About Creating Markets</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground ml-7 list-disc">
            <li>
              Markets must have clear resolution criteria to determine the
              outcome.
            </li>
            <li>
              Initial liquidity is used to seed the market and enable trading.
            </li>
            <li>You will earn trading fees from all trades in your market.</li>
            <li>
              Higher initial liquidity typically results in better price
              stability.
            </li>
            <li>
              Markets with automated resolution via data feeds are resolved
              automatically at the specified date.
            </li>
          </ul>
        </div>
      </div>
    </RootLayout>
  );
}
