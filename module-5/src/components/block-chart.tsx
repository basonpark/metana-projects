"use client";

import { EnrichedBlock } from "@/lib/alchemy";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface BlockChartProps {
  title: string;
  description: string;
  dataKey: keyof EnrichedBlock;
  color: string;
  unit?: string;
  formatter?: (value: number) => string;
  data: EnrichedBlock[];
  chartType?: "line" | "bar";
}

export const BlockChart = ({
  title,
  description,
  dataKey,
  color,
  unit = "",
  formatter = (v: number) => v.toString(),
  data,
  chartType = "line",
}: BlockChartProps) => {
  // Process data to ensure it's displayed correctly
  const chartData = useMemo(() => {
    // Take exactly 10 most recent blocks for visualization
    return [...data]
      .sort((a, b) => b.number - a.number) // Sort by block number (descending)
      .slice(0, 10) // Take only 10 most recent blocks
      .reverse(); // Reverse for chart display (oldest to newest)
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const block = payload[0].payload;
      const value = block[dataKey] as number;

      return (
        <div className="bg-slate-800 p-3 border border-slate-700 rounded-md shadow-lg">
          <p className="text-white font-medium">Block #{block.number}</p>
          <p className="text-slate-300">
            {formatter(value)}
            {unit}
          </p>
          {chartType === "bar" && value > 1000000 && (
            <p className="text-slate-300">
              ({formatter(value / 1000000)} Million{unit})
            </p>
          )}
          <p className="text-slate-400 text-xs">
            {new Date(block.timestamp * 1000).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-xl h-full relative overflow-hidden backdrop-blur-sm border border-slate-700/20 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 via-slate-800/70 to-slate-900/90 -z-10"></div>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCB9A]/0 via-[#FFCB9A]/50 to-[#FFCB9A]/0"></div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 15, left: 25, bottom: 25 }}
            >
              <defs>
                <linearGradient
                  id="lineColorGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.4}
                vertical={false}
              />
              <XAxis
                dataKey="number"
                stroke="#94a3b8"
                fontSize={13}
                tickFormatter={(value) => value.toString()}
                label={{
                  value: "Block Number",
                  position: "insideBottom",
                  offset: -15,
                  fill: "#94a3b8",
                  fontSize: 13,
                }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={13}
                tickFormatter={(value) => formatter(value)}
                width={60}
                label={{
                  value: `${title} (${unit})`,
                  angle: -90,
                  position: "insideLeft",
                  offset: 0,
                  dx: 0,
                  dy: 40,
                  fill: "#94a3b8",
                  fontSize: 14,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={dataKey as string}
                stroke="url(#lineColorGradient)"
                strokeWidth={3}
                dot={{ r: 4, fill: color, strokeWidth: 0 }}
                activeDot={{
                  r: 6,
                  fill: color,
                  strokeWidth: 2,
                  stroke: "white",
                }}
                animationDuration={1000}
                animationEasing="ease-in-out"
                isAnimationActive={true}
              />
            </LineChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 15, left: 35, bottom: 25 }}
            >
              <defs>
                <linearGradient
                  id="barColorGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.9} />
                  <stop
                    offset="95%"
                    stopColor={`${color}99`}
                    stopOpacity={0.7}
                  />
                </linearGradient>
                <linearGradient
                  id="barHoverGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={1} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.4}
                vertical={false}
              />
              <XAxis
                dataKey="number"
                stroke="#94a3b8"
                fontSize={13}
                tickFormatter={(value) => value.toString()}
                label={{
                  value: "Block Number",
                  position: "insideBottom",
                  offset: -15,
                  fill: "#94a3b8",
                  fontSize: 13,
                }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={13}
                tickFormatter={(value) => formatter(value / 1000) + "K"}
                width={65}
                label={{
                  value: `${title}`,
                  angle: -90,
                  position: "insideLeft",
                  offset: 0,
                  dx: -20,
                  dy: 70,
                  fill: "#94a3b8",
                  fontSize: 13,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={dataKey as string}
                fill="url(#barColorGradient)"
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
                animationEasing="ease-in-out"
                isAnimationActive={true}
                onMouseOver={(data, index) => {
                  // Optional custom hover behavior if needed
                }}
                activeBar={{
                  fill: "url(#barHoverGradient)",
                  filter: "drop-shadow(0 0 3px rgba(255, 203, 154, 0.5))",
                }}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
