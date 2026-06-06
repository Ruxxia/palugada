export type WalletType = "Bank" | "E-Wallet" | "Tunai" | "Investasi";
export type TransactionType = "income" | "expense" | "transfer";
export type RecurringInterval = "weekly" | "monthly" | "yearly";

export interface FinanceWallet {
  id: string;
  user_id?: string;
  name: string;
  type: WalletType;
  balance: number;
  created_at?: string;
}

export interface FinanceTransaction {
  id: string;
  user_id?: string;
  wallet_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  transaction_date: string;
  is_recurring: boolean;
  recurring_interval?: RecurringInterval;
  transfer_to_wallet_id?: string;
  created_at?: string;
}

export interface FinanceBudget {
  id: string;
  user_id?: string;
  category: string;
  limit_amount: number;
  month_year: string; // format "YYYY-MM"
  created_at?: string;
}

export interface FinanceGoal {
  id: string;
  user_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  created_at?: string;
}

export const WALLET_TYPE_ICONS: Record<WalletType, string> = {
  Bank: "🏦",
  "E-Wallet": "📱",
  Tunai: "💵",
  Investasi: "📈",
};

export const EXPENSE_CATEGORIES = [
  "Makanan & Minuman",
  "Transportasi",
  "Belanja Online",
  "Tagihan & Utilitas",
  "Kesehatan",
  "Hiburan",
  "Pendidikan",
  "Investasi",
  "Cicilan / Paylater",
  "Lainnya",
];

export const INCOME_CATEGORIES = [
  "Gaji",
  "Bonus",
  "Freelance",
  "Bisnis",
  "Investasi",
  "Hadiah",
  "Lainnya",
];

export const CATEGORY_ICONS: Record<string, string> = {
  "Makanan & Minuman": "🍜",
  "Transportasi": "🚗",
  "Belanja Online": "🛍️",
  "Tagihan & Utilitas": "💡",
  "Kesehatan": "🏥",
  "Hiburan": "🎬",
  "Pendidikan": "📚",
  "Investasi": "📈",
  "Cicilan / Paylater": "💳",
  "Gaji": "💼",
  "Bonus": "🎁",
  "Freelance": "💻",
  "Bisnis": "🏪",
  "Hadiah": "🎁",
  "Lainnya": "📌",
};

export const CATEGORY_COLORS: Record<string, string> = {
  "Makanan & Minuman": "#f97316",
  "Transportasi": "#3b82f6",
  "Belanja Online": "#a855f7",
  "Tagihan & Utilitas": "#eab308",
  "Kesehatan": "#22c55e",
  "Hiburan": "#ec4899",
  "Pendidikan": "#06b6d4",
  "Investasi": "#10b981",
  "Cicilan / Paylater": "#ef4444",
  "Gaji": "#22c55e",
  "Bonus": "#84cc16",
  "Freelance": "#14b8a6",
  "Bisnis": "#f59e0b",
  "Hadiah": "#e879f9",
  "Lainnya": "#94a3b8",
};
