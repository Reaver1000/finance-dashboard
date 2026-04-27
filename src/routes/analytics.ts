import { Router } from "express";
import pool from "../database/connection.js";
import { validateMonth } from "../middleware/validate.js";

const router = Router();

// GET /api/analytics/monthly-summary — income vs expenses by month
// Demonstrates: CTE, conditional aggregation, window functions
router.get("/monthly-summary", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      WITH monthly AS (
        SELECT
          TO_CHAR(transaction_date, 'YYYY-MM') AS month,
          SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS total_income,
          SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) AS total_expenses
        FROM transactions
        GROUP BY TO_CHAR(transaction_date, 'YYYY-MM')
      )
      SELECT
        month,
        total_income,
        total_expenses,
        (total_income - total_expenses) AS net_savings,
        CASE
          WHEN total_income > 0
          THEN ROUND((total_income - total_expenses) / total_income * 100, 1)
          ELSE 0
        END AS savings_rate,
        ROUND(AVG(total_expenses) OVER (
          ORDER BY month
          ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
        ), 2) AS expense_3m_avg
      FROM monthly
      ORDER BY month
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/category-breakdown?month=YYYY-MM
// Demonstrates: JOINs, aggregation, percentage calculation
router.get("/category-breakdown", validateMonth, async (req, res, next) => {
  try {
    const month = req.query.month as string | undefined;
    const dateFilter = month
      ? `AND TO_CHAR(t.transaction_date, 'YYYY-MM') = $1`
      : "";
    const params = month ? [month] : [];

    const { rows } = await pool.query(
      `
      WITH expenses AS (
        SELECT
          c.name AS category,
          c.color,
          SUM(ABS(t.amount)) AS total,
          COUNT(*) AS transaction_count
        FROM transactions t
        JOIN categories c ON c.id = t.category_id
        WHERE t.amount < 0 ${dateFilter}
        GROUP BY c.name, c.color
      ),
      grand_total AS (
        SELECT SUM(total) AS sum_total FROM expenses
      )
      SELECT
        e.category,
        e.color,
        e.total,
        ROUND(e.total / gt.sum_total * 100, 1) AS percentage,
        e.transaction_count
      FROM expenses e
      CROSS JOIN grand_total gt
      ORDER BY e.total DESC
      `,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/spending-trends
// Demonstrates: window functions (LAG, AVG OVER), CTEs
router.get("/spending-trends", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      WITH monthly_by_category AS (
        SELECT
          TO_CHAR(t.transaction_date, 'YYYY-MM') AS month,
          c.name AS category,
          c.color,
          SUM(ABS(t.amount)) AS total
        FROM transactions t
        JOIN categories c ON c.id = t.category_id
        WHERE t.amount < 0
        GROUP BY TO_CHAR(t.transaction_date, 'YYYY-MM'), c.name, c.color
      )
      SELECT
        month,
        category,
        color,
        total,
        ROUND(AVG(total) OVER (
          PARTITION BY category
          ORDER BY month
          ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
        ), 2) AS rolling_3m_avg,
        ROUND(
          (total - LAG(total) OVER (PARTITION BY category ORDER BY month))
          / NULLIF(LAG(total) OVER (PARTITION BY category ORDER BY month), 0)
          * 100
        , 1) AS month_over_month_pct
      FROM monthly_by_category
      ORDER BY month, total DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/budget-comparison?month=YYYY-MM
// Demonstrates: LEFT JOIN, COALESCE, derived calculations
router.get("/budget-comparison", validateMonth, async (req, res, next) => {
  try {
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

    const { rows } = await pool.query(
      `
      SELECT
        c.name AS category,
        c.color,
        b.limit_amount AS budget,
        COALESCE(SUM(ABS(t.amount)), 0) AS actual,
        b.limit_amount - COALESCE(SUM(ABS(t.amount)), 0) AS remaining,
        ROUND(
          COALESCE(SUM(ABS(t.amount)), 0) / b.limit_amount * 100, 1
        ) AS utilisation_pct
      FROM budgets b
      JOIN categories c ON c.id = b.category_id
      LEFT JOIN transactions t
        ON t.category_id = b.category_id
        AND t.amount < 0
        AND TO_CHAR(t.transaction_date, 'YYYY-MM') = $1
      WHERE TO_CHAR(b.month, 'YYYY-MM') = $1
      GROUP BY c.name, c.color, b.limit_amount
      ORDER BY utilisation_pct DESC
      `,
      [month]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/top-merchants?limit=10
// Demonstrates: RANK() window function, aggregation
router.get("/top-merchants", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const { rows } = await pool.query(
      `
      SELECT
        merchant,
        SUM(ABS(amount)) AS total_spent,
        COUNT(*) AS visit_count,
        ROUND(AVG(ABS(amount)), 2) AS avg_transaction,
        RANK() OVER (ORDER BY SUM(ABS(amount)) DESC) AS rank
      FROM transactions
      WHERE amount < 0
      GROUP BY merchant
      ORDER BY total_spent DESC
      LIMIT $1
      `,
      [limit]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/daily-balance?account_id=1
// Demonstrates: window function (SUM OVER for running total), generate_series
router.get("/daily-balance", async (req, res, next) => {
  try {
    const accountId = Number(req.query.account_id) || 1;

    const { rows } = await pool.query(
      `
      WITH date_range AS (
        SELECT MIN(transaction_date) AS start_date, MAX(transaction_date) AS end_date
        FROM transactions WHERE account_id = $1
      ),
      dates AS (
        SELECT d::DATE AS date
        FROM date_range, generate_series(start_date, end_date, '1 day'::INTERVAL) d
      ),
      daily AS (
        SELECT
          d.date,
          COALESCE(SUM(t.amount), 0) AS daily_net
        FROM dates d
        LEFT JOIN transactions t
          ON t.transaction_date = d.date
          AND t.account_id = $1
        GROUP BY d.date
      )
      SELECT
        date,
        daily_net,
        SUM(daily_net) OVER (ORDER BY date) AS running_balance
      FROM daily
      ORDER BY date
      `,
      [accountId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
