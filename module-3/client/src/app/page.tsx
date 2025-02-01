import Image from "next/image";
import TokenBalances from "../components/TokenBalances";
import MintToken from "../components/MintToken";
import ForgeToken from "../components/ForgeToken";
import TradeToken from "../components/TradeToken";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 mx-auto p-4 h-screen">
      <h1 className="text-2xl font-bold">
        Welcome to ERC1155 Token Minting and Forging
      </h1>
      <ConnectButton />
      <TokenBalances />
      <MintToken />
      <ForgeToken />
      <TradeToken />
      <a href="https://opensea.io/" target="_blank" rel="noopener noreferrer">
        View onOpenSea
      </a>
    </div>
  );
}
