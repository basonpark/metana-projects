"use client";
import React, { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import ForgingLogicArtifact from "@artifacts/contracts/ForgingLogic.sol/ForgingLogic.json";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Props = {};

const TokenBalances = (props: Props) => {
  const { address } = useAccount();
  const [balances, setBalances] = useState<number[]>([]);

  const { data } = useReadContract({
    address: process.env.FORGINGLOGIC_CONTRACT_ADDRESS as `0x${string}`,
    abi: ForgingLogicArtifact.abi,
    functionName: "getAllTokenBalances",
    args: [address],
    query: {
      refetchInterval: 2000, // Refetch every 2 seconds
    },
  });

  useEffect(() => {
    if (data) {
      setBalances(data as number[]);
    }
  }, [data]);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Token Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {balances.map((balance, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 rounded-lg bg-secondary"
            >
              <span className="font-medium">Token {index}</span>
              <span className="font-bold">{balance.toString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenBalances;
