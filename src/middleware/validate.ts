import type { Request, Response, NextFunction } from "express";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function validateMonth(req: Request, res: Response, next: NextFunction): void {
  const month = req.query.month as string | undefined;
  if (month && !MONTH_PATTERN.test(month)) {
    res.status(400).json({ error: "Invalid month format. Expected YYYY-MM." });
    return;
  }
  next();
}
