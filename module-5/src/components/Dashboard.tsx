"use client";

import { useBlockData } from "../hooks/use-block-data";
import { BlockChart } from "./block-chart";
import { ClockIcon, SignalIcon } from "@heroicons/react/24/outline";
import { BlockTable } from "./block-table";
import { useCallback, useState } from "react";
import { tokens } from "@/lib/tokens";
import { TokenSelector } from "./token-selector";

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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Ethereum Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {blocks[0] && (
                <div className="flex items-center text-gray-500">
                  <ClockIcon className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">
                    Block #{blocks[blocks.length - 1].number}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-50">
                <SignalIcon
                  className={`w-5 h-5 ${
                    isConnected ? "text-green-500" : "text-yellow-500"
                  }`}
                />
                <span className="text-sm font-medium text-gray-600">
                  {isConnected ? "Connected" : "Connecting..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
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
