"use client";
import { useAccount, useReadContract } from "wagmi";
import { useEffect, useState } from "react";
import ForgingLogicArtifact from "@artifacts/contracts/ForgingLogic.sol/ForgingLogic.json";

export function useTokenBalances() {
  const { address } = useAccount();
  // Initialize with BigInt values
  const [balances, setBalances] = useState<number[]>(Array(7).fill(0));

  // Log contract address and user address
  useEffect(() => {
    console.log("Contract Address:", process.env.NEXT_PUBLIC_FORGINGLOGIC_CONTRACT_ADDRESS);
    console.log("User Address:", address);
  }, [address]);

  const { data, isError, isLoading } = useReadContract({
    address: process.env.NEXT_PUBLIC_FORGINGLOGIC_CONTRACT_ADDRESS as `0x${string}`,
    abi: ForgingLogicArtifact.abi,
    functionName: "getAllTokenBalances",
    args: [address],
    query: {
      enabled: Boolean(address),
      refetchInterval: 3000,
    },
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const convertedBalances = data.map((balance: bigint) => Number(balance));
      setBalances(convertedBalances);
      console.log("token balances: ", convertedBalances);
    } 
  }, [data, isLoading, address]);

  useEffect(() => {  
    if (isError) {  
      console.error("Error fetching token balances:", isError);
    }  
  }, [isError]);  

  return balances;
} 