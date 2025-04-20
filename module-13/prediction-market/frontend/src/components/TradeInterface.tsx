// frontend/src/components/TradeInterface.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ethers } from "ethers";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { Outcome } from "@/types/contracts"; // Assuming Outcome enum is defined { Yes = 0, No = 1 }
import PredictionMarketABI from "@/abi/PredictionMarket.json";
import { formatEtherShort, formatBalance, formatFee } from "@/lib/utils"; // Import the utility

interface TradeInterfaceProps {
  marketId: `0x${string}`;
  ammYesShares: bigint | undefined;
  ammNoShares: bigint | undefined;
  userYesShares: bigint | undefined;
  userNoShares: bigint | undefined;
  isResolved: boolean | undefined;
  winningOutcome: number | undefined; // Assuming number or undefined based on Outcome enum
  platformFeeBps: bigint | undefined;
  creatorFeeBps: bigint | undefined;
  isLoadingContractData: boolean;
}

export const TradeInterface: React.FC<TradeInterfaceProps> = ({
  marketId,
  ammYesShares = 0n, // Default to 0n if undefined
  ammNoShares = 0n,
  userYesShares = 0n,
  userNoShares = 0n,
  isResolved,
  winningOutcome,
  platformFeeBps = 0n,
  creatorFeeBps = 0n,
  isLoadingContractData,
}) => {
  const { address: userAddress, isConnected } = useAccount();
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
  const [outcome, setOutcome] = useState<Outcome>(Outcome.Yes); // Default to Yes
  const [amount, setAmount] = useState<string>(""); // Input amount (ETH for buy, Shares for sell)

  const totalFeeBps = useMemo(
    () => platformFeeBps + creatorFeeBps,
    [platformFeeBps, creatorFeeBps]
  );

  // --- Calculations for UI Estimates ---
  const { estimatedReceive, estimatedCost, calculationError } = useMemo(() => {
    try {
      if (
        !amount ||
        isNaN(parseFloat(amount)) ||
        parseFloat(amount) <= 0 ||
        ammYesShares === undefined ||
        ammNoShares === undefined
      ) {
        return {
          estimatedReceive: "0.00",
          estimatedCost: "0.00",
          calculationError: null,
        };
      }

      const inputAmountBigInt = ethers.parseUnits(amount, 18); // Assume 18 decimals for input

      if (tradeMode === "buy") {
        const collateralIn = inputAmountBigInt;
        const feeAmount = (collateralIn * totalFeeBps) / 10000n;
        const netCollateral = collateralIn - feeAmount;

        if (netCollateral <= 0n)
          return {
            estimatedReceive: "0.00",
            estimatedCost: formatEtherShort(collateralIn),
            calculationError: "Amount too small after fees",
          };

        let sharesOut: bigint;
        if (outcome === Outcome.Yes) {
          // Buy Yes: AMM gives Yes shares, takes collateral (added to No reserve conceptually)
          // sharesOut = (R_Yes * NetCollateral) / (R_No + NetCollateral)
          sharesOut =
            (ammYesShares * netCollateral) / (ammNoShares + netCollateral);
        } else {
          // Buy No: AMM gives No shares, takes collateral (added to Yes reserve conceptually)
          // sharesOut = (R_No * NetCollateral) / (R_Yes + NetCollateral)
          sharesOut =
            (ammNoShares * netCollateral) / (ammYesShares + netCollateral);
        }
        return {
          estimatedReceive: formatEtherShort(sharesOut),
          estimatedCost: formatEtherShort(collateralIn),
          calculationError: null,
        };
      } else {
        // tradeMode === 'sell'
        const sharesIn = inputAmountBigInt;
        let collateralGross: bigint;
        let netCollateralOut: bigint;

        if (outcome === Outcome.Yes) {
          // Sell Yes: User gives Yes shares, AMM gives collateral (taken from No reserve conceptually)
          // collateralGross = (R_No * SharesIn) / (R_Yes + SharesIn)
          if (ammYesShares + sharesIn === 0n)
            throw new Error("Division by zero"); // Avoid division by zero
          collateralGross =
            (ammNoShares * sharesIn) / (ammYesShares + sharesIn);
        } else {
          // Sell No: User gives No shares, AMM gives collateral (taken from Yes reserve conceptually)
          // collateralGross = (R_Yes * SharesIn) / (R_No + SharesIn)
          if (ammNoShares + sharesIn === 0n)
            throw new Error("Division by zero"); // Avoid division by zero
          collateralGross =
            (ammYesShares * sharesIn) / (ammNoShares + sharesIn);
        }

        const feeAmount = (collateralGross * totalFeeBps) / 10000n;
        netCollateralOut = collateralGross - feeAmount;

        if (netCollateralOut < 0n) netCollateralOut = 0n; // Cannot receive negative amount

        return {
          estimatedReceive: formatEtherShort(netCollateralOut),
          estimatedCost: formatEtherShort(sharesIn),
          calculationError: null,
        };
      }
    } catch (err) {
      console.error("Calculation error:", err);
      // Provide a more specific error message if possible
      const message = err instanceof Error ? err.message : "Calculation error";
      return {
        estimatedReceive: "Error",
        estimatedCost: "Error",
        calculationError: message,
      };
    }
  }, [amount, tradeMode, outcome, ammYesShares, ammNoShares, totalFeeBps]);

  // --- useWriteContract Hook (handles preparation internally) ---
  const {
    data: hash,
    error: writeError,
    isPending,
    writeContract,
  } = useWriteContract();

  // --- Transaction Monitoring Hook ---
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({ hash });

  // --- Event Handlers ---
  const handleTrade = () => {
    const contractMarketId = BigInt(marketId); // Convert hex string marketId to BigInt
    const contractOutcomeIndex = outcome === Outcome.Yes ? 1n : 0n; // Map enum to contract index (1=Yes, 0=No)
    const amountBigInt = amount ? ethers.parseUnits(amount, 18) : 0n;

    if (tradeMode === "buy") {
      console.log(`Attempting to buy shares for market ${marketId}, outcome ${contractOutcomeIndex}, amount ${amount}`);
      writeContract({
        address: marketId,
        abi: PredictionMarketABI.abi,
        functionName: "buyShares",
        args: [contractMarketId, contractOutcomeIndex, amountBigInt], // Pass marketId, outcomeIndex, and amount
        // value: REMOVED - Pass amount via args
      });
    } else {
      console.log(`Attempting to sell shares for market ${marketId}, outcome ${contractOutcomeIndex}, amount ${amount}`);
      writeContract({
        address: marketId,
        abi: PredictionMarketABI.abi,
        functionName: "sellShares",
        args: [contractMarketId, contractOutcomeIndex, amountBigInt], // Pass marketId, outcomeIndex, sharesToSell
      });
    }
  };

  const handleRedeem = () => {
    console.log("Attempting to redeem winnings...");
    writeContract({
      address: marketId,
      abi: PredictionMarketABI.abi,
      functionName: "redeemWinnings",
    });
  };

  // --- Effect to clear amount on success ---
  useEffect(() => {
    if (isTxSuccess) {
      setAmount("");
    }
  }, [isTxSuccess]);

  // --- Derived State ---
  const currentActionLoading = isPending || isTxLoading;
  const canRedeem =
    isConnected &&
    !!isResolved &&
    ((winningOutcome === Outcome.Yes && userYesShares > 0n) ||
      (winningOutcome === Outcome.No && userNoShares > 0n));

  // Determine user's balance for selling
  const userBalanceForSell = useMemo(() => {
    return outcome === Outcome.Yes ? userYesShares : userNoShares;
  }, [outcome, userYesShares, userNoShares]);

  const isTradeDisabled =
    currentActionLoading ||
    !isConnected ||
    !amount ||
    parseFloat(amount) <= 0 ||
    !!calculationError ||
    isResolved;

  const isRedeemDisabled = currentActionLoading || !canRedeem;

  return (
    <div className="space-y-6">
      {/* Trade Section */}
      {!isResolved && (
        <Card className="bg-background/70 border-border/30 shadow-md">
          <CardHeader>
            <CardTitle>Trade Shares</CardTitle>
            <CardDescription>
              Buy or sell YES/NO shares instantly via the AMM.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Buy/Sell Toggle */}
            <ToggleGroup
              type="single"
              value={tradeMode}
              onValueChange={(value: "buy" | "sell") => {
                if (value) setTradeMode(value);
                setAmount(""); // Clear amount on mode change
              }}
              className="grid grid-cols-2 border rounded-md overflow-hidden"
            >
              <ToggleGroupItem
                value="buy"
                aria-label="Buy shares"
                className="data-[state=on]:bg-primary/10 data-[state=on]:text-primary rounded-none py-3"
              >
                <TrendingUp className="h-4 w-4 mr-2" /> Buy
              </ToggleGroupItem>
              <ToggleGroupItem
                value="sell"
                aria-label="Sell shares"
                className="data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive rounded-none py-3"
              >
                <TrendingDown className="h-4 w-4 mr-2" /> Sell
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Outcome Toggle */}
            <ToggleGroup
              type="single"
              value={outcome === Outcome.Yes ? "yes" : "no"}
              onValueChange={(value: "yes" | "no") => {
                if (value)
                  setOutcome(value === "yes" ? Outcome.Yes : Outcome.No);
              }}
              className="grid grid-cols-2"
            >
              <ToggleGroupItem
                value="yes"
                aria-label="Select YES outcome"
                className="data-[state=on]:bg-green-500/20 data-[state=on]:text-green-600 border rounded-l-md"
              >
                YES
              </ToggleGroupItem>
              <ToggleGroupItem
                value="no"
                aria-label="Select NO outcome"
                className="data-[state=on]:bg-red-500/20 data-[state=on]:text-red-600 border rounded-r-md"
              >
                NO
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Amount Input */}
            <div>
              <Label htmlFor="amount" className="text-xs text-muted-foreground">
                {tradeMode === "buy"
                  ? "Amount (ETH collateral)"
                  : "Amount (Shares to sell)"}
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="any"
                className="mt-1"
                disabled={currentActionLoading}
              />
              {tradeMode === "sell" && isConnected && (
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  Balance: {formatBalance(userBalanceForSell)}
                  {outcome === Outcome.Yes ? "YES" : "NO"}
                  <Button
                    variant="link"
                    className="p-0 h-auto ml-1 text-primary"
                    onClick={() =>
                      setAmount(
                        ethers.formatUnits(userBalanceForSell || 0n, 18)
                      )
                    }
                    disabled={
                      !userBalanceForSell ||
                      userBalanceForSell === 0n ||
                      currentActionLoading
                    }
                  >
                    (Max)
                  </Button>
                </div>
              )}
            </div>

            {/* Estimate Display */}
            <div className="text-sm space-y-1 p-3 bg-muted/50 rounded-md border border-border/20">
              {tradeMode === "buy" ? (
                <>
                  <div className="flex justify-between">
                    <span>Estimated Shares Received:</span>
                    <span className="font-medium">
                      {calculationError ? "-" : estimatedReceive}{" "}
                      {outcome === Outcome.Yes ? "YES" : "NO"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Total Cost (incl. fees):</span>
                    <span className="font-medium">
                      {calculationError ? "-" : estimatedCost} ETH
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Estimated Collateral Received:</span>
                    <span className="font-medium">
                      {calculationError ? "-" : estimatedReceive} ETH
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Shares Sold:</span>
                    <span className="font-medium">
                      {calculationError ? "-" : estimatedCost}{" "}
                      {outcome === Outcome.Yes ? "YES" : "NO"}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Trading Fee ({formatFee(totalFeeBps)}):</span>
                <span>~ {formatFee(totalFeeBps)}</span>
              </div>
              {calculationError && (
                <p className="text-destructive text-xs pt-1">
                  {calculationError}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleTrade}
              disabled={isTradeDisabled}
            >
              {currentActionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : tradeMode === "buy" ? (
                <TrendingUp className="h-4 w-4 mr-2" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-2" />
              )}
              {currentActionLoading
                ? "Processing..."
                : tradeMode === "buy"
                ? `Buy ${outcome === Outcome.Yes ? "YES" : "NO"} Shares`
                : `Sell ${outcome === Outcome.Yes ? "YES" : "NO"} Shares`}
            </Button>
          </CardFooter>
          {/* Display Write Error (Simplified) */}
          {writeError && (
            <div className="px-6 pb-4">
              <Alert variant="destructive" className="text-xs">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {writeError.message.includes("User rejected the request")
                    ? "Transaction rejected."
                    : writeError.message.length > 100
                    ? writeError.message.substring(0, 100) + "..."
                    : writeError.message}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </Card>
      )}

      {/* Redeem Section */}
      {isResolved && (
        <Card className="bg-background/70 border-border/30 shadow-md">
          <CardHeader>
            <CardTitle>Redeem Winnings</CardTitle>
            <CardDescription>
              Market has resolved. Redeem your winning shares for collateral.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {winningOutcome === undefined && !isLoadingContractData ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Resolution Error</AlertTitle>
                <AlertDescription>
                  Could not determine the winning outcome.
                </AlertDescription>
              </Alert>
            ) : winningOutcome === Outcome.Yes ? (
              <Alert variant="default">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Outcome: YES</AlertTitle>
                <AlertDescription>
                  You can redeem {formatBalance(userYesShares)} YES shares.
                </AlertDescription>
              </Alert>
            ) : winningOutcome === Outcome.No ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Outcome: NO</AlertTitle>
                <AlertDescription>
                  You can redeem {formatBalance(userNoShares)} NO shares.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="default">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Loading Resolution</AlertTitle>
                <AlertDescription>
                  Waiting for resolution data...
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleRedeem}
              disabled={isRedeemDisabled}
            >
              {currentActionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {currentActionLoading ? "Processing..." : "Redeem Winnings"}
            </Button>
          </CardFooter>
          {/* Display Redeem Write Error (Simplified) */}
          {writeError && !currentActionLoading && (
            <div className="px-6 pb-4">
              <Alert variant="destructive" className="text-xs">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {writeError.message.includes("User rejected the request")
                    ? "Transaction rejected."
                    : writeError.message.length > 100
                    ? writeError.message.substring(0, 100) + "..."
                    : writeError.message}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </Card>
      )}

      {/* Transaction Status Display */}
      {isPending && (
        <Alert variant="default" className="mt-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Sending Transaction</AlertTitle>
          <AlertDescription>Confirm in wallet.</AlertDescription>
        </Alert>
      )}
      {isTxLoading && hash && (
        <Alert variant="default" className="mt-4 animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Processing Transaction</AlertTitle>
          <AlertDescription>
            Waiting... Hash:
            <a
              href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline ml-1 break-all"
            >
              {hash?.substring(0, 10)}...
              {hash?.substring(hash.length - 8)}
            </a>
          </AlertDescription>
        </Alert>
      )}
      {isTxSuccess && hash && (
        <Alert variant="default" className="mt-4">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Transaction Successful</AlertTitle>
          <AlertDescription>
            Confirmed. Hash:
            <a
              href={`https://sepolia.etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline ml-1 break-all"
            >
              {hash?.substring(0, 10)}...
              {hash?.substring(hash.length - 8)}
            </a>
          </AlertDescription>
        </Alert>
      )}
      {writeError && !isPending && !isTxLoading && !hash && (
        <Alert variant="destructive" className="mt-4">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Transaction Error</AlertTitle>
          <AlertDescription>
            {writeError.message.includes("User rejected the request")
              ? "Rejected by user."
              : writeError.message.substring(0, 100)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
