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

const ForgeToken = (props: Props) => {
  const { address } = useAccount();
  const [tokenId, setTokenId] = useState(0);

  const { writeContract, isError, isPending, isSuccess } = useWriteContract();

  const handleForge = () => {
    writeContract({
      address: process.env.FORGINGLOGIC_CONTRACT_ADDRESS as `0x${string}`,
      abi: ForgingLogicArtifact.abi,
      functionName: "forge",
      args: [tokenId],
    });
  };

  if (isSuccess) {
    toast({
      title: "Forging successful",
      description: "You have successfully forged a token",
    });
  }

  if (isError) {
    toast({
      title: "Forging failed",
      description: "Check console for details",
    });
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Forge Token (3-6)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="tokenId">Token ID</Label>
          <Input
            id="tokenId"
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(Number(e.target.value))}
            placeholder="Enter ID (3-6)"
          />
        </div>
        <Button onClick={handleForge} disabled={isPending} className="w-full">
          {isPending ? "Forging..." : "Forge"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ForgeToken;
