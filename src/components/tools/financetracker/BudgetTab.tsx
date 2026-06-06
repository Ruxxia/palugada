import { useState, useMemo } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { FinanceBudget, FinanceTransaction, EXPENSE_CATEGORIES, CATEGORY_ICONS } from "./types";

interface Props {
  budgets: FinanceBudget[];
  transactions: FinanceTransaction[];
  onSaveBudget: (b: Omit<FinanceBudget, "user_id" | "created_at">) => Promise<void>;
  onDeleteBudget: (id: string) => Promise<void>;
}

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const formatNumberWithDots = (val: string | number) => {
  if (val === undefined || val === null || val === "") return "";
  const clean = String(val).replace(/\D/g, "");
  if (!clean) return "";
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseRawNumber = (formattedStr: string | number) => {
  if (typeof formattedStr === "number") return formattedStr;
  return Number(String(formattedStr).replace(/\./g, "")) || 0;
};

export default function BudgetTab({ budgets, transactions, onSaveBudget, onDeleteBudget }: Props) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: "", limit_amount: "" });

  const monthBudgets = useMemo(() =>
    budgets.filter(b => b.month_year === selectedMonth),
    [budgets, selectedMonth]
  );

  const spendingMap = useMemo(() => {
    const map: Record<string, number> = {};
    const monthTx = transactions.filter(tx => tx.transaction_date.startsWith(selectedMonth) && tx.type === "expense");
    for (const tx of monthTx) {
      map[tx.category] = (map[tx.category] || 0) + tx.amount;
    }
    return map;
  }, [transactions, selectedMonth]);

  const totalBudget = monthBudgets.reduce((s, b) => s + b.limit_amount, 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + (spendingMap[b.category] || 0), 0);

  const handleSave = async () => {
    if (!form.category || !form.limit_amount) return;
    setSaving(true);
    try {
      await onSaveBudget({
        id: `bg_${Date.now()}`,
        category: form.category,
        limit_amount: parseRawNumber(form.limit_amount),
        month_year: selectedMonth,
      });
      setShowDialog(false);
      setForm({ category: "", limit_amount: "" });
    } finally {
      setSaving(false);
    }
  };

  const availableCategories = EXPENSE_CATEGORIES.filter(
    c => !monthBudgets.some(b => b.category === c)
  );

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-foreground/10 pb-4">
        <div className="flex items-center gap-3">
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground" />
          <div className="text-xs text-foreground/60">
            <span className="text-foreground font-extrabold">{formatIDR(totalSpent)}</span>
            <span className="mx-1">/</span>
            <span className="font-bold">{formatIDR(totalBudget)}</span>
            <span className="ml-1">dianggarkan</span>
          </div>
        </div>
        <button onClick={() => { setShowDialog(true); setForm({ category: "", limit_amount: "" }); }}
          className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer w-full sm:w-auto justify-center min-h-[40px]">
          <Plus size={13} /> Tambah Anggaran
        </button>
      </div>

      {/* Overall Progress */}
      {totalBudget > 0 && (
        <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-5 shadow-sm md:shadow-tactile">
          <div className="flex justify-between text-xs text-foreground/75 mb-2 font-bold select-none">
            <span>Total Anggaran Bulan Ini</span>
            <span className={totalSpent > totalBudget ? "text-rose-600 dark:text-rose-400 font-extrabold" : "font-extrabold"}>{Math.round((totalSpent / totalBudget) * 100)}%</span>
          </div>
          <div className="w-full bg-foreground/10 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${totalSpent > totalBudget ? "bg-rose-500" : totalSpent / totalBudget > 0.8 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-foreground/50 mt-2 font-medium select-none">
            <span>Terpakai: {formatIDR(totalSpent)}</span>
            <span>Sisa: {formatIDR(Math.max(totalBudget - totalSpent, 0))}</span>
          </div>
        </div>
      )}

      {/* Per-Category Budgets */}
      {monthBudgets.length === 0 ? (
        <div className="text-center py-16 text-foreground/30 border-2 border-dashed border-foreground/15 rounded-2xl">
          <div className="text-4xl mb-3">💰</div>
          <p className="font-bold text-sm text-foreground/80">Belum ada anggaran untuk bulan ini</p>
          <p className="text-xs mt-1 text-foreground/50">Klik "Tambah Anggaran" untuk mengatur batas belanja per kategori</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monthBudgets.map(budget => {
            const spent = spendingMap[budget.category] || 0;
            const pct = Math.min((spent / budget.limit_amount) * 100, 100);
            const isOver = spent > budget.limit_amount;
            const isWarning = !isOver && pct >= 80;
            const barColor = isOver ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500";

            return (
              <div key={budget.id} className="bg-card border border-foreground/15 rounded-xl p-4 shadow-sm hover:border-foreground/30 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{CATEGORY_ICONS[budget.category] || "📌"}</span>
                    <div>
                      <p className="text-xs font-extrabold text-foreground">{budget.category}</p>
                      <p className="text-[10px] text-foreground/50 mt-0.5">Batas: {formatIDR(budget.limit_amount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOver && <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400 animate-pulse" />}
                    {isWarning && <AlertTriangle size={14} className="text-amber-500" />}
                    <span className={`text-xs font-extrabold ${isOver ? "text-rose-600 dark:text-rose-400" : isWarning ? "text-amber-500" : "text-foreground"}`}>
                      {formatIDR(spent)}
                    </span>
                    <button onClick={() => onDeleteBudget(budget.id)} className="opacity-0 group-hover:opacity-100 text-foreground/30 hover:text-rose-500 transition-all ml-1 cursor-pointer">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-foreground/10 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-foreground/50 mt-1.5 font-medium select-none">
                  <span>{Math.round(pct)}% terpakai</span>
                  <span>Sisa: {formatIDR(Math.max(budget.limit_amount - spent, 0))}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border-2 border-foreground rounded-2xl w-full max-w-sm shadow-tactile p-6 text-foreground animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-display font-bold text-foreground mb-5 uppercase tracking-wide">Tambah Anggaran Kategori</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Kategori</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold cursor-pointer">
                  <option value="">Pilih kategori</option>
                  {availableCategories.map(c => (
                    <option key={c} value={c}>{CATEGORY_ICONS[c] || ""} {c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Batas Anggaran (IDR)</label>
                <input type="text" value={form.limit_amount} onChange={e => {
                  const clean = e.target.value.replace(/\D/g, "");
                  setForm(p => ({ ...p, limit_amount: formatNumberWithDots(clean) }));
                }}
                  placeholder="e.g. 1.000.000"
                  className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold" />
              </div>
              <p className="text-[10px] text-foreground/50 font-medium">Anggaran untuk: {new Date(selectedMonth + "-01").toLocaleString("id-ID", { month: "long", year: "numeric" })}</p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowDialog(false)} className="flex-1 py-3 border border-foreground/15 rounded-xl text-xs font-bold uppercase text-foreground/75 bg-background hover:bg-foreground/5 transition-colors cursor-pointer">Batal</button>
              <button onClick={handleSave} disabled={saving || !form.category || !form.limit_amount}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
