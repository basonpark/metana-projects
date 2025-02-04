"use client";
import { useAccount, useReadContract } from "wagmi";
import { useEffect, useState } from "react";
import ForgingLogicArtifact from "@artifacts/contracts/ForgingLogic.sol/ForgingLogic.json";

export function useTokenBalances() {
  const { address } = useAccount();
  const [balances, setBalances] = useState<number[]>(Array(7).fill(0));

  const { data } = useReadContract({
    address: process.env.FORGINGLOGIC_CONTRACT_ADDRESS as `0x${string}`,
    abi: ForgingLogicArtifact.abi,
    functionName: "getAllTokenBalances",
    args: [address],
    query: {
      enabled: Boolean(address),
      refetchInterval: 3000,
    },
  });

  useEffect(() => {
    if (data) {
      setBalances(data as number[]);
      console.log("token balances: ", data);
    }
  }, [data]);

  return balances;
} 