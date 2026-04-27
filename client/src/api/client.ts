const BASE = "/api";

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface AccountRow {
  id: number;
  name: string;
  type: string;
  currency: string;
  balance: string;
}

export interface MonthlySummaryRow {
  month: string;
  total_income: string;
  total_expenses: string;
  net_savings: string;
  savings_rate: string;
  expense_3m_avg: string;
}

export interface CategoryBreakdownRow {
  category: string;
  color: string;
  total: string;
  percentage: string;
  transaction_count: string;
}

export interface SpendingTrendRow {
  month: string;
  category: string;
  color: string;
  total: string;
  rolling_3m_avg: string;
  month_over_month_pct: string | null;
}

export interface BudgetRow {
  category: string;
  color: string;
  budget: string;
  actual: string;
  remaining: string;
  utilisation_pct: string;
}

export interface MerchantRow {
  merchant: string;
  total_spent: string;
  visit_count: string;
  avg_transaction: string;
  rank: string;
}

export interface DailyBalanceRow {
  date: string;
  daily_net: string;
  running_balance: string;
}

export const api = {
  accounts: () => fetchJSON<AccountRow[]>("/accounts"),
  monthlySummary: () => fetchJSON<MonthlySummaryRow[]>("/analytics/monthly-summary"),
  categoryBreakdown: (month?: string) =>
    fetchJSON<CategoryBreakdownRow[]>(`/analytics/category-breakdown${month ? `?month=${month}` : ""}`),
  spendingTrends: () => fetchJSON<SpendingTrendRow[]>("/analytics/spending-trends"),
  budgetComparison: (month: string) =>
    fetchJSON<BudgetRow[]>(`/analytics/budget-comparison?month=${month}`),
  topMerchants: (limit = 10) =>
    fetchJSON<MerchantRow[]>(`/analytics/top-merchants?limit=${limit}`),
  dailyBalance: (accountId = 1) =>
    fetchJSON<DailyBalanceRow[]>(`/analytics/daily-balance?account_id=${accountId}`),
};
