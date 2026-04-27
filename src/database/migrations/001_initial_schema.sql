-- Accounts: checking, savings, credit, investment
CREATE TABLE IF NOT EXISTS accounts (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'investment')),
    currency        VARCHAR(3) NOT NULL DEFAULT 'EUR',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spending categories with display metadata
CREATE TABLE IF NOT EXISTS categories (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(50) NOT NULL UNIQUE,
    icon    VARCHAR(10) NOT NULL DEFAULT '📦',
    color   VARCHAR(7) NOT NULL DEFAULT '#6B7280'
);

-- Transactions: positive = income, negative = expense
CREATE TABLE IF NOT EXISTS transactions (
    id                  SERIAL PRIMARY KEY,
    account_id          INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id         INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    amount              NUMERIC(12,2) NOT NULL,
    description         VARCHAR(255) NOT NULL,
    merchant            VARCHAR(100) NOT NULL,
    transaction_date    DATE NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Budgets: monthly spending limits per category
CREATE TABLE IF NOT EXISTS budgets (
    id              SERIAL PRIMARY KEY,
    category_id     INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    month           DATE NOT NULL,
    limit_amount    NUMERIC(12,2) NOT NULL CHECK (limit_amount > 0),
    UNIQUE(category_id, month)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
