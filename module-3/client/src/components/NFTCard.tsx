"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

type NFTMetadata = {
  name: string;
  image: string;
  rarity: string;
  background: string;
};

type NFTCardProps = {
  tokenId: number;
  count: number;
};

export const NFTCard: React.FC<NFTCardProps> = ({ tokenId, count }) => {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  // Use the same base URI as in your Token contract
  const baseUri =
    "https://ipfs.io/ipfs/bafybeif7ykc3h3r5eo24cpcy2suubbu5ns6k7e6soebqco53gykw6jkqlq/";

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const res = await fetch(`${baseUri}${tokenId}.json`);
        const data = await res.json();
        setMetadata(data);
      } catch (error) {
        console.error("Error fetching metadata for token", tokenId, error);
      }
    }
    fetchMetadata();
  }, [tokenId]);

  if (!metadata) {
    return (
      <div className="w-64 h-80 bg-gray-800 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <Card
      style={{ background: metadata.background || "#fff" }}
      className="w-64 shadow-lg hover:shadow-xl transition-shadow duration-200"
    >
      <div className="p-4">
        <img
          src={metadata.image}
          alt={metadata.name}
          className="w-full h-40 object-cover rounded"
        />
        <h2 className="mt-4 text-lg font-bold">{metadata.name}</h2>
        <p className="text-sm">Rarity: {metadata.rarity}</p>
        <p className="text-sm">Count: {count}</p>
      </div>
    </Card>
  );
};
