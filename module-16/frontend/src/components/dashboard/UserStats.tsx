"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useBalance } from "wagmi";
import { useReadContract } from "wagmi";
import { formatEther, formatUnits } from "viem";
import {
  getContractConfig,
  SEPOLIA_CHAIN_ID,
  LUMINA_COIN_ADDRESS_SEPOLIA,
  COLLATERAL_MANAGER_ADDRESS_SEPOLIA,
} from "@/lib/web3/contracts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { sepolia } from 'wagmi/chains';

const formatAddress = (addr: string | undefined) => {
  if (!addr) return "N/A";
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

export function UserStats() {
  const { address: userAddress, chainId, isConnected } = useAccount();
  const { data: balanceData, isLoading: isLoadingBalance } = useBalance({
    address: userAddress,
    query: {
      enabled: isConnected && !!userAddress,
    },
  });

  const contracts = getContractConfig(chainId);
  const luminaCoinAddress = contracts?.luminaCoin.address ?? LUMINA_COIN_ADDRESS_SEPOLIA;
  const collateralManagerAddress =
    contracts?.collateralManager.address ?? COLLATERAL_MANAGER_ADDRESS_SEPOLIA;

  const {
    data: collateralBalance,
    isLoading: isLoadingCollateral,
    error: errorCollateral,
  } = useReadContract({
    ...contracts?.collateralManager,
    functionName: "collateralBalances",
    args: [userAddress!],
    query: {
      enabled: isConnected && !!userAddress && !!contracts,
    },
  });

  const {
    data: debtBalance,
    isLoading: isLoadingDebt,
    error: errorDebt,
  } = useReadContract({
    ...contracts?.collateralManager,
    functionName: "debtBalances",
    args: [userAddress!],
    query: {
      enabled: isConnected && !!userAddress && !!contracts,
    },
  });

  const {
    data: collateralValueUsd,
    isLoading: isLoadingCollateralValue,
    error: errorCollateralValue,
  } = useReadContract({
    ...contracts?.collateralManager,
    functionName: "getAccountCollateralValue",
    args: [userAddress!],
    query: {
      enabled: isConnected && !!userAddress && !!contracts,
    },
  });

  const {
    data: healthFactor,
    isLoading: isLoadingHealthFactor,
    error: errorHealthFactor,
  } = useReadContract({
    ...contracts?.collateralManager,
    functionName: "getHealthFactor",
    args: [userAddress!],
    query: {
      enabled: isConnected && !!userAddress && !!contracts,
    },
  });

  const {
    data: stakedBalance,
    isLoading: isLoadingStaked,
    error: errorStaked,
  } = useReadContract({
    ...contracts?.stakingPool,
    functionName: "stakedBalances",
    args: [userAddress!],
    query: {
      enabled: isConnected && !!userAddress && !!contracts,
    },
  });

  const {
    data: earnedRewards,
    isLoading: isLoadingRewards,
    error: errorRewards,
  } = useReadContract({
    ...contracts?.stakingPool,
    functionName: "earned",
    args: [userAddress!],
    query: {
      enabled: isConnected && !!userAddress && !!contracts,
    },
  });

  const isLoading =
    isLoadingBalance ||
    isLoadingCollateral ||
    isLoadingDebt ||
    isLoadingCollateralValue ||
    isLoadingHealthFactor ||
    isLoadingStaked ||
    isLoadingRewards;
  const hasError =
    errorCollateral ||
    errorDebt ||
    errorCollateralValue ||
    errorHealthFactor ||
    errorStaked ||
    errorRewards;

  const formatValue = (
    value: bigint | undefined | null,
    decimals = 18,
    suffix = "",
    precision = 4
  ) => {
    if (value === undefined || value === null) return "N/A";
    try {
      const formatted = formatUnits(value, decimals);
      const num = parseFloat(formatted);
      const effectivePrecision = num < 1 ? 6 : precision;
      return `${num.toFixed(effectivePrecision)}${suffix}`;
    } catch (e) {
      console.error("Formatting error:", e);
      return "Error";
    }
  };

  const formatHealthFactor = (hf: bigint | undefined | null) => {
    if (hf === undefined || hf === null) return "N/A";
    if (debtBalance !== undefined && debtBalance === BigInt(0)) return "∞";
    return formatValue(hf, 18, "", 2);
  };

  // --- Debugging Logs ---
  console.log("UserStats Render - isConnected:", isConnected);
  console.log("UserStats Render - isLoading:", isLoading);
  console.log("UserStats Render - healthFactor Raw:", healthFactor);
  console.log("UserStats Render - debtBalance Raw:", debtBalance);
  console.log("UserStats Render - Formatted HF:", formatHealthFactor(healthFactor as bigint));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.3,
        duration: 0.8,
        ease: "easeInOut",
      }}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-white">Your Stats</CardTitle>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <p className="text-zinc-400">
            Connect your wallet to view your stats.
          </p>
        ) : !contracts && chainId !== SEPOLIA_CHAIN_ID ? (
          <p className="text-red-400">
            Unsupported network. Please switch to Sepolia.
          </p>
        ) : isLoading ? (
          <p className="text-zinc-400">Loading stats...</p>
        ) : hasError ? (
          <p className="text-red-400">
            Error fetching stats. Please try again.
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-zinc-400">Network:</span>
              <span className="text-zinc-300">
                {chainId === sepolia.id ? sepolia.name : `Unsupported (ID: ${chainId})`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-zinc-400">Wallet:</span>
              <span className="text-zinc-300" title={userAddress}>
                {formatAddress(userAddress)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-zinc-400">ETH Balance:</span>
              <span className="text-zinc-300">
                {balanceData
                  ? `${parseFloat(formatEther(balanceData.value)).toFixed(4)} ETH`
                  : "N/A"}
              </span>
            </div>

            <hr className="my-3 border-slate-700" />

            <div className="flex justify-between">
              <span className="font-medium text-zinc-400">
                Total Collateral (ETH):
              </span>
              <span className="text-zinc-300">
                {formatValue(collateralBalance as bigint)} ETH
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-zinc-400">
                Collateral Value (USD):
              </span>
              <span className="text-zinc-300">
                $ {formatValue(collateralValueUsd as bigint, 6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-zinc-400">Borrowed (LMC):</span>
              <span className="text-zinc-300">
                {formatValue(debtBalance as bigint)} LMC
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-zinc-400">Health Factor:</span>
              <span className="font-bold text-white">
                {formatHealthFactor(healthFactor as bigint)}
              </span>
            </div>

            <hr className="my-3 border-slate-700" />

            <div className="flex justify-between">
              <span className="font-medium text-zinc-400">
                Total Staked (ETH):
              </span>
              <span className="text-zinc-300">
                {formatValue(stakedBalance as bigint)} ETH
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-zinc-400">
                Earned Rewards (ETH):
              </span>
              <span className="text-zinc-300">
                {formatValue(earnedRewards as bigint)} ETH
              </span>
            </div>

            <hr className="my-3 border-slate-700" />

            <div className="flex justify-between">
              <span className="font-medium text-zinc-400">LMC Contract:</span>
              <span className="text-zinc-300" title={luminaCoinAddress}>
                {formatAddress(luminaCoinAddress)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-zinc-400">Manager Contract:</span>
              <span className="text-zinc-300" title={collateralManagerAddress}>
                {formatAddress(collateralManagerAddress)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </motion.div>
  );
}
