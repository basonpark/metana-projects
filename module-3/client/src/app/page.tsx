import Image from "next/image";
import TokenBalances from "@/components/TokenBalances";
import TradeToken from "@/components/TradeToken";
import MintToken from "@/components/MintToken";
import ForgeToken from "@/components/ForgeToken";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { AuroraText } from "@/components/ui/aurora-text";

export default function Home() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-10 mx-auto p-4 min-h-screen
      bg-gradient-to-br from-black via-purple-700 to-black
      animate-gradient-xy
    "
    >
      <h1 className="text-3xl font-bold text-white/90">
        Welcome to <AuroraText>ERC1155 Token Minting and Forging</AuroraText>
      </h1>
      <ConnectButton />
      <TokenBalances />
      <div className="flex gap-12 flex-wrap justify-center">
        <div className="flex flex-col gap-12">
          <MintToken />
          <ForgeToken />
        </div>
        <TradeToken />
      </div>
      <Button asChild className="bg-[#2081e2] hover:bg-[#1868b7] text-white">
        <a
          href="https://opensea.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          View on OpenSea
        </a>
      </Button>
    </div>
  );
}
