import React, { useState, useEffect } from "react";
import { useAccount, useContractRead } from "wagmi";

type Props = {};

const TokenBalances = (props: Props) => {
  const { address } = useAccount();
  const [balances, setBalances] = useState([]);

  const { data } = useContractRead({
    address: "Your forging contract address",
    abi: ForgingTokenArtifact.abi,
    functionName: "getAllTokenBalances",
    args: [address],
    watch: true,
  });

  useEffect(() => {
    if (data) {
      setBalances(data);
    }
  }, [data]);

  return (
    <div>
      <h2>Token Balances</h2>
      <ul>
        {balances.map((balance, index) => (
          <li key={index}>
            <p>
              Token {index}: {balance}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TokenBalances;
