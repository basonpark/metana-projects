"use client";

import { EnrichedBlock } from "../lib/alchemy";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Token } from "@/lib/tokens";

const GasChangeCell = ({
  current,
  previous,
}: {
  current: number;
  previous?: number;
}) => {
  if (!previous) return null;

  const change = ((current - previous) / previous) * 100;
  const isPositive = change > 0;

  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm ${
        isPositive ? "text-emerald-400" : "text-rose-400"
      }`}
    >
      {isPositive ? "+" : ""}
      {change.toFixed(2)}%
    </td>
  );
};

export const BlockTable = ({
  blocks,
  formatter = (v: number) => v.toFixed(2),
  pageSize = 10,
  onLoadMore,
  selectedToken,
}: {
  blocks: EnrichedBlock[];
  formatter?: (value: number) => string;
  pageSize?: number;
  onLoadMore: () => Promise<void>;
  selectedToken: Token;
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [newestBlockNumber, setNewestBlockNumber] = useState<number | null>(
    null
  );
  const totalPages = Math.ceil(blocks.length / pageSize);

  const currentBlocks = blocks.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // Track the newest block for animation
  useEffect(() => {
    if (blocks.length > 0) {
      // Find the highest block number (newest block)
      const highestBlockNumber = Math.max(...blocks.map((b) => b.number));

      // Only set as newest if it's a new block we haven't seen before
      if (highestBlockNumber !== newestBlockNumber) {
        setNewestBlockNumber(highestBlockNumber);

        // Clear the newest block highlight after 5 seconds
        const timer = setTimeout(() => {
          setNewestBlockNumber(null);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [blocks, newestBlockNumber]);

  // Check if we need to load more blocks when approaching the end
  useEffect(() => {
    const loadMoreIfNeeded = async () => {
      // If we're on the last or second-to-last page, load more blocks
      if (currentPage >= totalPages - 2 && blocks.length > 0 && !isLoading) {
        setIsLoading(true);
        try {
          await onLoadMore();
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMoreIfNeeded();
  }, [currentPage, totalPages, blocks.length, onLoadMore, isLoading]);

  // Handle next page navigation with loading capability
  const handleNextPage = async () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    } else if (!isLoading) {
      // If we're on the last page, try to load more blocks first
      setIsLoading(true);
      try {
        await onLoadMore();
        // Only advance the page if we successfully loaded more blocks
        if (totalPages > currentPage + 1) {
          setCurrentPage((p) => p + 1);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Get the index of the block in the full blocks array, not just currentBlocks
  const getBlockIndex = (blockNumber: number) => {
    return blocks.findIndex((b) => b.number === blockNumber);
  };

  return (
    <div className="overflow-hidden">
      {/* Add the animation styles */}
      <style jsx>{`
        @keyframes fadeOutBorder {
          0% {
            box-shadow: 0 0 10px 2px rgba(255, 203, 154, 1);
            border: 1px solid rgba(255, 203, 154, 1);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 203, 154, 0);
            border: 1px solid rgba(255, 203, 154, 0);
          }
        }

        .newest-block {
          position: relative;
          animation: fadeOutBorder 5s ease-out forwards;
          border: 1px solid rgba(255, 203, 154, 1);
        }
      `}</style>

      <div className="rounded-xl shadow-lg overflow-hidden border border-slate-700/30 bg-gradient-to-b from-slate-800/50 to-slate-900/50 shadow-[inset_0_1px_5px_rgba(255,255,255,0.05)]">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-slate-900 to-slate-800">
              <tr className="border-b border-slate-700/30">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Block Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Base Fee (Gwei)
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Gas Used
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Gas Limit
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Usage %
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Usage Change
                </th>
              </tr>
            </thead>
            <tbody>
              {currentBlocks.map((block, index) => {
                // Find the index of this block in the full blocks array
                const blockIndex = getBlockIndex(block.number);
                // Get the previous block for gas change calculation
                const previousBlock = blocks[blockIndex + 1];

                // Check if this is the newest block
                const isNewestBlock =
                  block.number === newestBlockNumber && currentPage === 0;

                return (
                  <tr
                    key={block.number}
                    className={`transition-colors hover:bg-slate-800/70 ${
                      index % 2 === 0 ? "bg-slate-900/40" : "bg-slate-900/70"
                    } ${isNewestBlock ? "newest-block" : ""}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                      {block.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {new Date(block.timestamp * 1000).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {formatter(block.transferVolume)} USDC
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {formatter(block.baseFeeGwei)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {Number(block.gasUsed).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {Number(block.gasLimit).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {formatter(block.gasRatio)}%
                    </td>
                    <GasChangeCell
                      current={block.gasRatio}
                      previous={previousBlock?.gasRatio}
                    />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Updated pagination controls */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center text-sm text-slate-400">
            Showing blocks {currentPage * pageSize + 1} to{" "}
            {Math.min((currentPage + 1) * pageSize, blocks.length)} of{" "}
            {blocks.length}
            {isLoading && (
              <span className="ml-2 text-amber-400">Loading more...</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className={`p-2 rounded-lg transition-all duration-200 ${
                currentPage === 0
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-300 hover:bg-slate-700 hover:text-[#FFCB9A]"
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <span className="text-slate-300 bg-slate-800/70 px-3 py-1 rounded-md border border-slate-700/50">
              {currentPage + 1} of {Math.max(1, totalPages)}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1 && isLoading}
              className={`p-2 rounded-lg transition-all duration-200 ${
                currentPage === totalPages - 1 && isLoading
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-300 hover:bg-slate-700 hover:text-[#FFCB9A]"
              }`}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
