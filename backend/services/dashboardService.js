import { getTransactions, checkSupabaseTableStatus } from './transactionService.js';

export const getDashboardSummary = async (user) => {
  const transactions = await getTransactions(user, { sortBy: 'transaction_date', sortOrder: 'desc' });

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of transactions) {
    const amount = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      totalIncome += amount;
    } else if (tx.type === 'expense') {
      totalExpenses += amount;
    }
  }

  // Round to 2 decimal places
  totalIncome = Math.round(totalIncome * 100) / 100;
  totalExpenses = Math.round(totalExpenses * 100) / 100;
  const totalBalance = Math.round((totalIncome - totalExpenses) * 100) / 100;
  const savings = totalBalance;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

  let tableReady = true;
  if (!user.isDemo) {
    tableReady = await checkSupabaseTableStatus();
  }

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    savings,
    savingsRate,
    transactionCount: transactions.length,
    tableReady,
  };
};

export const getDashboardCharts = async (user) => {
  const transactions = await getTransactions(user, { sortBy: 'transaction_date', sortOrder: 'asc' });

  // 1. Expenses by Category
  const categoryMap = {};
  for (const tx of transactions) {
    if (tx.type === 'expense') {
      const cat = tx.category || 'Other';
      const amt = Number(tx.amount) || 0;
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, amount: 0, count: 0 };
      }
      categoryMap[cat].amount += amt;
      categoryMap[cat].count += 1;
    }
  }

  const expensesByCategory = Object.values(categoryMap).map((item) => ({
    ...item,
    amount: Math.round(item.amount * 100) / 100,
  }));
  // Sort category descending by amount
  expensesByCategory.sort((a, b) => b.amount - a.amount);

  // 2. Monthly Trend & Income vs Expenses
  const monthsMap = {};
  for (const tx of transactions) {
    const dateStr = tx.transaction_date;
    // Extract YYYY-MM
    const monthKey = dateStr ? dateStr.substring(0, 7) : 'Unknown';
    if (!monthsMap[monthKey]) {
      monthsMap[monthKey] = {
        month: monthKey,
        income: 0,
        expenses: 0,
        balance: 0,
      };
    }
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      monthsMap[monthKey].income += amt;
    } else if (tx.type === 'expense') {
      monthsMap[monthKey].expenses += amt;
    }
  }

  const sortedMonths = Object.keys(monthsMap).sort();
  const monthlyTrend = sortedMonths.map((m) => {
    const item = monthsMap[m];
    const income = Math.round(item.income * 100) / 100;
    const expenses = Math.round(item.expenses * 100) / 100;
    const balance = Math.round((income - expenses) * 100) / 100;

    // Create a friendly month label like "Jan 2026"
    let label = m;
    try {
      const [y, mon] = m.split('-');
      const d = new Date(parseInt(y, 10), parseInt(mon, 10) - 1, 1);
      label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      label = m;
    }

    return {
      monthKey: m,
      month: label,
      income,
      expenses,
      balance,
    };
  });

  // 3. Income vs Expenses timeline
  const incomeVsExpense = monthlyTrend.map((m) => ({
    period: m.month,
    income: m.income,
    expenses: m.expenses,
  }));

  return {
    expensesByCategory,
    monthlyTrend,
    incomeVsExpense,
  };
};
