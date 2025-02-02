import React, { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import ForgingLogicArtifact from "@artifacts/contracts/ForgingLogic.sol/ForgingLogic.json";
import { toast } from "@/hooks/use-toast";

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
      s,
    });
  }

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
      <button onClick={handleTrade} disabled={isPending}>
        {isPending ? "Trading..." : "Trade"}
      </button>
    </div>
  );
};

export default TradeToken;
