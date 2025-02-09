"use client";

import { useBlockData } from "../hooks/use-block-data";
import { BlockChart } from "./block-chart";
import { ClockIcon, SignalIcon } from "@heroicons/react/24/outline";
import { BlockTable } from "./block-table";
import { useCallback, useState } from "react";
import { tokens } from "@/lib/tokens";
import { TokenSelector } from "./token-selector";
import { OrbitingCircles } from "./magicui/orbiting-circles";
import { BorderBeam } from "./magicui/border-beam";
import { TypingAnimation } from "./magicui/typing-animation";

export const Dashboard = () => {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const { blocks, isConnected, error, latestBlockNumber, loadMoreBlocks } =
    useBlockData(selectedToken.address);

  const handleLoadMore = useCallback(async () => {
    if (blocks.length > 0) {
      const oldestBlock = Math.min(...blocks.map((b) => b.number));
      await loadMoreBlocks(oldestBlock - 1);
    }
  }, [blocks, loadMoreBlocks]);

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-slate-700/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-100">
                Ethereum Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {blocks[0] && (
                <div className="flex items-center text-slate-300">
                  <ClockIcon className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">
                    Block #{blocks[blocks.length - 1].number}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/50">
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

      {/* Welcome Message */}
      <div className="relative flex items-center justify-center mt-[120px] mb-16">
        <div className="relative max-w-5xl">
          <BorderBeam
            colorFrom="#FFD700"
            colorTo="#ffffff"
            duration={15}
            size={300}
            borderWidth={2}
          />
          <div className="flex flex-col items-center justify-center p-12">
            <div className="text-slate-100 text-4xl font-bold tracking-tight">
              Welcome to the Ethereum Analytics Dashboard
            </div>
            <div className="text-slate-300/70 text-lg mt-4">
              <TypingAnimation>
                Real-time insights into Ethereum network activity
              </TypingAnimation>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <BlockChart
            title="USDC Transfer Volume"
            description="Total USDC tokens transferred in each block"
            dataKey="transferVolume"
            color="#60a5fa"
            unit=" USDC"
            formatter={(v) => v.toLocaleString()}
            data={blocks}
          />

          <BlockChart
            title="Base Fee"
            description="Minimum gas price required for transaction inclusion"
            dataKey="baseFeeGwei"
            color="#4ade80"
            unit=" Gwei"
            formatter={(v) => v.toFixed(2)}
            data={blocks}
          />

          <BlockChart
            title="Gas Usage Ratio"
            description="Percentage of block gas limit utilized"
            dataKey="gasRatio"
            color="#fbbf24"
            unit="%"
            formatter={(v) => v.toFixed(1)}
            data={blocks}
          />
        </div>

        {/* Block Data Table */}
        <div className="mt-8">
          <TokenSelector
            tokens={tokens}
            selectedToken={selectedToken}
            onSelect={setSelectedToken}
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
      </main>
    </div>
  );
};
