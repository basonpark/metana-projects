import React, { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import ForgingLogicArtifact from "@artifacts/contracts/ForgingLogic.sol/ForgingLogic.json";

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
    <div>
      <h2>Token Balances</h2>
      <ul>
        {balances.map((balance, index) => (
          <li key={index}>
            <p>
              Token {index}: {balance.toString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TokenBalances;
