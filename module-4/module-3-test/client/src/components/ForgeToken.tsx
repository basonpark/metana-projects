import React, { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import ForgingLogicArtifact from "@artifacts/contracts/ForgingLogic.sol/ForgingLogic.json";
import { toast } from "@/hooks/use-toast";

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
    <div>
      <h2>Forge Token (3-6)</h2>
      <input
        type="number"
        value={tokenId}
        onChange={(e) => setTokenId(Number(e.target.value))}
        placeholder="Token Id (3-6)"
      />
      <button onClick={handleForge} disabled={isPending}>
        {isPending ? "Forging..." : "Forge"}
      </button>
    </div>
  );
};

export default ForgeToken;
