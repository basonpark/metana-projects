"use client";
import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import TokenArtifact from "@artifacts/contracts/ForgingLogic.sol/ForgingLogic.json";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RainbowButton } from "@/components/ui/rainbow-button";

type Props = {};

//allows users to mint tokens 0-2
const MintToken = (props: Props) => {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Test toast",
      description: "This is a test toast message",
    });
    console.log("toast");
  }, []);

  const { address } = useAccount();
  const [tokenId, setTokenId] = useState(0);

  const { writeContract, isError, isPending, isSuccess } = useWriteContract();

  const handleMint = () => {
    console.log("Mint button clicked");
    toast({
      title: "Minting tokens",
      description: "Please wait while we process your request",
    });
    if (!address) {
      toast({
        title: "Please connect your wallet",
        description: "You must be connected to the network to mint tokens",
      });
      return;
    }
    writeContract({
      address: process.env.FORGINGLOGIC_CONTRACT_ADDRESS as `0x${string}`,
      abi: TokenArtifact.abi,
      functionName: "mint",
      args: [tokenId, 1],
    });
  };

  if (isSuccess) {
    toast({
      title: "Minting sucessful",
      description: "You have successfully minted tokens",
    });
  }

  if (isError) {
    toast({
      title: "Minting failed",
      description: "Check console for details",
    });
  }

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
