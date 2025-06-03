"use client";
import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import TokenArtifact from "@artifacts/contracts/Token.sol/Token.json";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RainbowButton } from "@/components/ui/rainbow-button";

type Props = {};

//allows users to mint tokens 0-2
const MintToken = (props: Props) => {
  const { toast } = useToast();
  const { address } = useAccount();
  const [tokenId, setTokenId] = useState(0);

  const { writeContract, isError, isPending, isSuccess, error } =
    useWriteContract();

  // Log contract details on mount
  useEffect(() => {
    console.log("Contract Details:", {
      tokenContractAddress: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS,
      forgingLogicAddress:
        process.env.NEXT_PUBLIC_FORGINGLOGIC_CONTRACT_ADDRESS,
      abi: TokenArtifact.abi,
    });
  }, []);

  // Log state changes
  useEffect(() => {
    console.log("Mint State:", {
      isError,
      isPending,
      isSuccess,
      error,
      address,
      tokenId,
    });
  }, [isError, isPending, isSuccess, error, address, tokenId]);

  useEffect(() => {
    if (isSuccess) {
      console.log("Mint successful!");
      toast({
        title: "Minting successful",
        description: "You have successfully minted tokens",
      });
    }
  }, [isSuccess, toast]);

  useEffect(() => {
    if (isError) {
      console.error("Mint error details:", error);
      toast({
        title: "Minting failed",
        description: "Check console for details",
      });
    }
  }, [isError, error, toast]);

  const handleMint = () => {
    console.log("Mint button clicked");
    if (!address) {
      console.log("No wallet address found");
      toast({
        title: "Please connect your wallet",
        description: "You must be connected to the network to mint tokens",
      });
      return;
    }

    // Add these logs to verify the mint parameters
    console.log("Minting with params:", {
      contractAddress: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS,
      tokenId,
      amount: 1,
      address,
      functionName: "mint",
      abiFunction: TokenArtifact.abi.find((x) => x.name === "mint"),
    });

    try {
      writeContract({
        address: process.env
          .NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
        abi: TokenArtifact.abi,
        functionName: "mint",
        args: [tokenId, 1],
      });
    } catch (e) {
      console.error("Error calling writeContract:", e);
    }
  };

  return (
    <Card className="w-[350px] shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader>
        <CardTitle>Mint Tokens (0-2)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="tokenId">Token ID</Label>
          <Input
            id="tokenId"
            type="number"
            onChange={(e) => setTokenId(Number(e.target.value))}
            placeholder="0 - 2"
          />
        </div>
        <RainbowButton
          onClick={handleMint}
          disabled={isPending}
          className="w-full"
        >
          {isPending ? "Minting..." : "Mint"}
        </RainbowButton>
      </CardContent>
    </Card>
  );
};

export default MintToken;
