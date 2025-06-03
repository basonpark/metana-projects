"use client";

import { Token } from "@/lib/tokens";
import Image from "next/image";
import { BlockCountdown } from "./block-countdown";
import { EnrichedBlock } from "@/lib/alchemy";

export const TokenSelector = ({
  tokens,
  selectedToken,
  onSelect,
  latestBlockTimestamp,
  blocks,
}: {
  tokens: Token[];
  selectedToken: Token;
  onSelect: (token: Token) => void;
  latestBlockTimestamp: number;
  blocks: EnrichedBlock[];
}) => (
  <div className="flex items-center justify-between pt-4 px-6 pb-2">
    <div className="flex items-center space-x-4">
      <h2 className="text-xl font-semibold text-slate-100">Recent Blocks</h2>
      <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-sm rounded-lg p-1.5 overflow-x-auto shadow-lg border border-slate-700/30">
        {tokens.map((token: Token) => (
          <button
            key={token.address}
            onClick={() => onSelect(token)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
              selectedToken.address === token.address
                ? "bg-slate-700 text-white shadow-md shadow-slate-900/80 border border-slate-600/50 font-medium"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:shadow-sm"
            }`}
          >
            <div className="relative w-5 h-5">
              <Image
                src={token.icon}
                alt={token.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            </div>
            <span className="text-sm">{token.symbol}</span>
          </button>
        ))}
      </div>
    </div>

    <BlockCountdown
      latestBlockTimestamp={latestBlockTimestamp}
      blocks={blocks}
    />
  </div>
);
