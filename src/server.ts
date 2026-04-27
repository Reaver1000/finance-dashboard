import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import accountsRouter from "./routes/accounts.js";
import transactionsRouter from "./routes/transactions.js";
import analyticsRouter from "./routes/analytics.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.use("/api/accounts", accountsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/analytics", analyticsRouter);

// Health check
app.get("/api/health", async (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
