"use client";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ADMIN_GROWTH, ADMIN_LANGUAGE_SPLIT } from "@/lib/mock-data";

const tooltipStyle = {
  background: "rgb(var(--panel))",
  border: "1px solid rgb(var(--border))",
  borderRadius: 12,
  fontSize: 12,
};

export function GrowthChart() {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={ADMIN_GROWTH} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="aUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgb(var(--text-faint))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "rgb(var(--text-faint))" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "rgb(var(--text))" }} />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#22d3ee"
            strokeWidth={2.5}
            fill="url(#aUsers)"
            name="Total users"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MrrChart() {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={ADMIN_GROWTH} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgb(var(--text-faint))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "rgb(var(--text-faint))" }} axisLine={false} tickLine={false} unit="K" />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "rgb(var(--text))" }} formatter={(v) => [`$${v}K`, "MRR"]} />
          <Line
            type="monotone"
            dataKey="mrr"
            stroke="#5b8cff"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#5b8cff" }}
            activeDot={{ r: 5 }}
            name="MRR"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LanguagePie() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-[170px] w-[170px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ADMIN_LANGUAGE_SPLIT}
              dataKey="value"
              nameKey="name"
              innerRadius={46}
              outerRadius={78}
              paddingAngle={3}
              stroke="none"
            >
              {ADMIN_LANGUAGE_SPLIT.map((e) => (
                <Cell key={e.name} fill={e.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, ""]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-1.5">
        {ADMIN_LANGUAGE_SPLIT.map((e) => (
          <li key={e.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: e.color }} />
              {e.name}
            </span>
            <span className="font-bold text-soft">{e.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
