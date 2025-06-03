"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';

// Define the structure for Vault data
export interface VaultData {
  id: string;
  name: string;
  description: string;
  apy: number;
  apyHistory?: number[]; // Optional for chart
  tvl: number;
  assets: string[]; // Asset symbols like "USDC", "DAI"
  riskLevel: "Low" | "Medium" | "High";
  contractAddress: string; // Placeholder for contract interaction
}

interface VaultCardProps {
  vault: VaultData;
}

// Utility to get Tailwind color classes based on risk level - UPDATED COLORS
const getRiskColorClasses = (riskLevel: "Low" | "Medium" | "High") => {
  switch (riskLevel) {
    case "Low": // Lighter Teal/Cyan
      return "border-teal-500/50 text-teal-300 bg-teal-950/40";
    case "Medium": // More Vibrant Cyan
      return "border-cyan-500/60 text-cyan-300 bg-cyan-900/50";
    case "High": // Orange (kept)
      return "border-orange-500/50 text-orange-400 bg-orange-950/30";
    default:
      return "border-slate-600 text-slate-400 bg-slate-950/30";
  }
};

// Basic chart placeholder component (replace with actual Recharts later)
const MiniApyChart = ({ data }: { data?: number[] }) => {
  if (!data || data.length < 2) {
    return (
      <div className="h-10 text-xs text-muted-foreground flex items-center justify-center">
        APY trend unavailable
      </div>
    );
  }
  // Basic visual representation (non-functional chart)
  const isTrendingUp = data[data.length - 1] > data[0];
  return (
    <div className="h-10 flex items-center space-x-1 text-xs text-muted-foreground">
      <TrendingUp
        size={14}
        className={cn(
          isTrendingUp ? "text-green-500" : "text-red-500",
          !isTrendingUp && "rotate-90"
        )}
      />
      <span>{isTrendingUp ? "Trending Up" : "Trending Down"}</span>
    </div>
  );
};

export function VaultCard({ vault }: VaultCardProps) {
  // Placeholder handlers
  const router = useRouter();

  const handleDeposit = () => {
    console.log("Navigating to deposit page for vault:", vault.id);
    router.push(`/vaults/${vault.id}`);
  };

  const handleWithdraw = () => {
    console.log(
      "Withdraw action triggered for vault:",
      vault.id,
      vault.contractAddress
    );
    // TODO: Implement withdraw logic
  };

  // Format currency - keeping the existing function
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get badge colors
  const riskColors = getRiskColorClasses(vault.riskLevel);

  return (
    // Wrap the Card with motion.div to apply hover effects
    <motion.div
      className="h-full" // Ensure motion div takes full height if Card was h-full
      whileHover={{ scale: 1.05, y: -8 }} // Apply scale and lift on hover
      transition={{ type: "spring", stiffness: 300, damping: 20 }} // Smooth spring transition for hover
    >
      <Card
        className={cn(
          "h-full", // Ensure card takes full height of the motion div
          // Updated Background Gradient
          "bg-gradient-to-br from-slate-600/70 via-neutral-950/80 to-slate-800",
          "border border-white/15 backdrop-blur-lg",
          "flex flex-col transition-shadow duration-300", 
          "shadow-[0_10px_25px_-8px_rgba(0,0,0,0.5)] dark:shadow-[0_10px_30px_-10px_rgba(0,220,255,0.30)]",
          // REMOVED specific hover classes like hover:-translate-y-X as motion handles lift
          // You could add hover:shadow-cyan-300/50 here if you want shadow change via Tailwind on hover
        )}
      >
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-lg text-white">{vault.name}</CardTitle>
            {/* Apply updated risk colors directly */}
            <Badge
              variant="outline"
              className={cn("text-xs font-medium px-2 py-0.5", riskColors)}
            >
              {vault.riskLevel} Risk
            </Badge>
          </div>
          <CardDescription className="text-sm text-slate-400 line-clamp-2">
            {vault.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 pt-2">
          {/* APY and TVL */}
          <div className="flex justify-between items-baseline">
            <span className="text-slate-400 text-sm">APY</span>
            {/* APY Gradient */}
            <span className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {vault.apy.toFixed(2)}%
            </span>
          </div>
          {/* TVL & Assets Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                TVL
              </p>
              <p className="text-lg font-medium text-white">
                {formatCurrency(vault.tvl)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Assets
              </p>
              {/* Basic asset display - could use icons later */}
              <div className="flex flex-wrap gap-1">
                {vault.assets.map((asset: string) => (
                  <Badge
                    key={asset}
                    variant="secondary"
                    className="text-xs bg-slate-700/60 text-slate-300 border border-slate-600/50"
                  >
                    {asset}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className={cn(
          "grid grid-cols-2 gap-4 pt-4",
          "relative z-10" // Add relative positioning and z-index
        )}>
          {/* Increased gap for buttons */}
          {/* Button with Enhanced Gradient and Inner Shadow */}
          <Button
            variant="outline"
            className={cn(
              "border border-white/20 text-white/90 transition-all duration-200",
              "bg-gradient-to-br from-neutral-700/70 via-black/60 to-neutral-900/80", // Enhanced Gradient
              "shadow-inner shadow-black/40", // Adjusted Inner shadow
              "hover:border-white/40 hover:text-white hover:scale-[1.04] hover:shadow-cyan-400/15", // Enhanced Hover effect
              "active:scale-[0.97] active:shadow-inner active:shadow-black/60" // Enhanced Active state
            )}
            onClick={handleDeposit}
          >
            Deposit
          </Button>
          <Button
            variant="outline"
            className={cn(
              "border border-white/20 text-white/90 transition-all duration-200",
              "bg-gradient-to-br from-neutral-700/70 via-black/60 to-neutral-900/80", // Enhanced Gradient
              "shadow-inner shadow-black/40", // Adjusted Inner shadow
              "hover:border-white/40 hover:text-white hover:scale-[1.04] hover:shadow-cyan-400/15", // Enhanced Hover effect
              "active:scale-[0.97] active:shadow-inner active:shadow-black/60" // Enhanced Active state
            )}
            onClick={handleWithdraw}
          >
            Withdraw
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
