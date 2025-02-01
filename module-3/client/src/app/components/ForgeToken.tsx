import React, { useState } from "react";
import { useAccount, useContractWrite } from "wagmi";

type Props = {};

const ForgeToken = (props: Props) => {
  const { address } = useAccount();
  const [tokenId, setTokenId] = useState(0);

  const { write: forge } useContractWrite({
    address: "Your contract address",
    abi: ForgingTokenArtifact.abi,
    functionName: "forge",
    args: [tokenId],
    onSuccess: () => {
      alert("Forging sucessful");
    },
    onError: (error) => {
        console.log(error)
        alert("Forging failed. Check console for details.")
    }
  })

  return (
    <div>
      <h2>Forge Token (3-6)</h2>
      <input
        type="number"
        value={tokenId}
        onChange={(e) => setTokenId(Number(e.target.value))}
        placeholder="Token Id (3-6)"
      />
      <button onClick={() => forge()}>Forge</button>
    </div>
  );
};

export default ForgeToken;
