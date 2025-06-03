"use client";

import { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import { EnrichedBlock } from "@/lib/alchemy";

interface BlockCountdownProps {
  latestBlockTimestamp: number;
  blocks: EnrichedBlock[]; // Add blocks to calculate actual block time
  variant?: "default" | "minimal"; // Add variant prop
}

export const BlockCountdown = ({
  latestBlockTimestamp,
  blocks,
  variant = "default", // Default to standard styling
}: BlockCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState(12.0);
  const [averageBlockTime, setAverageBlockTime] = useState(12.0); // Default to 12s

  // Calculate average block time based on recent blocks
  useEffect(() => {
    if (blocks.length >= 3) {
      // Need at least 3 blocks to calculate a meaningful average
      let totalTime = 0;
      let count = 0;

      // Calculate time differences between consecutive blocks
      for (let i = 0; i < blocks.length - 1; i++) {
        const timeDiff = blocks[i].timestamp - blocks[i + 1].timestamp;
        // Only count reasonable values (sometimes API returns out-of-order blocks)
        if (timeDiff > 0 && timeDiff < 30) {
          totalTime += timeDiff;
          count++;
        }
      }

      if (count > 0) {
        // Get average and update state
        const avg = totalTime / count;
        setAverageBlockTime(avg);
        // Reset timer with new calculated time
        setTimeLeft(avg);
      }
    }
  }, [blocks]);

  // When we get a new block timestamp, reset the timer
  useEffect(() => {
    setTimeLeft(averageBlockTime);

    // Update the timer every 10ms for smooth decimals
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = Math.max(0, prevTime - 0.01);
        return Number(newTime.toFixed(2));
      });
    }, 10);

    return () => clearInterval(timer);
  }, [latestBlockTimestamp, averageBlockTime]);

  // Color changes based on time remaining percentage rather than fixed values
  const getColorClass = () => {
    const percentage = (timeLeft / averageBlockTime) * 100;
    if (percentage > 50) return "text-emerald-300";
    if (percentage > 25) return "text-amber-300";
    return "text-red-300";
  };

  // Apply different styling based on the variant
  const containerClass =
    variant === "minimal"
      ? "flex items-center space-x-2" // No background or border for minimal variant
      : "flex items-center space-x-2 rounded-md bg-slate-800/60 px-3 py-2 border border-slate-700/50"; // Original styling

  return (
    <div className={containerClass}>
      <ClockIcon className="h-5 w-5 text-slate-400" />
      <div className="flex flex-col">
        <div className="text-xs text-slate-400">Next Block In</div>
        <div className={`font-mono font-medium ${getColorClass()}`}>
          {timeLeft.toFixed(2)}s
        </div>
      </div>
    </div>
  );
};
