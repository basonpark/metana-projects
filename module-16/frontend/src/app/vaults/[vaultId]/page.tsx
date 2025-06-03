"use client"; // Needed for useParams and potentially useState later

import React from "react";
import { useParams } from "next/navigation";
// Use relative paths for imports and correct the source for VaultData
import { mockVaults } from "../../../components/vaults/VaultData";
import { VaultCard, VaultData } from "../../../components/vaults/VaultCard"; // Import VaultData from VaultCard
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Keep alias for shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link"; // For back button
import { cn } from "@/lib/utils"; // Keep alias for utils

// Helper function (similar to VaultCard)
const getRiskColorClasses = (riskLevel: VaultData["riskLevel"]) => {
  // Use VaultData['riskLevel'] for type safety
  switch (riskLevel) {
    case "Low":
      return "border-teal-500/50 text-teal-300 bg-teal-950/40";
    case "Medium":
      return "border-cyan-500/60 text-cyan-300 bg-cyan-900/50";
    case "High":
      return "border-orange-500/50 text-orange-400 bg-orange-950/30";
    default:
      return "border-slate-600 text-slate-400 bg-slate-950/30";
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function VaultDetailPage() {
  const params = useParams();
  const vaultId = params.vaultId as string;

  // Find vault data - Replace with actual data fetching later
  const vault = mockVaults.find((v) => v.id === vaultId);

  if (!vault) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
        <p className="text-xl mb-4">Vault not found.</p>
        <Link
          href="/vaults"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft size={18} />
          Go Back to Vaults
        </Link>
      </div>
    );
  }

  const riskColors = getRiskColorClasses(vault.riskLevel);

  const handleDepositSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement actual deposit contract interaction
    const amount = (event.target as HTMLFormElement).depositAmount.value;
    console.log(
      `Submitting deposit of ${amount} ${vault.assets[0]} for vault ${vault.id}`
    );
    alert("Deposit functionality not yet implemented.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black text-white p-4 md:p-8 pt-8 md:pt-12 relative">
      {/* Back Button - Styled and positioned top-left */}
      <div className="absolute top-10 left-10 md:top-6 md:left-6">
        <Button
          asChild
          variant="secondary"
          size="icon"
          className="h-10 w-10 text-slate-300 border-slate-600 hover:text-white transition-colors bg-slate-600 hover:bg-slate-500 shadow-[0_2px_3px_rgba(255,255,255,0.08)]"
        >
          <Link href="/vaults" aria-label="Back to Vaults">
            <ArrowLeft size={16} />
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto pt-32">
        {/* Vault Info Card */}
        <Card
          className={cn(
            "mb-8 border border-slate-700 shadow-lg",
            "bg-gradient-to-br from-slate-700/70 via-slate-800/80 to-slate-950/90"
          )}
        >
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-white">
                {vault.name}
              </CardTitle>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-md",
                  riskColors
                )}
              >
                {vault.riskLevel} Risk
              </span>
            </div>
            <CardDescription className="text-slate-400 pt-2 text-sm">
              {vault.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-slate-300 block mb-1">
                Current APY:
              </strong>{" "}
              <span className="bg-gradient-to-r from-white to-cyan-400 text-transparent bg-clip-text font-semibold text-lg">
                {vault.apy.toFixed(2)}%
              </span>
            </div>
            <div>
              <strong className="text-slate-300 block mb-1">
                Total Value Locked:
              </strong>{" "}
              <span className="text-white font-semibold text-lg">
                {formatCurrency(vault.tvl)}
              </span>
            </div>
            <div className="mt-1">
              <strong className="text-slate-300 block mb-1">Contract:</strong>
              <span className="text-xs text-slate-400 break-all font-mono bg-slate-700/50 px-2 py-1 rounded">
                {vault.contractAddress}
              </span>
            </div>
            <div>
              <strong className="text-slate-300 block mb-1">Assets:</strong>{" "}
              <div className="flex flex-wrap gap-2 mt-1">
                {vault.assets.map((asset) => (
                  <span
                    key={asset}
                    className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-600/50 border border-slate-500/70 text-slate-300 rounded-md shadow-sm hover:bg-slate-500/50 transition-colors cursor-default"
                  >
                    {asset}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Form Card */}
        <Card
          className={cn(
            "border border-slate-700 shadow-lg",
            "bg-gradient-to-br from-slate-700/70 via-slate-800/80 to-slate-950/90"
          )}
        >
          <CardHeader>
            <CardTitle className="text-xl text-white">Deposit Funds</CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Enter the amount you wish to deposit into the {vault.name} vault.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              {/* Wallet Context Info */}
              <div className="mb-4 p-3 bg-slate-700/50 border border-slate-600 rounded-md space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-slate-200 font-medium flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>{" "}
                    {/* Status dot */}
                    Sepolia Testnet
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Your Wallet:</span>
                  <span className="text-slate-200 font-mono font-medium">
                    0xAbC...dE45
                  </span>{" "}
                  {/* Placeholder */}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Available:</span>
                  <span className="text-slate-200 font-medium">
                    2.534 ETH
                  </span>{" "}
                  {/* Placeholder */}
                </div>
              </div>

              <div>
                {/* Assuming deposit is in primary asset for simplicity */}
                <Label
                  htmlFor="depositAmount"
                  className="text-slate-300 mb-2 block text-sm"
                >
                  Amount ({vault.assets[0]})
                </Label>
                <Input
                  id="depositAmount"
                  name="depositAmount" // Add name attribute for form access
                  type="number"
                  step="any" // Allow decimals
                  min="0" // Prevent negative numbers
                  placeholder={`E.g., 1.5 ${vault.assets[0]}`}
                  required
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500"
                />
                {/* Add Wallet Balance display here later */}
                {/* <p className="text-xs text-slate-500 mt-1">Balance: 0.00 {vault.assets[0]}</p> */}
              </div>
              {/* Add approval button if needed for ERC20 */}
              {/* <Button type="button" variant="secondary" className="w-full">Approve {vault.assets[0]}</Button> */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  className={cn(
                    "w-auto px-8 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold",
                    "shadow-md shadow-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/40 hover:scale-[1.03] transform transition-all duration-200"
                  )}
                >
                  Deposit Now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
