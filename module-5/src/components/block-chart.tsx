"use client";

import { EnrichedBlock } from "../lib/alchemy";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export const BlockChart = ({
  title,
  dataKey,
  color,
  unit = "",
  formatter = (v: number) => v.toFixed(2),
  data,
  description,
}: {
  title: string;
  dataKey: keyof EnrichedBlock;
  color: string;
  unit?: string;
  formatter?: (value: number) => string;
  data: EnrichedBlock[];
  description?: string;
}) => (
  <div className="p-6 bg-slate-800 rounded-xl shadow-xl hover:shadow-2xl transition-all">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      {description && (
        <p className="text-sm text-slate-300 mt-1">{description}</p>
      )}
    </div>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            bottom: 30,
            left: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="number"
            tick={{ fontSize: 12, fill: "#cbd5e1" }}
            label={{
              value: "Block Number",
              position: "insideBottom",
              offset: -20,
              fill: "#cbd5e1",
            }}
            stroke="#475569"
          />
          <YAxis
            width={title.length > 20 ? 120 : 80}
            tickFormatter={(v) => `${formatter(v)}${unit}`}
            tick={{ fontSize: 12, fill: "#cbd5e1" }}
            label={{
              value: title,
              angle: -90,
              position: "insideLeft",
              offset: -20,
              dy: title.length < 10 ? 60 : 90,
              fill: "#cbd5e1",
              textAnchor: "middle",
              style: {
                fontSize: title.length > 20 ? 12 : 15,
              },
            }}
            stroke="#475569"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
            }}
            labelStyle={{ color: "#f1f5f9" }}
            itemStyle={{ color: "#f1f5f9" }}
            formatter={(v) => [`${formatter(v as number)}${unit}`, title]}
            labelFormatter={(label) => `Block #${label}`}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);
