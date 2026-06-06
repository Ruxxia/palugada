import { useState, useMemo } from "react";
import { Plus, Trash2, Target, Pencil } from "lucide-react";
import { FinanceGoal, FinanceTransaction } from "./types";

interface Props {
  goals: FinanceGoal[];
  transactions: FinanceTransaction[];
  onSaveGoal: (g: Omit<FinanceGoal, "user_id" | "created_at">) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
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

const MARITAL_STATUS_OPTIONS = [
  { label: "Lajang", multiplier: 6 },
  { label: "Menikah (tanpa anak)", multiplier: 9 },
  { label: "Menikah + 1-2 anak", multiplier: 12 },
  { label: "Menikah + 3+ anak", multiplier: 15 },
];

export default function GoalsTab({ goals, transactions, onSaveGoal, onDeleteGoal }: Props) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinanceGoal | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", target_amount: "", current_amount: "", target_date: "" });

  // Emergency fund calculator
  const [efMonthly, setEfMonthly] = useState("");
  const [efStatus, setEfStatus] = useState(0);
  const efTarget = useMemo(() => {
    const base = parseRawNumber(efMonthly) || 0;
    const mult = MARITAL_STATUS_OPTIONS[efStatus].multiplier;
    return base * mult;
  }, [efMonthly, efStatus]);

  const openAdd = () => {
    setEditingGoal(null);
    setForm({ name: "", target_amount: "", current_amount: "", target_date: "" });
    setShowDialog(true);
  };

  const openEdit = (g: FinanceGoal) => {
    setEditingGoal(g);
    setForm({
      name: g.name,
      target_amount: formatNumberWithDots(g.target_amount),
      current_amount: formatNumberWithDots(g.current_amount),
      target_date: g.target_date || "",
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.target_amount) return;
    setSaving(true);
    try {
      await onSaveGoal({
        id: editingGoal?.id || `gl_${Date.now()}`,
        name: form.name,
        target_amount: parseRawNumber(form.target_amount),
        current_amount: parseRawNumber(form.current_amount) || 0,
        target_date: form.target_date || undefined,
      });
      setShowDialog(false);
    } finally {
      setSaving(false);
    }
  };

  const getDaysLeft = (targetDate?: string) => {
    if (!targetDate) return null;
    const diff = new Date(targetDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-6">
      {/* Emergency Fund Calculator */}
      <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-5 shadow-sm md:shadow-tactile">
        <div className="flex items-center gap-2 mb-4 select-none">
          <span className="text-2xl">🛡️</span>
          <div>
            <h3 className="text-xs font-mono font-bold text-foreground/80 uppercase tracking-widest">Kalkulator Dana Darurat</h3>
            <p className="text-[10px] text-foreground/50 font-medium">Hitung kebutuhan dana darurat ideal kamu</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Pengeluaran Bulanan (IDR)</label>
            <input type="text" value={efMonthly} onChange={e => {
              const clean = e.target.value.replace(/\D/g, "");
              setEfMonthly(formatNumberWithDots(clean));
            }}
              placeholder="e.g. 5.000.000"
              className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-2.5 text-foreground text-xs font-bold outline-none focus:border-foreground/30" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Status Keluarga</label>
            <select value={efStatus} onChange={e => setEfStatus(Number(e.target.value))}
              className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-2.5 text-foreground text-xs font-bold outline-none cursor-pointer focus:border-foreground/30">
              {MARITAL_STATUS_OPTIONS.map((opt, i) => (
                <option key={i} value={i}>{opt.label} ({opt.multiplier}x)</option>
              ))}
            </select>
          </div>
        </div>
        {parseRawNumber(efMonthly) > 0 && (
          <div className="bg-amber-500/10 border-2 border-amber-500 rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 mb-1">Dana Darurat Ideal untuk {MARITAL_STATUS_OPTIONS[efStatus].label}</p>
            <p className="text-2xl font-display font-black text-amber-600 dark:text-amber-400">{formatIDR(efTarget)}</p>
            <p className="text-[10px] font-bold text-foreground/40 mt-1 uppercase tracking-wider">{MARITAL_STATUS_OPTIONS[efStatus].multiplier}x pengeluaran bulanan</p>
          </div>
        )}
      </div>

      {/* Goals List Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-foreground/10 pb-4">
        <div>
          <h3 className="font-display md:text-2xl uppercase">Target Tabungan</h3>
          <p className="text-xs text-foreground/60 mt-1">Kelola dan pantau rencana keuangan masa depan.</p>
        </div>
        <button onClick={openAdd}
          className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer w-full sm:w-auto justify-center min-h-[40px]">
          <Plus size={13} /> Tambah Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16 text-foreground/30 border-2 border-dashed border-foreground/15 rounded-2xl">
          <Target size={40} className="mx-auto mb-3 opacity-30 animate-pulse" />
          <p className="font-bold text-sm text-foreground/80">Belum ada target tabungan</p>
          <p className="text-xs mt-1 text-foreground/50">Buat goal pertama seperti "DP Rumah" atau "Dana Qurban"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map(goal => {
            const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            const daysLeft = getDaysLeft(goal.target_date);
            const isCompleted = goal.current_amount >= goal.target_amount;

            // Circular progress
            const R = 36;
            const circ = 2 * Math.PI * R;
            const offset = circ * (1 - pct / 100);

            return (
              <div key={goal.id} className={`bg-card border rounded-2xl p-5 shadow-sm hover:border-foreground/30 transition-all group relative overflow-hidden flex flex-col justify-between ${isCompleted ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10" : "border-foreground/15"}`}>
                <div className="flex items-start gap-4">
                  {/* Circular Progress Ring */}
                  <div className="relative flex-shrink-0 select-none">
                    <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
                      <circle cx="44" cy="44" r={R} fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth="8" />
                      <circle cx="44" cy="44" r={R} fill="none"
                        stroke={isCompleted ? "#10b981" : pct >= 75 ? "#3b82f6" : "#6366f1"}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        className="transition-all duration-700" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-extrabold text-foreground">{Math.round(pct)}%</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-extrabold text-foreground leading-snug truncate pr-4">{goal.name}</p>
                      <div className="flex gap-1 flex-shrink-0 absolute right-3 top-3">
                        <button onClick={() => openEdit(goal)} className="text-foreground/40 hover:text-primary p-0.5 cursor-pointer"><Pencil size={12} /></button>
                        <button onClick={() => onDeleteGoal(goal.id)} className="text-foreground/40 hover:text-rose-500 p-0.5 cursor-pointer"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <p className="text-[10px] text-foreground/50 mt-1 select-none">
                      <span className={`font-extrabold ${isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-foreground/80"}`}>{formatIDR(goal.current_amount)}</span>
                      <span className="mx-1 font-bold">dari</span>
                      <span className="font-bold">{formatIDR(goal.target_amount)}</span>
                    </p>
                    {goal.target_date && (
                      <p className="text-[10px] text-foreground/40 mt-1 select-none font-medium">
                        {isCompleted ? "🎉 Target tercapai!" : daysLeft !== null ? `${daysLeft} hari lagi` : "—"}
                        {" · "}
                        {new Date(goal.target_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                    {isCompleted && (
                      <span className="inline-block mt-2 text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded px-1.5 py-0.5 select-none">✓ Selesai</span>
                    )}
                  </div>
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
            <h3 className="text-base font-display font-bold text-foreground mb-5 uppercase tracking-wide">{editingGoal ? "Edit Goal" : "Tambah Goal Baru"}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Nama Goal</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. DP Rumah, Dana Qurban..."
                  className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Target (IDR)</label>
                <input type="text" value={form.target_amount} onChange={e => {
                  const clean = e.target.value.replace(/\D/g, "");
                  setForm(p => ({ ...p, target_amount: formatNumberWithDots(clean) }));
                }}
                  placeholder="0"
                  className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Terkumpul Saat Ini (IDR)</label>
                <input type="text" value={form.current_amount} onChange={e => {
                  const clean = e.target.value.replace(/\D/g, "");
                  setForm(p => ({ ...p, current_amount: formatNumberWithDots(clean) }));
                }}
                  placeholder="0"
                  className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Tanggal Target (opsional)</label>
                <input type="date" value={form.target_date} onChange={e => setForm(p => ({ ...p, target_date: e.target.value }))}
                  className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold cursor-pointer" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowDialog(false)} className="flex-1 py-3 border border-foreground/15 rounded-xl text-xs font-bold uppercase text-foreground/75 bg-background hover:bg-foreground/5 transition-colors cursor-pointer">Batal</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.target_amount}
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
