"use client";

import { EnrichedBlock } from "../lib/alchemy";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const BlockChart = ({
  title,
  dataKey,
  color,
  unit = "",
  formatter = (v: number) => v.toFixed(2),
  data,
}: {
  title: string;
  dataKey: keyof EnrichedBlock;
  color: string;
  unit?: string;
  formatter?: (value: number) => string;
  data: EnrichedBlock[];
}) => (
  <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
    <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="number"
            tick={{ fontSize: 12 }}
            label={{ value: "Block Number", position: "bottom" }}
          />
          <YAxis width={80} tickFormatter={(v) => `${formatter(v)}${unit}`} />
          <Tooltip
            contentStyle={{ background: "white", borderRadius: "8px" }}
            formatter={(v) => [formatter(v as number), title]}
            labelFormatter={(label) => `Block ${label}`}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);
