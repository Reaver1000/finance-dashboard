import { Router } from "express";
import pool from "../database/connection.js";

const router = Router();

// GET /api/accounts — all accounts with current balance
router.get("/", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        a.id,
        a.name,
        a.type,
        a.currency,
        a.created_at,
        COALESCE(SUM(t.amount), 0)::NUMERIC AS balance
      FROM accounts a
      LEFT JOIN transactions t ON t.account_id = a.id
      GROUP BY a.id
      ORDER BY a.id
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/accounts/:id/transactions — paginated transactions for an account
router.get("/:id/transactions", async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;

    const { rows } = await pool.query(
      `
      SELECT
        t.id,
        t.amount,
        t.description,
        t.merchant,
        t.transaction_date,
        c.name AS category,
        c.icon AS category_icon,
        c.color AS category_color
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.account_id = $1
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT $2 OFFSET $3
      `,
      [id, limit, offset]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
