import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend,
} from "recharts";
import { api } from "../api/client.ts";
import { useApi } from "../hooks/useApi.ts";
import { Card } from "../components/Card.tsx";
import { Loading } from "../components/Loading.tsx";
import { ErrorMessage } from "../components/ErrorMessage.tsx";

const EUR = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

export function Trends() {
  const { data: trends, loading: tLoading, error: tError } = useApi(api.spendingTrends);
  const { data: balance, loading: bLoading, error: bError } = useApi(() => api.dailyBalance(1));

  if (tLoading || bLoading) return <Loading />;
  if (tError) return <ErrorMessage message={tError} />;
  if (bError) return <ErrorMessage message={bError} />;

  // Pivot trends: group by month, top 5 categories by total spend
  const categoryTotals = new Map<string, { total: number; color: string }>();
  trends?.forEach((t) => {
    const existing = categoryTotals.get(t.category);
    const val = Number(t.total);
    if (existing) {
      existing.total += val;
    } else {
      categoryTotals.set(t.category, { total: val, color: t.color });
    }
  });

  const topCategories = [...categoryTotals.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const months = [...new Set(trends?.map((t) => t.month))].sort();
  const trendChart = months.map((month) => {
    const row: Record<string, string | number> = { month };
    for (const [cat] of topCategories) {
      const match = trends?.find((t) => t.month === month && t.category === cat);
      row[cat] = match ? Number(match.total) : 0;
    }
    return row;
  });

  // Daily balance: sample every 7 days for cleaner chart
  const balanceChart = balance
    ?.filter((_, i) => i % 7 === 0 || i === balance.length - 1)
    .map((b) => ({
      date: b.date.slice(0, 10),
      balance: Number(b.running_balance),
    }));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card title="Top 5 Categories - Monthly Trend">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={trendChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => EUR(v)} />
            <Legend />
            {topCategories.map(([cat, { color }]) => (
              <Line
                key={cat}
                type="monotone"
                dataKey={cat}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Running Balance (Main Checking)">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={balanceChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => EUR(v)} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#3B82F6"
              fill="#DBEAFE"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
