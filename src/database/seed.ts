import pool from "./connection.js";

const categories = [
  { name: "Salary", icon: "💰", color: "#10B981" },
  { name: "Freelance", icon: "💻", color: "#6366F1" },
  { name: "Groceries", icon: "🛒", color: "#F59E0B" },
  { name: "Rent", icon: "🏠", color: "#EF4444" },
  { name: "Utilities", icon: "⚡", color: "#8B5CF6" },
  { name: "Transport", icon: "🚌", color: "#3B82F6" },
  { name: "Dining Out", icon: "🍽️", color: "#EC4899" },
  { name: "Entertainment", icon: "🎬", color: "#F97316" },
  { name: "Healthcare", icon: "🏥", color: "#14B8A6" },
  { name: "Shopping", icon: "🛍️", color: "#A855F7" },
  { name: "Subscriptions", icon: "📱", color: "#64748B" },
  { name: "Insurance", icon: "🛡️", color: "#0EA5E9" },
  { name: "Education", icon: "📚", color: "#22D3EE" },
  { name: "Savings Transfer", icon: "🏦", color: "#059669" },
];

const merchants: Record<string, string[]> = {
  Groceries: ["REWE", "EDEKA", "Lidl", "Aldi", "Netto"],
  Rent: ["Hausverwaltung Schmidt"],
  Utilities: ["Stadtwerke München", "Vodafone DE", "Telekom"],
  Transport: ["MVV München", "Deutsche Bahn", "Shell Tankstelle"],
  "Dining Out": ["Augustiner Keller", "Vapiano", "Café Mozart", "Döner Kebab Haus"],
  Entertainment: ["Netflix", "Spotify", "UCI Kino", "Steam"],
  Healthcare: ["Apotheke am Markt", "Dr. Weber Praxis", "AOK Bayern"],
  Shopping: ["Amazon.de", "Zalando", "MediaMarkt", "IKEA"],
  Subscriptions: ["Netflix", "Spotify", "iCloud", "GitHub Pro", "ChatGPT Plus"],
  Insurance: ["Allianz Versicherung", "HUK-COBURG"],
  Education: ["The Open University", "Udemy", "O'Reilly Media"],
  Salary: ["Employer - Deutsche Post"],
  Freelance: ["Client - Data Analysis", "Client - Web Project"],
  "Savings Transfer": ["Sparkasse Savings"],
};

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface MonthlyPattern {
  category: string;
  min: number;
  max: number;
  frequency: number; // transactions per month
  isIncome?: boolean;
  isFixed?: boolean;
}

const monthlyPatterns: MonthlyPattern[] = [
  { category: "Salary", min: 2800, max: 2800, frequency: 1, isIncome: true, isFixed: true },
  { category: "Freelance", min: 200, max: 800, frequency: 1, isIncome: true },
  { category: "Rent", min: -950, max: -950, frequency: 1, isFixed: true },
  { category: "Groceries", min: -15, max: -85, frequency: 10 },
  { category: "Utilities", min: -45, max: -120, frequency: 2, isFixed: true },
  { category: "Transport", min: -2.5, max: -65, frequency: 4 },
  { category: "Dining Out", min: -12, max: -55, frequency: 4 },
  { category: "Entertainment", min: -8, max: -45, frequency: 2 },
  { category: "Healthcare", min: -15, max: -80, frequency: 1 },
  { category: "Shopping", min: -20, max: -150, frequency: 2 },
  { category: "Subscriptions", min: -5, max: -25, frequency: 3, isFixed: true },
  { category: "Insurance", min: -180, max: -180, frequency: 1, isFixed: true },
  { category: "Education", min: -50, max: -200, frequency: 1 },
  { category: "Savings Transfer", min: -300, max: -500, frequency: 1 },
];

async function seed() {
  await pool.query("TRUNCATE transactions, budgets, categories, accounts RESTART IDENTITY CASCADE");

  // Insert accounts
  await pool.query(`
    INSERT INTO accounts (name, type, currency) VALUES
    ('Main Checking', 'checking', 'EUR'),
    ('Emergency Savings', 'savings', 'EUR'),
    ('Visa Credit Card', 'credit', 'EUR')
  `);

  // Insert categories
  for (const cat of categories) {
    await pool.query(
      "INSERT INTO categories (name, icon, color) VALUES ($1, $2, $3)",
      [cat.name, cat.icon, cat.color]
    );
  }

  // Fetch category IDs
  const catResult = await pool.query("SELECT id, name FROM categories");
  const catMap = new Map<string, number>();
  for (const row of catResult.rows) {
    catMap.set(row.name, row.id);
  }

  // Generate 12 months of transactions
  const now = new Date();
  const transactions: Array<[number, number, number, string, string, string]> = [];

  for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
    const year = now.getFullYear();
    const month = now.getMonth() - monthOffset;
    const date = new Date(year, month, 1);
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    for (const pattern of monthlyPatterns) {
      const categoryId = catMap.get(pattern.category);
      if (!categoryId) continue;

      // Vary frequency slightly month to month
      const count = pattern.isFixed
        ? pattern.frequency
        : Math.max(1, pattern.frequency + Math.floor(Math.random() * 3) - 1);

      for (let i = 0; i < count; i++) {
        const amount = pattern.isFixed
          ? pattern.min
          : pattern.isIncome
            ? randomBetween(pattern.min, pattern.max)
            : randomBetween(pattern.min, pattern.max);

        const day = pattern.isFixed && pattern.isIncome
          ? 25 // salary on 25th
          : pattern.category === "Rent"
            ? 1
            : Math.min(Math.floor(Math.random() * daysInMonth) + 1, daysInMonth);

        const txDate = new Date(date.getFullYear(), date.getMonth(), day);
        const txDateStr = txDate.toISOString().split("T")[0];
        const merchantList = merchants[pattern.category] || ["Unknown"];
        const merchant = pickRandom(merchantList);

        const descriptions: Record<string, string[]> = {
          Salary: ["Monthly salary"],
          Freelance: ["Freelance data analysis", "Web development project", "Consulting work"],
          Groceries: ["Weekly groceries", "Quick shop", "Household supplies"],
          Rent: ["Monthly rent payment"],
          Utilities: ["Electricity bill", "Internet service", "Water bill", "Phone plan"],
          Transport: ["Monthly transit pass", "Fuel top-up", "Train ticket", "Taxi ride"],
          "Dining Out": ["Lunch with colleagues", "Dinner out", "Coffee meeting", "Weekend brunch"],
          Entertainment: ["Movie tickets", "Streaming service", "Concert tickets", "Game purchase"],
          Healthcare: ["Pharmacy", "Doctor visit", "Health insurance co-pay"],
          Shopping: ["Online order", "Clothing", "Electronics", "Home supplies"],
          Subscriptions: ["Monthly subscription", "Annual plan renewal", "Cloud storage"],
          Insurance: ["Monthly insurance premium"],
          Education: ["Course materials", "Online course", "Textbooks"],
          "Savings Transfer": ["Monthly savings transfer"],
        };

        const desc = pickRandom(descriptions[pattern.category] || ["Payment"]);

        // Account: income to checking (1), savings transfer to savings (2), credit card for shopping/dining (3), rest to checking
        const accountId =
          pattern.isIncome ? 1
          : pattern.category === "Savings Transfer" ? 2
          : ["Shopping", "Dining Out", "Entertainment"].includes(pattern.category) ? 3
          : 1;

        transactions.push([accountId, categoryId, amount, desc, merchant, txDateStr]);
      }
    }
  }

  // Batch insert transactions
  const values: string[] = [];
  const params: Array<string | number> = [];
  let paramIdx = 1;

  for (const [accountId, categoryId, amount, desc, merchant, date] of transactions) {
    values.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3}, $${paramIdx + 4}, $${paramIdx + 5})`);
    params.push(accountId, categoryId, amount, desc, merchant, date);
    paramIdx += 6;
  }

  await pool.query(
    `INSERT INTO transactions (account_id, category_id, amount, description, merchant, transaction_date) VALUES ${values.join(", ")}`,
    params
  );

  // Insert budgets for last 12 months
  const budgetLimits: Record<string, number> = {
    Groceries: 500,
    Rent: 950,
    Utilities: 200,
    Transport: 150,
    "Dining Out": 200,
    Entertainment: 100,
    Healthcare: 100,
    Shopping: 250,
    Subscriptions: 80,
    Insurance: 200,
    Education: 200,
  };

  for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const monthStr = date.toISOString().split("T")[0];

    for (const [catName, limit] of Object.entries(budgetLimits)) {
      const categoryId = catMap.get(catName);
      if (!categoryId) continue;
      await pool.query(
        "INSERT INTO budgets (category_id, month, limit_amount) VALUES ($1, $2, $3)",
        [categoryId, monthStr, limit]
      );
    }
  }

  const txCount = transactions.length;
  console.log(`Seeded ${txCount} transactions across 12 months.`);
  console.log("Seed complete.");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
