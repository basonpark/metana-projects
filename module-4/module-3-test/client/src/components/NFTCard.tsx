"use client";
import React, { useEffect } from "react";
import { useTokenURI } from "@/hooks/use-token-uri";
import { Star, StarHalf } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";

type NFTAttribute = {
  trait_type: string;
  value: string | number;
};

type NFTMetadata = {
  name: string;
  image: string;
  attributes: NFTAttribute[];
};

type NFTCardProps = {
  tokenId: number;
  count: number;
};

export const NFTCard = ({ tokenId, count }: NFTCardProps) => {
  const IPFS_GATEWAY = "https://ipfs.io/ipfs/";
  const { uri, isLoading } = useTokenURI(tokenId);
  const [metadata, setMetadata] = React.useState<NFTMetadata | null>(null);

  //fetching metadata from URI
  useEffect(() => {
    if (uri) {
      const fetchMetadata = async () => {
        try {
          const fullUri = `${IPFS_GATEWAY}${uri}`;
          console.log("Full URI:", fullUri);
          const res = await fetch(fullUri);
          const data = await res.json();
          setMetadata(data);
          console.log("Metadata:", metadata);
        } catch (error) {
          console.error("Error fetching metadata:", error);
        }
      };
      fetchMetadata();
    }
  }, [uri]);

  if (isLoading || !metadata) {
    return <div className="text-slate-400 text-center">Loading...</div>;
  }

  const getAttributeValue = (
    traitType: string
  ): string | number | undefined => {
    const attribute = metadata.attributes.find(
      (attr) => attr.trait_type === traitType
    );
    return attribute ? attribute.value : undefined;
  };

  return (
    <Card className="overflow-hidden border-slate-800 bg-black/20 backdrop-blur-sm">
      {metadata.image && (
        <div className="relative w-full h-[280px]">
          <img
            src={metadata.image}
            alt={metadata.name || `Token ${tokenId}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="font-bold text-lg text-slate-100">
          {metadata.name || `Token ${tokenId}`}
        </h3>
        {count !== undefined && (
          <p className="text-sm text-slate-400">Quantity: {count}</p>
        )}
        <div className="mt-2 space-y-1">
          {getAttributeValue("Rarity") && (
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-slate-200">Rarity:</span>{" "}
              {getAttributeValue("Rarity")}
            </p>
          )}
          {getAttributeValue("Background") && (
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-slate-200">Background:</span>{" "}
              {getAttributeValue("Background")}
            </p>
          )}
          {getAttributeValue("Funk Score") && (
            <div className="text-sm text-slate-300">
              <span className="font-semibold text-slate-200">Funk Score:</span>{" "}
              <StarRating score={Number(getAttributeValue("Funk Score"))} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default NFTCard;
