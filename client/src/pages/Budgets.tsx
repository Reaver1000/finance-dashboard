import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { api } from "../api/client.ts";
import { useApi } from "../hooks/useApi.ts";
import { Card } from "../components/Card.tsx";
import { Loading } from "../components/Loading.tsx";
import { ErrorMessage } from "../components/ErrorMessage.tsx";

const EUR = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function Budgets() {
  const month = getCurrentMonth();
  const { data, loading, error } = useApi(() => api.budgetComparison(month));

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const chartData = data?.map((b) => ({
    category: b.category,
    Budget: Number(b.budget),
    Actual: Number(b.actual),
    color: b.color,
    pct: Number(b.utilisation_pct),
    remaining: Number(b.remaining),
  }));

  return (
    <div>
      <Card title={`Budget vs Actual - ${month}`}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(v: number) => EUR(v)}
              labelFormatter={(label) => {
                const item = chartData?.find((d) => d.category === label);
                return `${label} (${item?.pct ?? 0}% used)`;
              }}
            />
            <ReferenceLine y={0} stroke="#9CA3AF" />
            <Bar dataKey="Budget" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Actual" radius={[4, 4, 0, 0]}>
              {chartData?.map((entry, i) => (
                <Cell key={i} fill={entry.pct > 100 ? "#EF4444" : entry.pct > 80 ? "#F59E0B" : "#10B981"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ marginTop: 16 }}>
        <Card title="Budget Details">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #E5E7EB", textAlign: "left" }}>
                <th style={{ padding: "8px 12px" }}>Category</th>
                <th style={{ padding: "8px 12px", textAlign: "right" }}>Budget</th>
                <th style={{ padding: "8px 12px", textAlign: "right" }}>Actual</th>
                <th style={{ padding: "8px 12px", textAlign: "right" }}>Remaining</th>
                <th style={{ padding: "8px 12px", textAlign: "right" }}>Used</th>
              </tr>
            </thead>
            <tbody>
              {chartData?.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 500 }}>{row.category}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>{EUR(row.Budget)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>{EUR(row.Actual)}</td>
                  <td style={{
                    padding: "8px 12px",
                    textAlign: "right",
                    color: row.remaining < 0 ? "#EF4444" : "#059669",
                    fontWeight: 600,
                  }}>
                    {EUR(row.remaining)}
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 9999,
                      fontSize: 12,
                      fontWeight: 600,
                      background: row.pct > 100 ? "#FEE2E2" : row.pct > 80 ? "#FEF3C7" : "#D1FAE5",
                      color: row.pct > 100 ? "#DC2626" : row.pct > 80 ? "#D97706" : "#059669",
                    }}>
                      {row.pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
