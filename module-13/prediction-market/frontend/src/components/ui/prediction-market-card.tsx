"use client";

import * as React from "react";
import { Clock, TrendingUp, DollarSign, Users } from "lucide-react";
import Link from "next/link";

export interface PredictionMarketCardProps {
  id: string | number;
  title: string;
  odds: {
    yes: number;
    no: number;
  };
  liquidity: string | number;
  timeRemaining: string;
  category?: string;
  isFeatured?: boolean;
}

export function PredictionMarketCard({
  id,
  title,
  odds,
  liquidity,
  timeRemaining,
  category,
  isFeatured = false,
}: PredictionMarketCardProps) {
  // Format liquidity display
  const formattedLiquidity =
    typeof liquidity === "string"
      ? parseFloat(liquidity).toLocaleString()
      : liquidity.toLocaleString();

  return (
    <div
      className={`w-full rounded-lg border ${
        isFeatured ? "border-primary" : "border-border"
      } bg-background shadow-sm transition-all hover:shadow-md`}
    >
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          {category && (
            <div className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
              {category}
            </div>
          )}
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 min-h-[56px]">
            {title}
          </h3>

          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            <span>{timeRemaining}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center text-sm font-medium">
              <TrendingUp className="mr-1 h-4 w-4 text-primary" />
              <span>Current Odds</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground">Yes: {odds.yes}%</span>
              <span className="text-foreground">No: {odds.no}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${odds.yes}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center text-sm font-medium">
                <DollarSign className="mr-1 h-4 w-4 text-blue-500" />
                <span>Liquidity</span>
              </div>
              <div className="text-sm text-foreground">
                ${formattedLiquidity}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm font-medium">
                <Users className="mr-1 h-4 w-4 text-indigo-500" />
                <span>Participants</span>
              </div>
              <div className="text-sm text-foreground">
                {typeof liquidity === "string"
                  ? Math.floor(parseFloat(liquidity) / 200)
                  : Math.floor(Number(liquidity) / 200)}{" "}
                traders
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <Link
            href={`/markets/${id}`}
            className="flex-1 py-2 px-4 text-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Trade Now
          </Link>
          <Link
            href={`/markets/${id}`}
            className="flex-1 py-2 px-4 text-center rounded-md border border-border bg-background hover:bg-muted transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
