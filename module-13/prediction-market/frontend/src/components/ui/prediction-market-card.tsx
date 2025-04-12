"use client";

import * as React from "react";
import { Clock, TrendingUp, DollarSign, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

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
  props,
}: PredictionMarketCardProps) {
  // Format liquidity display
  const formattedLiquidity =
    typeof liquidity === "string"
      ? parseFloat(liquidity).toLocaleString()
      : Number(liquidity).toLocaleString();

  // Placeholder for participants - adjust if data becomes available
  const participants = Math.floor(Number(liquidity) / 200); // Example calculation

  return (
    <div
      className={cn(
        "w-full max-w-xl bg-card text-card-foreground overflow-hidden rounded-lg border shadow-sm",
        "transition-all duration-200 ease-in-out hover:shadow-xl hover:-translate-y-1",
        className
      )}
      {...props}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          {image && (
            <div className="relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            {category && (
              <Badge variant="outline" className="mb-1 text-xs font-medium">
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
  );
}
