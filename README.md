# Finance Dashboard

A full-stack personal finance analytics dashboard built with **TypeScript**, **PostgreSQL**, and **React**. Demonstrates advanced SQL including CTEs, window functions, running aggregations, and complex JOINs, served through a RESTful API with interactive data visualisations.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)

## Features

### API & SQL

- **Monthly Summary** — income vs expenses with savings rate, 3-month rolling average (CTE + window function)
- **Category Breakdown** — spending distribution with percentage calculations (CTE + CROSS JOIN)
- **Spending Trends** — month-over-month change per category using `LAG()` and rolling averages
- **Budget vs Actual** — utilisation tracking with colour-coded thresholds (LEFT JOIN + COALESCE)
- **Top Merchants** — ranked by total spend using `RANK()` window function
- **Daily Running Balance** — cumulative balance using `generate_series` + `SUM() OVER`
- Filtered, paginated transaction listing with dynamic query building

### Frontend

- Four-page dashboard: Overview, Spending, Budgets, Trends
- Interactive charts (bar, line, area, pie) via Recharts
- Euro-formatted currency display (de-DE locale)
- Responsive grid layout

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| API      | Node.js, Express, TypeScript        |
| Database | PostgreSQL 16                       |
| Frontend | React 19, Vite, Recharts            |
| Tooling  | tsx (dev), docker-compose (database) |

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL) or a PostgreSQL 16 instance

### Setup

```bash
# Clone the repository
git clone https://github.com/Reaver1000/finance-dashboard.git
cd finance-dashboard

# Start PostgreSQL
docker compose up -d

# Install dependencies
npm install
cd client && npm install && cd ..

# Create .env from template
cp .env.example .env

# Run migrations and seed data (12 months of realistic transactions)
npm run setup

# Start the API server
npm run dev

# In a second terminal, start the frontend
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### API Endpoints

| Endpoint                          | Description                              |
| --------------------------------- | ---------------------------------------- |
| `GET /api/accounts`               | Accounts with calculated balances        |
| `GET /api/transactions`           | Paginated, filterable transaction list   |
| `POST /api/transactions`          | Create a new transaction                 |
| `GET /api/analytics/monthly-summary`    | Income/expense/savings by month    |
| `GET /api/analytics/category-breakdown` | Spending distribution by category  |
| `GET /api/analytics/spending-trends`    | Month-over-month category trends   |
| `GET /api/analytics/budget-comparison`  | Budget vs actual for a given month |
| `GET /api/analytics/top-merchants`      | Highest-spend merchants ranked     |
| `GET /api/analytics/daily-balance`      | Running daily balance per account  |
| `GET /api/health`                 | Health check                             |

## Project Structure

```
finance-dashboard/
├── src/
│   ├── server.ts                  # Express app entry point
│   ├── database/
│   │   ├── connection.ts          # PostgreSQL pool
│   │   ├── migrate.ts             # Migration runner
│   │   ├── seed.ts                # 12 months of realistic seed data
│   │   └── migrations/
│   │       └── 001_initial_schema.sql
│   ├── routes/
│   │   ├── accounts.ts            # Account endpoints
│   │   ├── transactions.ts        # Transaction CRUD
│   │   └── analytics.ts           # Complex analytical queries
│   ├── types/
│   │   └── index.ts               # Shared TypeScript interfaces
│   └── middleware/
│       └── errorHandler.ts
├── client/
│   ├── src/
│   │   ├── App.tsx                # Navigation and layout
│   │   ├── api/client.ts          # Typed API client
│   │   ├── hooks/useApi.ts        # Data fetching hook
│   │   ├── components/            # Reusable UI components
│   │   └── pages/                 # Dashboard pages
│   └── vite.config.ts
├── docker-compose.yml
└── .env.example
```

## SQL Highlights

The analytics endpoints demonstrate several advanced PostgreSQL features:

- **Common Table Expressions (CTEs)** for readable multi-step queries
- **Window Functions**: `LAG()`, `RANK()`, `SUM() OVER`, `AVG() OVER` with frame clauses
- **Conditional Aggregation** with `CASE WHEN` inside `SUM()`
- **generate_series** for filling date gaps in time series data
- **Dynamic query construction** with parameterised inputs to prevent SQL injection

## Licence

MIT
