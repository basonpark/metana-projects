import React, { useState } from "react";
import { useAccount, useContractWrite } from "wagmi";
import { ethers } from "ethers";
type Props = {};

//allows users to mint tokens 0-2
const MintToken = (props: Props) => {
  const { address } = useAccount();
  const [tokenId, setTokenId] = useState(0);
  const [amount, setAmount] = useState(0);

  const { write: mint } = useContractWrite({
    address: "Your contract address",
    abi: TokenArtifact.abi,
    functionName: "mint",
    args: [tokenId, amount],
    onSuccess: () => {
      alert("Minting sucessful");
    },
    onError: (error) => {
      console.error(error);
      alert("Minting failed. Check console for details.");
    },
  });

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
      <button onClick={() => mint()}>Mint</button>
    </div>
  );
};

export default MintToken;
