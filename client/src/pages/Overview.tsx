import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { api } from "../api/client.ts";
import { useApi } from "../hooks/useApi.ts";
import { Card } from "../components/Card.tsx";
import { StatCard } from "../components/StatCard.tsx";
import { Loading } from "../components/Loading.tsx";
import { ErrorMessage } from "../components/ErrorMessage.tsx";

const EUR = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

export function Overview() {
  const { data: accounts, loading: accLoading, error: accError } = useApi(api.accounts);
  const { data: monthly, loading: monthLoading, error: monthError } = useApi(api.monthlySummary);

  if (accLoading || monthLoading) return <Loading />;
  if (accError) return <ErrorMessage message={accError} />;
  if (monthError) return <ErrorMessage message={monthError} />;

  const totalBalance = accounts?.reduce((sum, a) => sum + Number(a.balance), 0) ?? 0;
  const latestMonth = monthly?.[monthly.length - 1];
  const prevMonth = monthly && monthly.length > 1 ? monthly[monthly.length - 2] : null;

  const expenseChange = latestMonth && prevMonth
    ? ((Number(latestMonth.total_expenses) - Number(prevMonth.total_expenses)) / Number(prevMonth.total_expenses) * 100).toFixed(1)
    : null;

  const chartData = monthly?.map((m) => ({
    month: m.month,
    Income: Number(m.total_income),
    Expenses: Number(m.total_expenses),
    "Net Savings": Number(m.net_savings),
    "3M Avg Expenses": Number(m.expense_3m_avg),
  }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard
          label="Total Balance"
          value={EUR(totalBalance)}
          color={totalBalance >= 0 ? "#059669" : "#DC2626"}
        />
        <StatCard
          label="This Month's Income"
          value={EUR(Number(latestMonth?.total_income ?? 0))}
          color="#10B981"
        />
        <StatCard
          label="This Month's Expenses"
          value={EUR(Number(latestMonth?.total_expenses ?? 0))}
          subtext={expenseChange ? `${Number(expenseChange) > 0 ? "+" : ""}${expenseChange}% vs last month` : undefined}
          color="#EF4444"
        />
        <StatCard
          label="Savings Rate"
          value={`${latestMonth?.savings_rate ?? 0}%`}
          color="#6366F1"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="Income vs Expenses">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => EUR(v)} />
              <Legend />
              <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Net Savings Trend">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => EUR(v)} />
              <Area
                type="monotone"
                dataKey="Net Savings"
                stroke="#6366F1"
                fill="#EEF2FF"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
