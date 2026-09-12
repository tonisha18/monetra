import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase.js';

// Fallback in-memory store for demo users
const demoTransactions = new Map();

// Active cache for accounts when Supabase table is pending creation in PostgreSQL
const userPendingTransactions = new Map();

// Helper to seed initial sample data for demo user only if empty
const getDemoUserTransactions = (userId) => {
  if (!demoTransactions.has(userId)) {
    const today = new Date();
    const d = (daysAgo, timeStr = '10:30') => {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      const dateStr = date.toISOString().split('T')[0];
      return {
        date: dateStr,
        time: timeStr,
        createdAt: new Date(`${dateStr}T${timeStr}:00`).toISOString(),
      };
    };

    const d1 = d(1, '09:45');
    const d2 = d(3, '14:20');
    const d3 = d(5, '18:15');
    const d4 = d(7, '08:30');
    const d5 = d(10, '16:00');
    const d6 = d(12, '11:10');

    const initial = [
      {
        id: 'demo-tx-1',
        user_id: userId,
        type: 'income',
        amount: 85000,
        category: 'Salary',
        description: 'Monthly Tech Salary',
        transaction_date: d1.date,
        transaction_time: d1.time,
        created_at: d1.createdAt,
        updated_at: d1.createdAt,
      },
      {
        id: 'demo-tx-2',
        user_id: userId,
        type: 'expense',
        amount: 24000,
        category: 'Rent',
        description: 'Apartment Monthly Rent',
        transaction_date: d2.date,
        transaction_time: d2.time,
        created_at: d2.createdAt,
        updated_at: d2.createdAt,
      },
      {
        id: 'demo-tx-3',
        user_id: userId,
        type: 'expense',
        amount: 3850,
        category: 'Food',
        description: 'Supermarket Grocery Haul',
        transaction_date: d3.date,
        transaction_time: d3.time,
        created_at: d3.createdAt,
        updated_at: d3.createdAt,
      },
      {
        id: 'demo-tx-4',
        user_id: userId,
        type: 'expense',
        amount: 1450,
        category: 'Transport',
        description: 'Metro Monthly Smartcard',
        transaction_date: d4.date,
        transaction_time: d4.time,
        created_at: d4.createdAt,
        updated_at: d4.createdAt,
      },
      {
        id: 'demo-tx-5',
        user_id: userId,
        type: 'income',
        amount: 18000,
        category: 'Freelance',
        description: 'UI Design Consulting Project',
        transaction_date: d5.date,
        transaction_time: d5.time,
        created_at: d5.createdAt,
        updated_at: d5.createdAt,
      },
      {
        id: 'demo-tx-6',
        user_id: userId,
        type: 'expense',
        amount: 2200,
        category: 'Bills',
        description: 'High-speed Fiber & Electricity Bill',
        transaction_date: d6.date,
        transaction_time: d6.time,
        created_at: d6.createdAt,
        updated_at: d6.createdAt,
      },
    ];
    demoTransactions.set(userId, initial);
  }
  return demoTransactions.get(userId);
};

// Check if transactions table exists in Supabase schema cache
let isTransactionsTableReady = null;
let lastTableCheckTime = 0;

export const checkSupabaseTableStatus = async () => {
  const now = Date.now();
  if (isTransactionsTableReady !== null && now - lastTableCheckTime < 10000) {
    return isTransactionsTableReady;
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    isTransactionsTableReady = false;
    lastTableCheckTime = now;
    return false;
  }

  try {
    const { error } = await supabase.from('transactions').select('id').limit(1);
    if (!error) {
      isTransactionsTableReady = true;
      lastTableCheckTime = now;
      return true;
    }
    if (
      error.code === 'PGRST205' ||
      error.message?.includes('schema cache') ||
      error.message?.includes('does not exist')
    ) {
      isTransactionsTableReady = false;
      lastTableCheckTime = now;
      return false;
    }
    // Any other error (e.g. temporary network issue), don't permanently flag false
    lastTableCheckTime = now;
    return false;
  } catch {
    isTransactionsTableReady = false;
    lastTableCheckTime = now;
    return false;
  }
};

// Auto-sync any pending user transactions into Supabase PostgreSQL when table becomes ready
const syncPendingTransactions = async (userId) => {
  const pending = userPendingTransactions.get(userId);
  if (!pending || pending.length === 0) return;

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const toInsert = pending.map((tx) => ({
      user_id: userId,
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description,
      transaction_date: tx.transaction_date,
      created_at: tx.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('transactions').insert(toInsert);
    if (!error) {
      console.log(`Successfully migrated ${pending.length} pending transactions to Supabase for user ${userId}`);
      userPendingTransactions.delete(userId);
    }
  } catch (err) {
    console.warn('Sync pending transactions error:', err.message);
  }
};

export const getTransactions = async (user, filters = {}) => {
  const {
    type,
    category,
    search,
    startDate,
    endDate,
    sortBy = 'transaction_date',
    sortOrder = 'desc',
  } = filters;

  if (user.isDemo) {
    let list = [...getDemoUserTransactions(user.id)];

    if (type && type !== 'all') {
      list = list.filter((tx) => tx.type.toLowerCase() === type.toLowerCase());
    }

    if (category && category !== 'all') {
      list = list.filter((tx) => tx.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (tx) =>
          tx.description.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q)
      );
    }

    if (startDate) {
      list = list.filter((tx) => tx.transaction_date >= startDate);
    }

    if (endDate) {
      list = list.filter((tx) => tx.transaction_date <= endDate);
    }

    // Sort
    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'amount') {
        comparison = Number(a.amount) - Number(b.amount);
      } else {
        comparison = new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }

  // Check if Supabase PostgreSQL table is created
  const tableReady = await checkSupabaseTableStatus();

  if (tableReady) {
    // If user has any pending cached transactions from before table was created, sync them now!
    await syncPendingTransactions(user.id);

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id);

    if (type && type !== 'all') {
      query = query.eq('type', type.toLowerCase());
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      const q = search.trim();
      query = query.or(`description.ilike.%${q}%,category.ilike.%${q}%`);
    }

    if (startDate) {
      query = query.gte('transaction_date', startDate);
    }

    if (endDate) {
      query = query.lte('transaction_date', endDate);
    }

    const validSortColumns = ['transaction_date', 'amount', 'created_at'];
    const column = validSortColumns.includes(sortBy) ? sortBy : 'transaction_date';
    const ascending = sortOrder === 'asc';

    query = query.order(column, { ascending });

    const { data, error } = await query;
    if (error) {
      if (
        error.code === 'PGRST205' ||
        error.message?.includes('schema cache') ||
        error.message?.includes('does not exist')
      ) {
        isTransactionsTableReady = false;
        // Fall back to user pending store below
      } else {
        throw error;
      }
    } else {
      return (data || []).map((tx) => ({ ...tx, persistedToSupabase: true }));
    }
  }

  // Fallback: If table is not created in Supabase yet, return user's active session transactions
  if (!userPendingTransactions.has(user.id)) {
    userPendingTransactions.set(user.id, []);
  }

  let list = [...(userPendingTransactions.get(user.id) || [])];

  if (type && type !== 'all') {
    list = list.filter((tx) => tx.type.toLowerCase() === type.toLowerCase());
  }

  if (category && category !== 'all') {
    list = list.filter((tx) => tx.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (tx) =>
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q)
    );
  }

  if (startDate) {
    list = list.filter((tx) => tx.transaction_date >= startDate);
  }

  if (endDate) {
    list = list.filter((tx) => tx.transaction_date <= endDate);
  }

  list.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'amount') {
      comparison = Number(a.amount) - Number(b.amount);
    } else {
      comparison = new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return list.map((tx) => ({ ...tx, tablePending: true, persistedToSupabase: false }));
};

export const getTransactionById = async (user, id) => {
  if (user.isDemo) {
    const list = getDemoUserTransactions(user.id);
    const tx = list.find((item) => item.id === id);
    if (!tx) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      throw err;
    }
    return tx;
  }

  const tableReady = await checkSupabaseTableStatus();
  if (tableReady) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        return { ...data, persistedToSupabase: true };
      }
    }
  }

  // Fallback to pending user store
  const list = userPendingTransactions.get(user.id) || [];
  const tx = list.find((item) => item.id === id);
  if (!tx) {
    const err = new Error('Transaction not found');
    err.statusCode = 404;
    throw err;
  }
  return { ...tx, tablePending: true, persistedToSupabase: false };
};

export const createTransaction = async (user, payload) => {
  const { type, amount, category, description, transaction_date, transaction_time } = payload;

  if (!type || !['income', 'expense'].includes(type.toLowerCase())) {
    const err = new Error("Valid type ('income' or 'expense') is required");
    err.statusCode = 400;
    throw err;
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    const err = new Error('Amount must be a positive number greater than 0');
    err.statusCode = 400;
    throw err;
  }

  if (!category || !category.trim()) {
    const err = new Error('Category is required');
    err.statusCode = 400;
    throw err;
  }

  if (!description || !description.trim()) {
    const err = new Error('Description is required');
    err.statusCode = 400;
    throw err;
  }

  if (!transaction_date) {
    const err = new Error('Transaction date is required');
    err.statusCode = 400;
    throw err;
  }

  let exactCreatedAt = new Date().toISOString();
  if (transaction_date && transaction_time) {
    try {
      const dt = new Date(`${transaction_date}T${transaction_time}:00`);
      if (!isNaN(dt.getTime())) {
        exactCreatedAt = dt.toISOString();
      }
    } catch {
      // fallback
    }
  } else if (payload.created_at) {
    exactCreatedAt = payload.created_at;
  }

  const cleanData = {
    user_id: user.id,
    type: type.toLowerCase(),
    amount: Math.round(numericAmount * 100) / 100,
    category: category.trim(),
    description: description.trim(),
    transaction_date: transaction_date,
    created_at: exactCreatedAt,
    updated_at: new Date().toISOString(),
  };

  if (user.isDemo) {
    const list = getDemoUserTransactions(user.id);
    const newTx = {
      ...cleanData,
      transaction_time: transaction_time || exactCreatedAt.substring(11, 16),
      id: `demo-tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    list.unshift(newTx);
    return newTx;
  }

  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client is not configured');

  const tableReady = await checkSupabaseTableStatus();

  if (tableReady) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([cleanData])
      .select()
      .single();

    if (!error && data) {
      return {
        ...data,
        transaction_time: transaction_time || (data.created_at ? data.created_at.substring(11, 16) : undefined),
        persistedToSupabase: true,
      };
    }

    if (
      error &&
      (error.code === 'PGRST205' ||
        error.message?.includes('schema cache') ||
        error.message?.includes('does not exist'))
    ) {
      isTransactionsTableReady = false;
    } else if (error) {
      throw error;
    }
  }

  // Fallback: Supabase table not created yet in PostgreSQL.
  // Store safely in account memory store and inform caller
  if (!userPendingTransactions.has(user.id)) {
    userPendingTransactions.set(user.id, []);
  }

  const pendingTx = {
    ...cleanData,
    id: `sb-tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    created_at: new Date().toISOString(),
    tablePending: true,
    persistedToSupabase: false,
  };

  userPendingTransactions.get(user.id).unshift(pendingTx);
  return pendingTx;
};

export const updateTransaction = async (user, id, payload) => {
  const { type, amount, category, description, transaction_date, transaction_time } = payload;

  const updates = {};

  if (type !== undefined) {
    if (!['income', 'expense'].includes(type.toLowerCase())) {
      const err = new Error("Type must be 'income' or 'expense'");
      err.statusCode = 400;
      throw err;
    }
    updates.type = type.toLowerCase();
  }

  if (amount !== undefined) {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      const err = new Error('Amount must be a positive number greater than 0');
      err.statusCode = 400;
      throw err;
    }
    updates.amount = Math.round(numericAmount * 100) / 100;
  }

  if (category !== undefined) {
    if (!category.trim()) {
      const err = new Error('Category cannot be empty');
      err.statusCode = 400;
      throw err;
    }
    updates.category = category.trim();
  }

  if (description !== undefined) {
    if (!description.trim()) {
      const err = new Error('Description cannot be empty');
      err.statusCode = 400;
      throw err;
    }
    updates.description = description.trim();
  }

  if (transaction_date !== undefined) {
    if (!transaction_date) {
      const err = new Error('Transaction date cannot be empty');
      err.statusCode = 400;
      throw err;
    }
    updates.transaction_date = transaction_date;
  }

  if (transaction_time !== undefined) {
    updates.transaction_time = transaction_time;
  }

  if (transaction_date && transaction_time) {
    try {
      const dt = new Date(`${transaction_date}T${transaction_time}:00`);
      if (!isNaN(dt.getTime())) {
        updates.created_at = dt.toISOString();
      }
    } catch {
      // ignore
    }
  }

  updates.updated_at = new Date().toISOString();

  if (user.isDemo) {
    const list = getDemoUserTransactions(user.id);
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      throw err;
    }
    list[index] = { ...list[index], ...updates };
    return list[index];
  }

  const tableReady = await checkSupabaseTableStatus();
  if (tableReady) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (!error && data) {
        return { ...data, persistedToSupabase: true };
      }
    }
  }

  // Fallback update in pending store
  const list = userPendingTransactions.get(user.id) || [];
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) {
    const err = new Error('Transaction not found');
    err.statusCode = 404;
    throw err;
  }
  list[index] = { ...list[index], ...updates };
  return { ...list[index], tablePending: true, persistedToSupabase: false };
};

export const deleteTransaction = async (user, id) => {
  if (user.isDemo) {
    const list = getDemoUserTransactions(user.id);
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      throw err;
    }
    const deleted = list.splice(index, 1)[0];
    return deleted;
  }

  const tableReady = await checkSupabaseTableStatus();
  if (tableReady) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (!error && data) {
        return { ...data, persistedToSupabase: true };
      }
    }
  }

  // Fallback delete from pending store
  const list = userPendingTransactions.get(user.id) || [];
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) {
    const err = new Error('Transaction not found');
    err.statusCode = 404;
    throw err;
  }
  const deleted = list.splice(index, 1)[0];
  return { ...deleted, tablePending: true, persistedToSupabase: false };
};
