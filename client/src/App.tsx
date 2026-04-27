import { useState } from "react";
import { Overview } from "./pages/Overview.tsx";
import { Spending } from "./pages/Spending.tsx";
import { Budgets } from "./pages/Budgets.tsx";
import { Trends } from "./pages/Trends.tsx";

type Page = "overview" | "spending" | "budgets" | "trends";

const NAV_ITEMS: { key: Page; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "spending", label: "Spending" },
  { key: "budgets", label: "Budgets" },
  { key: "trends", label: "Trends" },
];

export default function App() {
  const [page, setPage] = useState<Page>("overview");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F9FAFB",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        background: "#fff",
        borderBottom: "1px solid #E5E7EB",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        height: 56,
        gap: 32,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>
          Finance Dashboard
        </h1>
        <nav style={{ display: "flex", gap: 4 }}>
          {NAV_ITEMS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: 6,
                background: page === key ? "#EEF2FF" : "transparent",
                color: page === key ? "#4F46E5" : "#6B7280",
                fontWeight: page === key ? 600 : 500,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 32px" }}>
        {page === "overview" && <Overview />}
        {page === "spending" && <Spending />}
        {page === "budgets" && <Budgets />}
        {page === "trends" && <Trends />}
      </main>
    </div>
  );
}
