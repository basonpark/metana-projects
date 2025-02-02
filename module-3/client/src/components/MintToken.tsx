import React, { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import TokenArtifact from "@artifacts/contracts/ForgingLogic.sol/ForgingLogic.json";
import { toast } from "@/hooks/use-toast";

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
    <div>
      <h2>Mint Tokens (0-2) </h2>
      <input
        type="number"
        value={tokenId}
        onChange={(e) => setTokenId(Number(e.target.value))}
        placeholder="Token Id (0-2)"
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Amount"
      />
      <button onClick={handleMint} disabled={isPending}>
        {isPending ? "Minting..." : "Mint"}
      </button>
    </div>
  );
};

export default MintToken;
