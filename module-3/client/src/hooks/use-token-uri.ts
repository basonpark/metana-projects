"use client";
import { useReadContract } from "wagmi";
import { useEffect, useState } from "react";
import TokenArtifact from "@artifacts/contracts/Token.sol/Token.json";


export function useTokenURI(tokenId: number) {
  const [uri, setUri] = useState<string>("");

  const { data, isError, isLoading } = useReadContract({
    address: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
    abi: TokenArtifact.abi,
    functionName: "uri",
    args: [tokenId],
  });

  useEffect(() => {
    if (data) {
        const uriString = data as string;
        setUri(uriString);
        console.log("Token URI:", uriString);
    }
    if (isError) {
      console.error("Error fetching token URI");
    }
  }, [data, isError]);

  return { uri, isLoading };
} 