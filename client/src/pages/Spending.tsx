import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { api } from "../api/client.ts";
import { useApi } from "../hooks/useApi.ts";
import { Card } from "../components/Card.tsx";
import { Loading } from "../components/Loading.tsx";
import { ErrorMessage } from "../components/ErrorMessage.tsx";

const EUR = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

export function Spending() {
  const { data: breakdown, loading: bLoading, error: bError } = useApi(api.categoryBreakdown);
  const { data: merchants, loading: mLoading, error: mError } = useApi(() => api.topMerchants(10));

  if (bLoading || mLoading) return <Loading />;
  if (bError) return <ErrorMessage message={bError} />;
  if (mError) return <ErrorMessage message={mError} />;

  const pieData = breakdown?.map((b) => ({
    name: b.category,
    value: Number(b.total),
    color: b.color,
    pct: b.percentage,
    count: b.transaction_count,
  }));

  const merchantData = merchants?.map((m) => ({
    merchant: m.merchant,
    total: Number(m.total_spent),
    visits: Number(m.visit_count),
  }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card title="Spending by Category (All Time)">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={2}
              label={({ name, pct }) => `${name} (${pct}%)`}
              labelLine={{ strokeWidth: 1 }}
            >
              {pieData?.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => EUR(v)} />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Top 10 Merchants by Spend">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={merchantData} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="merchant" tick={{ fontSize: 12 }} width={100} />
            <Tooltip formatter={(v: number) => EUR(v)} />
            <Bar dataKey="total" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
