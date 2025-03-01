import { Web3Provider } from "./context/Web3Context";
import NFTMinter from "./components/NFTMinter";

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12">
      <header className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="heading-xl mb-4 text-[#22223B]">MonkeyMind</h1>
        <p className="body-lg text-[#4A4E69] max-w-2xl mx-auto">
          A cutting-edge NFT collection featuring Merkle Tree Airdrops,
          Commit-Reveal mechanism, and Multicall support for efficient minting.
        </p>
      </header>

      <Web3Provider>
        <NFTMinter />
      </Web3Provider>

      <footer className="max-w-3xl mx-auto mt-16 pt-8 border-t border-[#C9ADA7]/30 text-center text-[#9A8C98]">
        <p className="body-sm">Built with Solidity & Next.js</p>
      </footer>
    </main>
  );
}
