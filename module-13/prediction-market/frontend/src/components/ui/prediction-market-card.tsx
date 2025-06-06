"use client";

import * as React from "react";
import { Clock, TrendingUp, DollarSign, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { MarketStatus } from "@/types/market";

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
  image?: string;
  isFeatured?: boolean;
  className?: string;
  origin?: "polymarket" | "prophit";
  status: MarketStatus;
  props?: any;
}

export function PredictionMarketCard({
  id,
  title,
  odds,
  liquidity,
  timeRemaining,
  category,
  image,
  isFeatured = false,
  className,
  origin,
  status,
  props,
}: PredictionMarketCardProps) {
  const formattedLiquidity =
    typeof liquidity === "string"
      ? parseFloat(liquidity).toLocaleString()
      : Number(liquidity).toLocaleString();

  const participants = Math.floor(Number(liquidity) / 200);

  return (
    <Link href={`/markets/${id}`} className="block group">
      <div
        className={cn(
          "w-full max-w-xl bg-card text-card-foreground overflow-hidden rounded-lg border shadow-sm",
          "transition-all duration-200 ease-in-out hover:shadow-xl hover:-translate-y-1",
          className
        )}
        {...props}
      >
        <div className="p-4 space-y-3 relative">
          {origin === "prophit" && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md border-none"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Prophit
            </Badge>
          )}
          <div className="flex items-start gap-3">
            {image && (
              <div className="relative h-30 w-30 overflow-hidden">
                <Image
                  src={image}
                  alt={title}
                  layout="fill"
                  className="w-full h-full object-cover rounded-lg"
                  unoptimized
                />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              {category && (
                <Badge
                  variant="outline"
                  className="mb-1 text-xs font-medium max-w-fit"
                >
                  {category}
                </Badge>
              )}
              <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-3">
                {title}
              </h3>
            </div>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1.5 h-4 w-4 flex-shrink-0" />
            <span>{timeRemaining}</span>
            <Badge
              variant={status === MarketStatus.Open ? "secondary" : "outline"}
              className={`ml-2 text-xs ${
                status === MarketStatus.Open
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              }`}
            >
              {MarketStatus[status] === "Open" ? "Open" : "Ended"}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center text-xs font-medium text-muted-foreground">
              <TrendingUp className="mr-1.5 h-4 w-4" />
              <span>Current Odds</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Yes: {odds.yes}%</span>
              <span className="font-medium">No: {odds.no}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gray-800 dark:bg-gray-200 rounded-l-full"
                style={{ width: `${odds.yes}%` }}
              />
              <div
                className="h-full bg-gray-300 dark:bg-gray-600 rounded-r-full"
                style={{ width: `${odds.no}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-sm pt-1">
            <div className="flex items-center">
              <DollarSign className="mr-1.5 h-4 w-4 text-blue-600" />
              <div>
                <span className="text-xs text-muted-foreground block">
                  Liquidity
                </span>
                <span className="font-medium text-foreground">
                  ${formattedLiquidity}
                </span>
              </div>
            </div>
            <div className="flex items-center text-right">
              <Users className="mr-1.5 h-4 w-4 text-indigo-600" />
              <div>
                <span className="text-xs text-muted-foreground block">
                  Participants
                </span>
                <span className="font-medium text-foreground">
                  {participants} traders
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <Link
              href={`/markets/${id}`}
              className="flex-1 py-2 px-4 text-center rounded-md border-2 border-green-400 bg-green-50 text-green-700 font-bold text-sm hover:bg-green-100 transition-colors flex items-center justify-center"
            >
              Buy Yes <span className="ml-1.5">👍</span>
            </Link>
            <Link
              href={`/markets/${id}`}
              className="flex-1 py-2 px-4 text-center rounded-md border-2 border-red-400 bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center"
            >
              Buy No <span className="ml-1.5">👎</span>
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
}
