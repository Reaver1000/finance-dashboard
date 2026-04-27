export interface Account {
  id: number;
  name: string;
  type: "checking" | "savings" | "credit" | "investment";
  currency: string;
  created_at: Date;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  category_id: number;
  amount: number;
  description: string;
  merchant: string;
  transaction_date: Date;
  created_at: Date;
}

export interface Budget {
  id: number;
  category_id: number;
  month: string;
  limit_amount: number;
}

export interface MonthlySummary {
  month: string;
  total_income: number;
  total_expenses: number;
  net_savings: number;
  savings_rate: number;
}

export interface CategoryBreakdown {
  category: string;
  color: string;
  total: number;
  percentage: number;
  transaction_count: number;
}

export interface SpendingTrend {
  month: string;
  category: string;
  total: number;
  running_average: number;
  month_over_month_change: number;
}

export interface BudgetComparison {
  category: string;
  color: string;
  budget: number;
  actual: number;
  remaining: number;
  utilisation_pct: number;
}

export interface TopMerchant {
  merchant: string;
  total_spent: number;
  visit_count: number;
  avg_transaction: number;
  rank: number;
}

export interface DailyBalance {
  date: string;
  daily_net: number;
  running_balance: number;
}
