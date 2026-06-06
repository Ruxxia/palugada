import { useMemo } from "react";
import { CheckCircle, Clock, RefreshCw } from "lucide-react";
import { FinanceTransaction, FinanceWallet, CATEGORY_ICONS } from "./types";

interface Props {
  transactions: FinanceTransaction[];
  wallets: FinanceWallet[];
  onMarkPaid: (tx: FinanceTransaction) => Promise<void>;
}

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const INTERVAL_LABEL: Record<string, string> = {
  weekly: "Mingguan",
  monthly: "Bulanan",
  yearly: "Tahunan",
};

export default function RecurringTab({ transactions, wallets, onMarkPaid }: Props) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Get all recurring transactions (deduplicated by description+category, taking the most recent per group)
  const recurringTemplates = useMemo(() => {
    const recurring = transactions.filter(tx => tx.is_recurring);
    // Deduplicate by category + description key, keep only latest entry per group
    const seen = new Map<string, FinanceTransaction>();
    for (const tx of recurring) {
      const key = `${tx.category}|${tx.description || ""}|${tx.wallet_id}`;
      if (!seen.has(key) || new Date(tx.transaction_date) > new Date(seen.get(key)!.transaction_date)) {
        seen.set(key, tx);
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.category.localeCompare(b.category));
  }, [transactions]);

  // Check which are already paid this month
  const paidThisMonth = useMemo(() => {
    const paid = new Set<string>();
    const monthTx = transactions.filter(tx => tx.transaction_date.startsWith(currentMonth) && tx.is_recurring);
    for (const tx of monthTx) {
      const key = `${tx.category}|${tx.description || ""}|${tx.wallet_id}`;
      paid.add(key);
    }
    return paid;
  }, [transactions, currentMonth]);

  const totalMonthlyRecurring = useMemo(() => {
    return recurringTemplates
      .filter(tx => !tx.recurring_interval || tx.recurring_interval === "monthly")
      .reduce((s, tx) => s + tx.amount, 0);
  }, [recurringTemplates]);

  const paidCount = useMemo(() => {
    return recurringTemplates.filter(tx => {
      const key = `${tx.category}|${tx.description || ""}|${tx.wallet_id}`;
      return paidThisMonth.has(key);
    }).length;
  }, [recurringTemplates, paidThisMonth]);

  if (recurringTemplates.length === 0) {
    return (
      <div className="text-center py-16 text-foreground/30 border-2 border-dashed border-foreground/15 rounded-2xl">
        <RefreshCw size={40} className="mx-auto mb-3 opacity-30 animate-spin duration-3000" />
        <p className="font-bold text-sm text-foreground/80">Belum ada tagihan rutin</p>
        <p className="text-xs mt-1 text-foreground/50">Tambahkan transaksi dengan centang "Tagihan Rutin" di tab Transaksi</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 select-none">
        <div className="bg-card border border-foreground/15 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-foreground/50 mb-1">Total Tagihan Bulanan</p>
          <p className="text-xl font-display font-bold text-rose-600 dark:text-rose-400">{formatIDR(totalMonthlyRecurring)}</p>
        </div>
        <div className="bg-card border border-foreground/15 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-foreground/50 mb-1">Sudah Dibayar Bulan Ini</p>
          <p className="text-xl font-display font-bold text-emerald-600 dark:text-emerald-400">{paidCount} / {recurringTemplates.length}</p>
        </div>
        <div className="bg-card border border-foreground/15 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-foreground/50 mb-1">Belum Dibayar</p>
          <p className="text-xl font-display font-bold text-amber-600 dark:text-amber-500">{recurringTemplates.length - paidCount} tagihan</p>
        </div>
      </div>

      {/* Tagihan List */}
      <div className="space-y-2">
        {recurringTemplates.map(tx => {
          const key = `${tx.category}|${tx.description || ""}|${tx.wallet_id}`;
          const isPaid = paidThisMonth.has(key);
          const wallet = wallets.find(w => w.id === tx.wallet_id);

          return (
            <div key={key} className={`flex items-center gap-4 border rounded-xl px-4 py-3.5 transition-all shadow-sm ${isPaid ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30" : "bg-card border-foreground/15 hover:border-foreground/30"}`}>
              <span className="text-xl w-8 text-center flex-shrink-0 select-none">{CATEGORY_ICONS[tx.category] || "📌"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{tx.description || tx.category}</p>
                <div className="flex items-center gap-2 mt-0.5 select-none text-[10px] text-foreground/45 font-medium">
                  <span>{tx.category}</span>
                  <span className="text-foreground/20">·</span>
                  <span>{wallet?.name || "—"}</span>
                  <span className="text-foreground/20">·</span>
                  <span className="text-primary font-bold">{INTERVAL_LABEL[tx.recurring_interval || "monthly"] || "Bulanan"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 select-none">
                <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">{formatIDR(tx.amount)}</span>
                {isPaid ? (
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/35 rounded-lg px-2.5 py-1.5">
                    <CheckCircle size={12} />
                    <span>Lunas</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onMarkPaid(tx)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded-lg tracking-wider shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Clock size={12} />
                    <span>Bayar</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
