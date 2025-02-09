"use client";

import { EnrichedBlock } from "../lib/alchemy";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

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
}: {
  blocks: EnrichedBlock[];
  formatter?: (value: number) => string;
  pageSize?: number;
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(blocks.length / pageSize);

  const currentBlocks = blocks.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <div className="bg-slate-800 rounded-xl shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700/50">
          <thead className="bg-slate-900/50">
            <tr>
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
          <tbody className="divide-y divide-slate-700/50">
            {currentBlocks.map((block, index) => (
              <tr
                key={block.number}
                className="transition-colors hover:bg-slate-700/30"
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
                  previous={currentBlocks[index + 1]?.gasRatio}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-slate-700/50">
        <div className="flex items-center text-sm text-slate-400">
          Showing blocks {currentPage * pageSize + 1} to{" "}
          {Math.min((currentPage + 1) * pageSize, blocks.length)} of{" "}
          {blocks.length}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className={`p-2 rounded-lg ${
              currentPage === 0
                ? "text-slate-600"
                : "text-slate-300 hover:bg-slate-700/30"
            }`}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-slate-300">
            {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage === totalPages - 1}
            className={`p-2 rounded-lg ${
              currentPage === totalPages - 1
                ? "text-slate-600"
                : "text-slate-300 hover:bg-slate-700/30"
            }`}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
