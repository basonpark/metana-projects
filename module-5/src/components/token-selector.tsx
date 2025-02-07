"use client";

import { Token } from "@/lib/tokens";
import Image from "next/image";

export const TokenSelector = ({
  tokens,
  selectedToken,
  onSelect,
}: {
  tokens: Token[];
  selectedToken: Token;
  onSelect: (token: Token) => void;
}) => (
  <div className="flex items-center space-x-4">
    <h2 className="text-xl font-semibold text-gray-800">Recent Blocks</h2>
    <div className="flex items-center space-x-2 bg-slate-800 rounded-lg p-1">
      {tokens.map((token) => (
        <button
          key={token.address}
          onClick={() => onSelect(token)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
            selectedToken.address === token.address
              ? "bg-slate-700 text-slate-100"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Image
            src={token.icon}
            alt={token.name}
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="text-sm font-medium">{token.symbol}</span>
        </button>
      ))}
    </div>
  </div>
);
