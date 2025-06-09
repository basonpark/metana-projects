"use client";
import React, { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import ForgingLogicArtifact from "@artifacts/contracts/ForgingLogic.sol/ForgingLogic.json";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Props = {};

const TradeToken = (props: Props) => {
  const { address } = useAccount();
  const [fromTokenId, setFromTokenId] = useState(0);
  const [toTokenId, setToTokenId] = useState(0);
  const [amount, setAmount] = useState(1);

  const { writeContract, isError, isPending, isSuccess } = useWriteContract();

  const handleTrade = () => {
    writeContract({
      address: process.env.FORGINGLOGIC_CONTRACT_ADDRESS as `0x${string}`,
      abi: ForgingLogicArtifact.abi,
      functionName: "tradeToken",
      args: [fromTokenId, toTokenId, amount],
    });
  };

  if (isSuccess) {
    toast({
      title: "Trading sucessful",
      description: "You have successfully traded tokens",
    });
  }

  if (isError) {
    toast({
      title: "Trading failed",
      description: "Check console for details",
    });
  }

  return (
    <Card className="w-[350px] shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader>
        <CardTitle>Trade Tokens</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="fromTokenId">From Token ID</Label>
          <Input
            id="fromTokenId"
            type="number"
            onChange={(e) => setFromTokenId(Number(e.target.value))}
            placeholder="0 - 2"
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="toTokenId">To Token ID</Label>
          <Input
            id="toTokenId"
            type="number"
            onChange={(e) => setToTokenId(Number(e.target.value))}
            placeholder="0 - 2"
          />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="0"
          />
        </div>
        <Button onClick={handleTrade} disabled={isPending} className="w-full">
          {isPending ? "Trading..." : "Trade"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TradeToken;
