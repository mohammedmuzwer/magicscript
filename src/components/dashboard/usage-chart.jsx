"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { USAGE_HISTORY } from "@/lib/mock-data";

export default function UsageChart() {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={USAGE_HISTORY} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
          <defs>
            <linearGradient id="gGen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gVer" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b8cff" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#5b8cff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "rgb(var(--text-faint))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "rgb(var(--text-faint))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "rgb(var(--panel))",
              border: "1px solid rgb(var(--border))",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "rgb(var(--text))" }}
          />
          <Area
            type="monotone"
            dataKey="verifications"
            stroke="#5b8cff"
            strokeWidth={2}
            fill="url(#gVer)"
            name="Verifications"
          />
          <Area
            type="monotone"
            dataKey="generations"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#gGen)"
            name="Generations"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
