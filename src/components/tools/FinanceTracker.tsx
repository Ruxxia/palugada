import { useState, useEffect, useRef, useCallback } from "react";
import { CloudOff, Cloud, RefreshCw } from "lucide-react";
import {
  getFinanceData, saveWallet, deleteWallet,
  saveTransaction, deleteTransaction,
  saveBudget, deleteBudget,
  saveGoal, deleteGoal,
} from "../../lib/api/finance.functions";
import {
  FinanceWallet, FinanceTransaction, FinanceBudget, FinanceGoal
} from "./financetracker/types";
import OverviewTab from "./financetracker/OverviewTab";
import TransactionTab from "./financetracker/TransactionTab";
import BudgetTab from "./financetracker/BudgetTab";
import GoalsTab from "./financetracker/GoalsTab";
import RecurringTab from "./financetracker/RecurringTab";
import ExportTab from "./financetracker/ExportTab";

type Tab = "overview" | "transactions" | "budgets" | "goals" | "recurring" | "export";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "overview", label: "Ringkasan", icon: "📊" },
  { key: "transactions", label: "Transaksi", icon: "💳" },
  { key: "budgets", label: "Anggaran", icon: "📋" },
  { key: "goals", label: "Goals", icon: "🎯" },
  { key: "recurring", label: "Tagihan Rutin", icon: "🔄" },
  { key: "export", label: "Ekspor", icon: "📄" },
];

const LS_WALLETS = "kelolauang_wallets";
const LS_TRANSACTIONS = "kelolauang_transactions";
const LS_BUDGETS = "kelolauang_budgets";
const LS_GOALS = "kelolauang_goals";

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function writeLS(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
}

export function FinanceTracker() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");

  const [wallets, setWallets] = useState<FinanceWallet[]>(() => readLS(LS_WALLETS, []));
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() => readLS(LS_TRANSACTIONS, []));
  const [budgets, setBudgets] = useState<FinanceBudget[]>(() => readLS(LS_BUDGETS, []));
  const [goals, setGoals] = useState<FinanceGoal[]>(() => readLS(LS_GOALS, []));

  // Auth check
  useEffect(() => {
    const check = () => {
      try {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("user");
        if (token && userStr) {
          setIsLoggedIn(true);
          setAuthToken(token);
        } else {
          setIsLoggedIn(false);
          setAuthToken(null);
        }
      } catch { setIsLoggedIn(false); }
    };
    check();
    window.addEventListener("storage", check);
    window.addEventListener("bookmark_change", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("bookmark_change", check);
    };
  }, []);

  // Fetch from Supabase when logged in
  useEffect(() => {
    if (!isLoggedIn || !authToken) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getFinanceData({ data: { token: authToken } });
        setWallets(res.wallets);
        setTransactions(res.transactions);
        setBudgets(res.budgets);
        setGoals(res.goals);
        writeLS(LS_WALLETS, res.wallets);
        writeLS(LS_TRANSACTIONS, res.transactions);
        writeLS(LS_BUDGETS, res.budgets);
        writeLS(LS_GOALS, res.goals);
        setSyncStatus("synced");
      } catch (err: any) {
        console.error("Gagal memuat data keuangan:", err);
        setSyncStatus("error");
        // Session expired
        if (err?.message?.includes("401") || err?.message?.includes("Sesi tidak valid")) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
          setAuthToken(null);
          window.dispatchEvent(new Event("storage"));
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isLoggedIn, authToken]);

  // Sync helpers
  const getAuth = () => ({ token: authToken! });

  // Wallet Actions ──────────────────────────────────────────────────────────
  const handleSaveWallet = useCallback(async (w: Omit<FinanceWallet, "user_id" | "created_at">) => {
    let savedWallet: FinanceWallet | null = null;
    if (isLoggedIn && authToken) {
      setSyncStatus("syncing");
      try {
        const res = await saveWallet({ data: { token: authToken, wallet: w } });
        savedWallet = res.wallet;
      } catch {
        setSyncStatus("error");
        return;
      }
    }
    setWallets(prev => {
      const actualWallet = savedWallet || (w as FinanceWallet);
      const idx = prev.findIndex(x => x.id === w.id);
      const next = idx >= 0 ? prev.map((x, i) => i === idx ? actualWallet : x) : [...prev, actualWallet];
      writeLS(LS_WALLETS, next);
      return next;
    });
    if (isLoggedIn) setSyncStatus("synced");
  }, [isLoggedIn, authToken]);

  const handleDeleteWallet = useCallback(async (id: string) => {
    if (isLoggedIn && authToken) {
      setSyncStatus("syncing");
      try { await deleteWallet({ data: { token: authToken, walletId: id } }); } catch { setSyncStatus("error"); return; }
    }
    setWallets(prev => { const next = prev.filter(x => x.id !== id); writeLS(LS_WALLETS, next); return next; });
    if (isLoggedIn) setSyncStatus("synced");
  }, [isLoggedIn, authToken]);

  // ── Transaction Actions ─────────────────────────────────────────────────────
  const handleSaveTransaction = useCallback(async (tx: Omit<FinanceTransaction, "user_id" | "created_at">) => {
    let savedTx: FinanceTransaction | null = null;
    if (isLoggedIn && authToken) {
      setSyncStatus("syncing");
      try {
        const res = await saveTransaction({ data: { token: authToken, transaction: tx } });
        savedTx = res.transaction;
      } catch {
        setSyncStatus("error");
        return;
      }
    }
    // After saving, re-fetch wallets and transactions from server to get updated balances & correct client IDs (triggers/DB default values affect them)
    if (isLoggedIn && authToken) {
      try {
        const res = await getFinanceData({ data: { token: authToken } });
        setWallets(res.wallets);
        setTransactions(res.transactions);
        writeLS(LS_WALLETS, res.wallets);
        writeLS(LS_TRANSACTIONS, res.transactions);
        setSyncStatus("synced");
        return;
      } catch { }
    }
    // Offline fallback
    setTransactions(prev => {
      const actualTx = savedTx || (tx as FinanceTransaction);
      const idx = prev.findIndex(x => x.id === tx.id);
      const next = idx >= 0 ? prev.map((x, i) => i === idx ? actualTx : x) : [actualTx, ...prev];
      writeLS(LS_TRANSACTIONS, next);
      return next;
    });
  }, [isLoggedIn, authToken]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    if (isLoggedIn && authToken) {
      setSyncStatus("syncing");
      try { await deleteTransaction({ data: { token: authToken, transactionId: id } }); } catch { setSyncStatus("error"); return; }
      // Re-fetch to sync wallet balances
      try {
        const res = await getFinanceData({ data: { token: authToken } });
        setWallets(res.wallets);
        setTransactions(res.transactions);
        writeLS(LS_WALLETS, res.wallets);
        writeLS(LS_TRANSACTIONS, res.transactions);
        setSyncStatus("synced");
        return;
      } catch { }
    }
    setTransactions(prev => { const next = prev.filter(x => x.id !== id); writeLS(LS_TRANSACTIONS, next); return next; });
    if (isLoggedIn) setSyncStatus("synced");
  }, [isLoggedIn, authToken]);

  // ── Budget Actions ──────────────────────────────────────────────────────────
  const handleSaveBudget = useCallback(async (b: Omit<FinanceBudget, "user_id" | "created_at">) => {
    let savedBudget: FinanceBudget | null = null;
    if (isLoggedIn && authToken) {
      setSyncStatus("syncing");
      try {
        const res = await saveBudget({ data: { token: authToken, budget: b } });
        savedBudget = res.budget;
      } catch {
        setSyncStatus("error");
        return;
      }
    }
    setBudgets(prev => {
      const actualBudget = savedBudget || (b as FinanceBudget);
      const idx = prev.findIndex(x => x.id === b.id);
      const next = idx >= 0 ? prev.map((x, i) => i === idx ? actualBudget : x) : [...prev, actualBudget];
      writeLS(LS_BUDGETS, next);
      return next;
    });
    if (isLoggedIn) setSyncStatus("synced");
  }, [isLoggedIn, authToken]);

  const handleDeleteBudget = useCallback(async (id: string) => {
    if (isLoggedIn && authToken) {
      setSyncStatus("syncing");
      try { await deleteBudget({ data: { token: authToken, budgetId: id } }); } catch { setSyncStatus("error"); return; }
    }
    setBudgets(prev => { const next = prev.filter(x => x.id !== id); writeLS(LS_BUDGETS, next); return next; });
    if (isLoggedIn) setSyncStatus("synced");
  }, [isLoggedIn, authToken]);

  // ── Goal Actions ────────────────────────────────────────────────────────────
  const handleSaveGoal = useCallback(async (g: Omit<FinanceGoal, "user_id" | "created_at">) => {
    let savedGoal: FinanceGoal | null = null;
    if (isLoggedIn && authToken) {
      setSyncStatus("syncing");
      try {
        const res = await saveGoal({ data: { token: authToken, goal: g } });
        savedGoal = res.goal;
      } catch {
        setSyncStatus("error");
        return;
      }
    }
    setGoals(prev => {
      const actualGoal = savedGoal || (g as FinanceGoal);
      const idx = prev.findIndex(x => x.id === g.id);
      const next = idx >= 0 ? prev.map((x, i) => i === idx ? actualGoal : x) : [...prev, actualGoal];
      writeLS(LS_GOALS, next);
      return next;
    });
    if (isLoggedIn) setSyncStatus("synced");
  }, [isLoggedIn, authToken]);

  const handleDeleteGoal = useCallback(async (id: string) => {
    if (isLoggedIn && authToken) {
      setSyncStatus("syncing");
      try { await deleteGoal({ data: { token: authToken, goalId: id } }); } catch { setSyncStatus("error"); return; }
    }
    setGoals(prev => { const next = prev.filter(x => x.id !== id); writeLS(LS_GOALS, next); return next; });
    if (isLoggedIn) setSyncStatus("synced");
  }, [isLoggedIn, authToken]);

  // ── Mark Recurring as Paid ──────────────────────────────────────────────────
  const handleMarkPaid = useCallback(async (tx: FinanceTransaction) => {
    const today = new Date().toISOString().split("T")[0];
    await handleSaveTransaction({
      id: `tx_${Date.now()}`,
      wallet_id: tx.wallet_id,
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description,
      transaction_date: today,
      is_recurring: true,
      recurring_interval: tx.recurring_interval,
      transfer_to_wallet_id: tx.transfer_to_wallet_id,
    });
  }, [handleSaveTransaction]);

  // ── Login Gate ──────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="py-12 px-4 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary text-4xl mb-6 shadow-tactile animate-bounce">
          💰
        </div>
        <h2 className="font-display text-3xl uppercase tracking-tight mb-3">Kelola Uang</h2>
        <p className="text-foreground/60 text-sm leading-relaxed mb-8">
          Lacak pemasukan, pengeluaran, anggaran, dan tabungan kamu dalam satu dashboard keuangan yang lengkap dan aman.
        </p>
        <div className="bg-card border border-foreground/10 p-5 rounded-2xl shadow-sm mb-8">
          <p className="text-xs text-left text-foreground/70 leading-relaxed">
            🔒 **Penyimpanan Cloud Terproteksi:** Yuk login dulu ke Palugada untuk menggunakan fitur ini agar data keuangan kamu tersimpan dengan aman!
          </p>
        </div>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("open-login-dialog"));
          }}
          className="w-full h-12 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-xl tracking-widest shadow-tactile hover:opacity-95 transition-opacity cursor-pointer animate-float-pulse"
        >
          Masuk ke Akun Palugada
        </button>
        <div className="text-center mt-4 select-none">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-login-dialog", { detail: { mode: "register" } }));
            }}
            className="text-xs text-foreground/60 hover:text-foreground font-medium underline cursor-pointer"
          >
            Belum punya akun? Register dulu yuk
          </button>
        </div>
      </div>
    );
  }

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-24 px-4 text-center max-w-lg mx-auto flex flex-col items-center justify-center select-none">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center md:text-2xl">
            💰
          </div>
        </div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-2">Memuat Data Keuangan</h3>
        <p className="text-foreground/60 text-xs leading-relaxed animate-pulse">
          Sedang menyiapkan data keuangan Anda dari cloud...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-tight">💰 Kelola Uang</h1>
          <p className="text-foreground/50 text-xs mt-0.5">Personal Financial Tracker Indonesia</p>
        </div>
        <div className="flex items-center gap-2">
          {syncStatus === "syncing" && (
            <div className="flex items-center gap-1.5 text-xs text-primary/80 bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1.5">
              <RefreshCw size={12} className="animate-spin" /> Menyimpan...
            </div>
          )}
          {syncStatus === "synced" && (
            <div className="flex items-center gap-1.5 text-xs text-foreground/60 bg-foreground/5 border border-foreground/15 rounded-lg px-2.5 py-1.5">
              <Cloud size={12} /> Tersimpan
            </div>
          )}
          {syncStatus === "error" && (
            <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-2.5 py-1.5">
              <CloudOff size={12} /> Gagal Simpan
            </div>
          )}
        </div>
      </div>

      {!loading && (
        <>
          {/* Tabs */}
          <div className="hidden md:flex border border-foreground/15 md:border-2 md:border-foreground rounded-xl bg-card overflow-hidden select-none shadow-sm overflow-x-auto mb-6">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 px-2.5 md:py-3.5 text-[10px] md:text-xs font-bold uppercase tracking-wider border-r border-foreground/15 md:border-r-2 md:border-foreground last:border-r-0 transition-colors cursor-pointer text-center whitespace-nowrap ${activeTab === tab.key ? "bg-foreground text-background" : "text-foreground hover:bg-foreground/5"
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Sticky Bottom Nav */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-t border-foreground/10 py-2.5 px-4 flex justify-around items-center md:hidden pb-safe">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeTab === tab.key ? "bg-foreground text-background scale-110 shadow-sm" : "text-foreground/60"
                  }`}>
                  <span className="text-base">{tab.icon}</span>
                </div>
                <span className={`text-[9px] font-bold tracking-tight uppercase transition-colors ${activeTab === tab.key ? "text-foreground" : "text-foreground/40"
                  }`}>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-card md:border-2 md:border-foreground border-none rounded-xl md:rounded-2xl p-3 md:p-6 shadow-none md:shadow-tactile pb-24 md:pb-6">
            {activeTab === "overview" && (
              <OverviewTab wallets={wallets} transactions={transactions} />
            )}
            {activeTab === "transactions" && (
              <TransactionTab
                wallets={wallets}
                transactions={transactions}
                onSaveTransaction={handleSaveTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onSaveWallet={handleSaveWallet}
                onDeleteWallet={handleDeleteWallet}
              />
            )}
            {activeTab === "budgets" && (
              <BudgetTab
                budgets={budgets}
                transactions={transactions}
                onSaveBudget={handleSaveBudget}
                onDeleteBudget={handleDeleteBudget}
              />
            )}
            {activeTab === "goals" && (
              <GoalsTab
                goals={goals}
                transactions={transactions}
                onSaveGoal={handleSaveGoal}
                onDeleteGoal={handleDeleteGoal}
              />
            )}
            {activeTab === "recurring" && (
              <RecurringTab
                transactions={transactions}
                wallets={wallets}
                onMarkPaid={handleMarkPaid}
              />
            )}
            {activeTab === "export" && (
              <ExportTab
                wallets={wallets}
                transactions={transactions}
                budgets={budgets}
                goals={goals}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
