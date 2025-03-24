"use client";

import * as React from "react";
import { Clock, TrendingUp, DollarSign, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  className?: string;
  props?: any;
}

export function PredictionMarketCard({
  id,
  title,
  odds,
  liquidity,
  timeRemaining,
  category,
  isFeatured = false,
  className,
  props,
}: PredictionMarketCardProps) {
  // Format liquidity display
  const formattedLiquidity =
    typeof liquidity === "string"
      ? parseFloat(liquidity).toLocaleString()
      : liquidity.toLocaleString();

  return (
    <div
      className={cn(
        "w-full max-w-xl bg-card text-card-foreground overflow-hidden rounded-lg border shadow-lg hover:shadow-xl transition-shadow duration-300",
        className
      )}
      {...props}
    >
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          {category && (
            <div className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
              {category}
            </div>
          )}
          <h3 className="text-lg leading-relaxed font-semibold text-foreground line-clamp-2 min-h-[60px] font-regular tracking-wide">
            {title}
          </h3>

          <div className="flex items-center text-sm text-muted-foreground font-light">
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
            <div className="flex justify-between text-sm font-light">
              <span className="text-foreground">Yes: {odds.yes}%</span>
              <span className="text-foreground">No: {odds.no}%</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden flex">
              <div
                className="h-full bg-primary rounded-l-full"
                style={{ width: `${odds.yes}%` }}
              />
              <div
                className="h-full bg-muted-foreground/30 rounded-r-full"
                style={{ width: `${odds.no}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center text-sm font-medium">
                <DollarSign className="mr-1 h-4 w-4 text-blue-500" />
                <span>Liquidity</span>
              </div>
              <div className="text-sm text-foreground font-light">
                ${formattedLiquidity}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm font-medium">
                <Users className="mr-1 h-4 w-4 text-indigo-500" />
                <span>Participants</span>
              </div>
              <div className="text-sm text-foreground font-light">
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
            className="flex-1 py-2 px-4 text-center rounded-md bg-green-50 border-2 border-green-300 text-green-600 font-bold hover:bg-green-200 transition-colors flex items-center justify-center"
          >
            Buy Yes <span className="ml-1">👍</span>
          </Link>
          <Link
            href={`/markets/${id}`}
            className="flex-1 py-2 px-4 text-center rounded-md bg-red-50 border-2 border-red-300 text-red-600 font-bold hover:bg-red-200 transition-colors flex items-center justify-center"
          >
            Buy No <span className="ml-1">👎</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
