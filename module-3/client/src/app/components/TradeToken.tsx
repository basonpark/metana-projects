import React, { useState } from "react";
import { useAccount, useContractWrite } from "wagmi";

type Props = {};

const TradeToken = (props: Props) => {
  const { address } = useAccount();
  const [fromTokenId, setFromTokenId] = useState(0);
  const [toTokenId, setToTokenId] = useState(0);
  const [amount, setAmount] = useState(1);

  const { write: trade } = useContractWrite({
    address: "Your contract address",
    abi: TokenArtifact.abi,
    functionName: "tradeToken",
    args: [fromTokenId, toTokenId, amount],
    onSuccess: () => {
      alert("Trading sucessful");
    },
  });

  return (
    <div>
      <h2>Trade Tokens</h2>
      <input
        type="number"
        value={fromTokenId}
        onChange={(e) => setFromTokenId(Number(e.target.value))}
        placeholder="From Token Id (0-2)"
      />
      <input
        type="number"
        value={toTokenId}
        onChange={(e) => setToTokenId(Number(e.target.value))}
        placeholder="To Token Id (0-2)"
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Amount"
      />
      <button onClick={() => trade()}>Trade</button>
    </div>
  );
};

export default TradeToken;
