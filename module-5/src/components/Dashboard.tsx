"use client";

import { useBlockData } from "../hooks/use-block-data";
import { BlockChart } from "./block-chart";
import { ClockIcon, SignalIcon } from "@heroicons/react/24/outline";
import { BlockTable } from "./block-table";
import { useCallback, useState } from "react";
import { tokens } from "@/lib/tokens";
import { TokenSelector } from "./token-selector";
import { TypingAnimation } from "./magicui/typing-animation";
import { BorderBeam } from "./magicui/border-beam";
import { BlockCountdown } from "./block-countdown";
import { EtherlensLogo } from "./Logo";
import Link from "next/link";

export const Dashboard = () => {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const { blocks, isConnected, error, latestBlockNumber, loadMoreBlocks } =
    useBlockData(selectedToken.address);

  const handleLoadMore = useCallback(async () => {
    if (blocks.length > 0) {
      const oldestBlock = Math.min(...blocks.map((b) => b.number));
      await loadMoreBlocks(oldestBlock - 1, selectedToken.address);
    }
  }, [blocks, loadMoreBlocks, selectedToken.address]);

  return (
    <>
      <div className="min-h-screen">
        <nav className="sticky top-0 z-50 bg-slate-900/70 backdrop-blur-lg border-b border-slate-700/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/">
                  <div className="flex items-center space-x-2">
                    <EtherlensLogo className="h-8 w-8" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      Etherlens
                    </h1>
                  </div>
                </Link>

                <div className="hidden md:flex space-x-6">
                  <a
                    href="/"
                    className="text-slate-200 hover:text-white px-3 py-2 rounded-md text-md font-medium border-b-2 border-amber-500"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/about"
                    className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-md  font-medium hover:border-b-2 hover:border-amber-500 transition-all"
                  >
                    About
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {blocks[0] && (
                  <>
                    <div className="flex items-center text-slate-300">
                      <ClockIcon className="w-5 h-5 mr-1 text-[#FFCB9A]" />
                      <span className="text-sm font-medium">
                        Block #{blocks[blocks.length - 1].number}
                      </span>
                    </div>
                    <BlockCountdown
                      latestBlockTimestamp={blocks[blocks.length - 1].timestamp}
                      blocks={blocks}
                      variant="minimal"
                    />
                  </>
                )}
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 shadow-inner">
                  <SignalIcon
                    className={`w-5 h-5 ${
                      isConnected ? "text-emerald-400" : "text-amber-400"
                    }`}
                  />
                  <span className="text-sm font-medium text-slate-300">
                    {isConnected ? "Connected" : "Connecting..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="relative flex items-center justify-center py-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#1A1718] to-[#1E1A1B] opacity-90"></div>

            <img
              src="/ethereum-network-bg.png"
              alt="Ethereum Network Visualization"
              className="absolute inset-0 w-full h-full object-cover opacity-35 bg-animation"
              style={{ filter: "saturate(100%) brightness(0.9)" }}
            />
          </div>

          <div className="relative z-10 max-w-5xl px-6">
            <div
              className="relative p-12 rounded-xl border-3 border-[#FFCB9A]"
              style={{
                background: "transparent",
                borderImage:
                  "linear-gradient(90deg, #FFD700, #FFCB9A, #FFD700) 1",
                boxShadow: "0 0 70px rgba(255, 203, 154, 1)",
              }}
            >
              <h1 className="text-[#FFCB9A] text-5xl font-bold tracking-tight bg-transparent mb-4 text-center">
                Welcome to the
                <br />
                Ethereum Analytics Dashboard
              </h1>
              <div className="w-full flex justify-center">
                <div className="text-slate-100 text-2xl mt-4 max-w-2xl text-center h-[60px] flex items-center text-bold justify-center mx-auto">
                  <TypingAnimation>
                    Real-time insights into Ethereum network activity with
                    advanced visualizations
                  </TypingAnimation>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700/50 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="rounded-xl overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.4)] border border-slate-700/30 transition-all hover:shadow-[0_15px_25px_rgba(0,0,0,0.5)]">
              <BlockChart
                title="USDC Transfer Volume"
                description="Total USDC tokens transferred in each block"
                dataKey="transferVolume"
                color="#FFCB9A"
                unit=" USDC"
                formatter={(v) => v.toLocaleString()}
                data={blocks}
                chartType="bar"
              />
            </div>

            <div className="rounded-xl overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.4)] border border-slate-700/30 transition-all hover:shadow-[0_15px_25px_rgba(0,0,0,0.5)]">
              <BlockChart
                title="Base Fee"
                description="Minimum gas price required for transaction inclusion"
                dataKey="baseFeeGwei"
                color="#FFCB9A"
                unit=" Gwei"
                formatter={(v) => v.toFixed(2)}
                data={blocks}
              />
            </div>

            <div className="rounded-xl overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.4)] border border-slate-700/30 transition-all hover:shadow-[0_15px_25px_rgba(0,0,0,0.5)]">
              <BlockChart
                title="Gas Usage Ratio"
                description="Percentage of block gas limit utilized"
                dataKey="gasRatio"
                color="#FFCB9A"
                unit="%"
                formatter={(v) => v.toFixed(1)}
                data={blocks}
              />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-700/40">
            <TokenSelector
              tokens={tokens}
              selectedToken={selectedToken}
              onSelect={setSelectedToken}
              latestBlockTimestamp={
                blocks.length > 0 ? blocks[blocks.length - 1].timestamp : 0
              }
              blocks={blocks}
            />
            <BlockTable
              blocks={blocks}
              formatter={(v) =>
                v.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })
              }
              onLoadMore={handleLoadMore}
              selectedToken={selectedToken}
            />
          </div>

          <div className="py-16"></div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes zoom {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.5);
          }
        }

        .bg-animation {
          animation: zoom 20s infinite ease-in-out;
          transform-origin: center;
        }
      `}</style>
    </>
  );
};
