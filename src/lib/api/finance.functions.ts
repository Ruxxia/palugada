import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getUserIdFromToken(token: string): string {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Format token JWT tidak valid");
    const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
    const payload = JSON.parse(payloadJson);
    if (!payload.sub) throw new Error("Token JWT tidak memiliki sub claim");
    return payload.sub;
  } catch (err) {
    console.error("Gagal men-decode auth token:", err);
    throw new Error("Sesi tidak valid. Silakan login kembali.");
  }
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase credentials not configured");
  return { url, anonKey };
}

async function supabaseRequest(endpoint: string, options: RequestInit = {}) {
  const { url, anonKey } = getSupabaseConfig();
  const headers: HeadersInit = {
    apikey: anonKey,
    "Content-Type": "application/json",
    ...options.headers,
  };
  const response = await fetch(`${url}/rest/v1/${endpoint}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const errorMsg = await response.text();
    console.error(`Supabase error (${endpoint}):`, errorMsg);
    throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  if (!text || text.trim() === "") return null;
  return JSON.parse(text);
}

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const walletSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(["Bank", "E-Wallet", "Tunai", "Investasi"]),
  balance: z.number(),
});

const transactionSchema = z.object({
  id: z.string(),
  wallet_id: z.string(),
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().nullish(),
  transaction_date: z.string(),
  is_recurring: z.boolean(),
  recurring_interval: z.enum(["weekly", "monthly", "yearly"]).nullish(),
  transfer_to_wallet_id: z.string().nullish(),
});

const budgetSchema = z.object({
  id: z.string(),
  category: z.string().min(1),
  limit_amount: z.number().positive(),
  month_year: z.string().regex(/^\d{4}-\d{2}$/),
});

const goalSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  target_amount: z.number().positive(),
  current_amount: z.number().min(0),
  target_date: z.string().nullish(),
});

// ─── 1. Fetch All Finance Data ───────────────────────────────────────────────

export const getFinanceData = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1) }))
  .handler(async ({ data }) => {
    const userId = getUserIdFromToken(data.token);
    const authHeader = { Authorization: `Bearer ${data.token}` };

    try {
      const [walletsRes, transactionsRes, budgetsRes, goalsRes] = await Promise.all([
        supabaseRequest(`finance_wallets?user_id=eq.${userId}&order=created_at.asc`, { headers: authHeader }),
        supabaseRequest(`finance_transactions?user_id=eq.${userId}&order=transaction_date.desc,created_at.desc`, { headers: authHeader }),
        supabaseRequest(`finance_budgets?user_id=eq.${userId}`, { headers: authHeader }),
        supabaseRequest(`finance_goals?user_id=eq.${userId}&order=created_at.asc`, { headers: authHeader }),
      ]);

      return {
        wallets: walletsRes || [],
        transactions: transactionsRes || [],
        budgets: budgetsRes || [],
        goals: goalsRes || [],
      };
    } catch (err: any) {
      console.error("Error fetching finance data:", err);
      throw new Error(err.message || "Gagal mengambil data keuangan");
    }
  });

// ─── 2. Save Wallet ──────────────────────────────────────────────────────────

export const saveWallet = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1), wallet: walletSchema }))
  .handler(async ({ data }) => {
    const userId = getUserIdFromToken(data.token);
    const authHeader = { Authorization: `Bearer ${data.token}` };
    const isTemp = data.wallet.id.startsWith("w_");

    const payload: any = {
      user_id: userId,
      name: data.wallet.name,
      type: data.wallet.type,
      balance: data.wallet.balance,
    };
    if (!isTemp) payload.id = data.wallet.id;

    const res = await supabaseRequest("finance_wallets", {
      method: "POST",
      headers: { ...authHeader, Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(payload),
    });

    return { success: true, wallet: res?.[0] || null };
  });

// ─── 3. Delete Wallet ────────────────────────────────────────────────────────

export const deleteWallet = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1), walletId: z.string() }))
  .handler(async ({ data }) => {
    const authHeader = { Authorization: `Bearer ${data.token}` };
    await supabaseRequest(`finance_wallets?id=eq.${data.walletId}`, {
      method: "DELETE",
      headers: authHeader,
    });
    return { success: true };
  });

// ─── 4. Save Transaction ─────────────────────────────────────────────────────

export const saveTransaction = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1), transaction: transactionSchema }))
  .handler(async ({ data }) => {
    const userId = getUserIdFromToken(data.token);
    const authHeader = { Authorization: `Bearer ${data.token}` };
    const isTemp = data.transaction.id.startsWith("tx_");

    const payload: any = {
      user_id: userId,
      wallet_id: data.transaction.wallet_id,
      type: data.transaction.type,
      amount: data.transaction.amount,
      category: data.transaction.category,
      description: data.transaction.description || null,
      transaction_date: data.transaction.transaction_date,
      is_recurring: data.transaction.is_recurring,
      recurring_interval: data.transaction.recurring_interval || null,
      transfer_to_wallet_id: data.transaction.transfer_to_wallet_id || null,
    };
    if (!isTemp) payload.id = data.transaction.id;

    const res = await supabaseRequest("finance_transactions", {
      method: "POST",
      headers: { ...authHeader, Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(payload),
    });

    return { success: true, transaction: res?.[0] || null };
  });

// ─── 5. Delete Transaction ───────────────────────────────────────────────────

export const deleteTransaction = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1), transactionId: z.string() }))
  .handler(async ({ data }) => {
    const authHeader = { Authorization: `Bearer ${data.token}` };
    await supabaseRequest(`finance_transactions?id=eq.${data.transactionId}`, {
      method: "DELETE",
      headers: authHeader,
    });
    return { success: true };
  });

// ─── 6. Save Budget ──────────────────────────────────────────────────────────

export const saveBudget = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1), budget: budgetSchema }))
  .handler(async ({ data }) => {
    const userId = getUserIdFromToken(data.token);
    const authHeader = { Authorization: `Bearer ${data.token}` };
    const isTemp = data.budget.id.startsWith("bg_");

    const payload: any = {
      user_id: userId,
      category: data.budget.category,
      limit_amount: data.budget.limit_amount,
      month_year: data.budget.month_year,
    };
    if (!isTemp) payload.id = data.budget.id;

    const res = await supabaseRequest("finance_budgets", {
      method: "POST",
      headers: { ...authHeader, Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(payload),
    });

    return { success: true, budget: res?.[0] || null };
  });

// ─── 7. Delete Budget ────────────────────────────────────────────────────────

export const deleteBudget = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1), budgetId: z.string() }))
  .handler(async ({ data }) => {
    const authHeader = { Authorization: `Bearer ${data.token}` };
    await supabaseRequest(`finance_budgets?id=eq.${data.budgetId}`, {
      method: "DELETE",
      headers: authHeader,
    });
    return { success: true };
  });

// ─── 8. Save Goal ────────────────────────────────────────────────────────────

export const saveGoal = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1), goal: goalSchema }))
  .handler(async ({ data }) => {
    const userId = getUserIdFromToken(data.token);
    const authHeader = { Authorization: `Bearer ${data.token}` };
    const isTemp = data.goal.id.startsWith("gl_");

    const payload: any = {
      user_id: userId,
      name: data.goal.name,
      target_amount: data.goal.target_amount,
      current_amount: data.goal.current_amount,
      target_date: data.goal.target_date || null,
    };
    if (!isTemp) payload.id = data.goal.id;

    const res = await supabaseRequest("finance_goals", {
      method: "POST",
      headers: { ...authHeader, Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(payload),
    });

    return { success: true, goal: res?.[0] || null };
  });

// ─── 9. Delete Goal ──────────────────────────────────────────────────────────

export const deleteGoal = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().min(1), goalId: z.string() }))
  .handler(async ({ data }) => {
    const authHeader = { Authorization: `Bearer ${data.token}` };
    await supabaseRequest(`finance_goals?id=eq.${data.goalId}`, {
      method: "DELETE",
      headers: authHeader,
    });
    return { success: true };
  });
