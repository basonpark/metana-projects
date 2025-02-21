"use client";
import React from "react";
import { NFTCard } from "./NFTCard";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Collections() {
  const balances = useTokenBalances();
  const totalNFTs = balances.reduce((acc, count) => acc + count, 0);

  return (
    <Card className="p-2 w-full max-w-7xl mx-auto bg-black/20 backdrop-blur-sm border-slate-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-100">
              My Collection
            </CardTitle>
            <CardDescription className="text-slate-400">
              The funky turtles are in town. Let's go mint, forge, and trade!
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {totalNFTs} Turtles
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ScrollArea className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
            {balances.map(
              (count, index) =>
                count > 0 && (
                  <NFTCard key={index} tokenId={index} count={count} />
                )
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
