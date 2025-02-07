"use client";

import { useBlockData } from "../hooks/use-block-data";
import { BlockChart } from "./block-chart";
import { ClockIcon, SignalIcon } from "@heroicons/react/24/outline";

export const Dashboard = () => {
  const { blocks, isConnected, error } = useBlockData();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Ethereum Network Analytics
          </h1>
          {blocks[0] && (
            <div className="mt-2 flex items-center text-gray-500">
              <ClockIcon className="w-5 h-5 mr-1" />
              <span className="text-sm">
                Latest block: #{blocks[blocks.length - 1].number}
              </span>
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <SignalIcon
            className={`w-6 h-6 ${
              isConnected ? "text-green-500" : "text-yellow-500"
            }`}
          />
          <span className="text-sm">
            {isConnected ? "Connected" : "Connecting..."}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BlockChart
          title="ERC20 Transfer Volume"
          dataKey="transferVolume"
          color="#6366f1"
          unit=" USDC"
          formatter={(v) => v.toLocaleString()}
          data={blocks}
        />

        <BlockChart
          title="Base Fee"
          dataKey="baseFeeGwei"
          color="#10b981"
          unit=" Gwei"
          formatter={(v) => v.toFixed(2)}
          data={blocks}
        />

        <BlockChart
          title="Gas Usage Ratio"
          dataKey="gasRatio"
          color="#f59e0b"
          unit="%"
          formatter={(v) => v.toFixed(1)}
          data={blocks}
        />
      </div>
    </div>
  );
};
