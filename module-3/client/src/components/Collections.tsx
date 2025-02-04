"use client";
import React from "react";
import { NFTCard } from "./NFTCard";
import { useTokenBalances } from "@/hooks/use-token-balances";

export default function Collections() {
  const balances = useTokenBalances();

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-300">
        Your Collection
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {balances.map(
          (count, index) =>
            count > 0 && <NFTCard key={index} tokenId={index} count={count} />
        )}
      </div>
    </div>
  );
}
