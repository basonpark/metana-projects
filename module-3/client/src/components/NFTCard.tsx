"use client";
import React, { useEffect } from "react";
import { useTokenURI } from "@/hooks/use-token-uri";
import { MagicCard } from "@/components/ui/magic-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
  const { uri, isLoading } = useTokenURI(tokenId);
  const [metadata, setMetadata] = React.useState<NFTMetadata | null>(null);

  //fetching metadata from URI
  useEffect(() => {
    if (uri) {
      const fetchMetadata = async () => {
        try {
          const res = await fetch(uri);
          const data = await res.json();
          setMetadata(data);
          console.log("Metadata:", data);
        } catch (error) {
          console.error("Error fetching metadata:", error);
        }
      };
      fetchMetadata();
    }
  }, [uri]);

  if (isLoading || !metadata) {
    return <div>Loading...</div>;
  }

  const baseUri = uri.substring(0, uri.lastIndexOf("/") + 1);
  const imageUrl = `${baseUri}${metadata.image}`;
  //TODO: to be switched back to imgURL only after updated deployment

  const getAttributeValue = (
    traitType: string
  ): string | number | undefined => {
    const attribute = metadata.attributes.find(
      (attr) => attr.trait_type === traitType
    );
    return attribute ? attribute.value : undefined;
  };

  return (
    <Card className="overflow-hidden">
      {metadata.image && (
        <div className="relative w-full h-[280px]">
          <img
            src={imageUrl}
            alt={metadata.name || `Token ${tokenId}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-lg">
          {metadata.name || `Token ${tokenId}`}
        </h3>
        {count !== undefined && (
          <p className="text-sm text-gray-500">Quantity: {count}</p>
        )}
        <div className="mt-2 space-y-1">
          {getAttributeValue("Rarity") && (
            <p className="text-sm">Rarity: {getAttributeValue("Rarity")}</p>
          )}
          {getAttributeValue("Background") && (
            <p className="text-sm">
              Background: {getAttributeValue("Background")}
            </p>
          )}
          {getAttributeValue("Funk Score") && (
            <p className="text-sm">
              Funk Score: {getAttributeValue("Funk Score")}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default NFTCard;
