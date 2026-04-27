import { Router } from "express";
import pool from "../database/connection.js";

const router = Router();

// GET /api/transactions — recent transactions with filtering
router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const category = req.query.category as string | undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    const conditions: string[] = [];
    const params: Array<string | number> = [];
    let paramIdx = 1;

    if (category) {
      conditions.push(`c.name = $${paramIdx++}`);
      params.push(category);
    }
    if (from) {
      conditions.push(`t.transaction_date >= $${paramIdx++}`);
      params.push(from);
    }
    if (to) {
      conditions.push(`t.transaction_date <= $${paramIdx++}`);
      params.push(to);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const { rows } = await pool.query(
      `
      SELECT
        t.id,
        t.amount,
        t.description,
        t.merchant,
        t.transaction_date,
        a.name AS account,
        c.name AS category,
        c.icon AS category_icon,
        c.color AS category_color
      FROM transactions t
      JOIN accounts a ON a.id = t.account_id
      JOIN categories c ON c.id = t.category_id
      ${where}
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx}
      `,
      [...params, limit, offset]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/transactions — create a new transaction
router.post("/", async (req, res, next) => {
  try {
    const { account_id, category_id, amount, description, merchant, transaction_date } = req.body;

    if (!account_id || !category_id || amount == null || !description || !merchant || !transaction_date) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const { rows } = await pool.query(
      `
      INSERT INTO transactions (account_id, category_id, amount, description, merchant, transaction_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [account_id, category_id, amount, description, merchant, transaction_date]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
