"use client";
import React, { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import TokenArtifact from "@artifacts/contracts/ForgingLogic.sol/ForgingLogic.json";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Props = {};

//allows users to mint tokens 0-2
const MintToken = (props: Props) => {
  const { address } = useAccount();
  const [tokenId, setTokenId] = useState(0);
  const [amount, setAmount] = useState(0);

  const { writeContract, isError, isPending, isSuccess } = useWriteContract();

  const handleMint = () => {
    writeContract({
      address: process.env.FORGINGLOGIC_CONTRACT_ADDRESS as `0x${string}`,
      abi: TokenArtifact.abi,
      functionName: "mint",
      args: [tokenId, amount],
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
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Mint Tokens (0-2)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="tokenId">Token ID</Label>
          <Input
            id="tokenId"
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(Number(e.target.value))}
            placeholder="Enter ID (0-2)"
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Amount"
          />
        </div>
        <Button onClick={handleMint} disabled={isPending} className="w-full">
          {isPending ? "Minting..." : "Mint"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MintToken;
