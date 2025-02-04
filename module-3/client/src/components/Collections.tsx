"use client";
import React from "react";
import { NFTCard } from "./NFTCard";
import { useTokenBalances } from "@/hooks/use-token-balances";

const Collections = () => {
  const balances = useTokenBalances();

  return (
    <div className="my-8 w-full">
      <h2 className="text-3xl font-bold mb-4 text-white">Collections</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {balances.map((count, tokenId) => {
          if (count > 0) {
            return <NFTCard key={tokenId} tokenId={tokenId} count={count} />;
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default Collections;
