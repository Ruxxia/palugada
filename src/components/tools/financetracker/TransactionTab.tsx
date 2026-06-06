import { useState, useMemo } from "react";
import { Plus, Trash2, Search, Filter, ArrowRightLeft, TrendingUp, TrendingDown, Pencil } from "lucide-react";
import {
  FinanceWallet, FinanceTransaction, TransactionType,
  EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_ICONS, WALLET_TYPE_ICONS
} from "./types";

interface Props {
  wallets: FinanceWallet[];
  transactions: FinanceTransaction[];
  onSaveTransaction: (tx: Omit<FinanceTransaction, "user_id" | "created_at">) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onSaveWallet: (w: Omit<FinanceWallet, "user_id" | "created_at">) => Promise<void>;
  onDeleteWallet: (id: string) => Promise<void>;
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

const today = () => new Date().toISOString().split("T")[0];

const WALLET_TYPES = ["Bank", "E-Wallet", "Tunai", "Investasi"] as const;

export default function TransactionTab({
  wallets, transactions, onSaveTransaction, onDeleteTransaction, onSaveWallet, onDeleteWallet
}: Props) {
  const [showTxDialog, setShowTxDialog] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [editingTx, setEditingTx] = useState<FinanceTransaction | null>(null);
  const [editingWallet, setEditingWallet] = useState<FinanceWallet | null>(null);
  const [saving, setSaving] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterWallet, setFilterWallet] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // Transaction Form
  const [txForm, setTxForm] = useState({
    type: "expense" as TransactionType,
    amount: "",
    wallet_id: "",
    transfer_to_wallet_id: "",
    category: "",
    description: "",
    transaction_date: today(),
    is_recurring: false,
    recurring_interval: "monthly" as "weekly" | "monthly" | "yearly",
  });

  // Wallet Form
  const [walletForm, setWalletForm] = useState({ name: "", type: "Bank" as any, balance: "" });

  const openAddTx = () => {
    setEditingTx(null);
    setTxForm({
      type: "expense", amount: "", wallet_id: wallets[0]?.id || "",
      transfer_to_wallet_id: "", category: "", description: "",
      transaction_date: today(), is_recurring: false, recurring_interval: "monthly",
    });
    setShowTxDialog(true);
  };

  const openEditTx = (tx: FinanceTransaction) => {
    setEditingTx(tx);
    setTxForm({
      type: tx.type, amount: formatNumberWithDots(tx.amount), wallet_id: tx.wallet_id,
      transfer_to_wallet_id: tx.transfer_to_wallet_id || "",
      category: tx.category, description: tx.description || "",
      transaction_date: tx.transaction_date, is_recurring: tx.is_recurring,
      recurring_interval: tx.recurring_interval || "monthly",
    });
    setShowTxDialog(true);
  };

  const openAddWallet = () => {
    setEditingWallet(null);
    setWalletForm({ name: "", type: "Bank", balance: "" });
    setShowWalletDialog(true);
  };

  const handleSaveTx = async () => {
    if (!txForm.amount || !txForm.wallet_id || !txForm.category) return;
    setSaving(true);
    try {
      await onSaveTransaction({
        id: editingTx?.id || `tx_${Date.now()}`,
        wallet_id: txForm.wallet_id,
        type: txForm.type,
        amount: parseRawNumber(txForm.amount),
        category: txForm.category,
        description: txForm.description || undefined,
        transaction_date: txForm.transaction_date,
        is_recurring: txForm.is_recurring,
        recurring_interval: txForm.is_recurring ? txForm.recurring_interval : undefined,
        transfer_to_wallet_id: txForm.type === "transfer" ? txForm.transfer_to_wallet_id : undefined,
      });
      setShowTxDialog(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWallet = async () => {
    if (!walletForm.name) return;
    setSaving(true);
    try {
      await onSaveWallet({
        id: editingWallet?.id || `w_${Date.now()}`,
        name: walletForm.name,
        type: walletForm.type,
        balance: parseRawNumber(walletForm.balance) || 0,
      });
      setShowWalletDialog(false);
    } finally {
      setSaving(false);
    }
  };

  const categories = txForm.type === "income" ? INCOME_CATEGORIES : txForm.type === "transfer" ? ["Transfer"] : EXPENSE_CATEGORIES;

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (filterType !== "all" && tx.type !== filterType) return false;
      if (filterWallet !== "all" && tx.wallet_id !== filterWallet) return false;
      if (filterCategory !== "all" && tx.category !== filterCategory) return false;
      if (filterMonth && !tx.transaction_date.startsWith(filterMonth)) return false;
      if (search && !tx.description?.toLowerCase().includes(search.toLowerCase()) && !tx.category.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filterType, filterWallet, filterCategory, filterMonth, search]);

  const allCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  return (
    <div className="space-y-5">
      {/* Wallet List Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-foreground/10 pb-4">
        <div className="flex flex-wrap gap-2">
          {wallets.map(w => (
            <div key={w.id} className="flex items-center gap-1.5 bg-background border border-foreground/15 rounded-lg px-3 py-1.5 group shadow-sm select-none">
              <span className="text-sm">{WALLET_TYPE_ICONS[w.type]}</span>
              <span className="text-xs text-foreground/75 font-bold">{w.name}</span>
              <span className={`text-xs font-extrabold ml-1 ${w.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {formatIDR(w.balance)}
              </span>
              <button onClick={() => onDeleteWallet(w.id)} className="ml-1 text-foreground/30 hover:text-rose-500 transition-all cursor-pointer">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={openAddWallet} className="px-3 py-2 border border-foreground/15 text-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 hover:bg-foreground/5 transition-colors cursor-pointer min-h-[40px] flex-1 md:flex-initial justify-center">
            <Plus size={13} /> Dompet
          </button>
          <button onClick={openAddTx} className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer flex-1 md:flex-initial justify-center min-h-[40px]">
            <Plus size={13} /> Transaksi
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
          className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground w-full" />
        <div className="relative col-span-1">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari transaksi..."
            className="w-full bg-background border border-foreground/15 rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder-foreground/30 font-bold outline-none focus:border-foreground/45" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value as any)}
          className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground w-full">
          <option value="all">Semua Tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
          <option value="transfer">Transfer</option>
        </select>
        <select value={filterWallet} onChange={e => setFilterWallet(e.target.value)}
          className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground w-full">
          <option value="all">Semua Dompet</option>
          {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground w-full">
          <option value="all">Semua Kategori</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Transaction Table */}
      <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl overflow-hidden shadow-sm md:shadow-tactile">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-foreground/30 text-sm">
            <Filter size={32} className="mx-auto mb-3 opacity-30" />
            Tidak ada transaksi ditemukan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/15">
                  <th className="text-left text-xs text-foreground/60 font-bold px-4 py-3 uppercase tracking-wider">Tanggal</th>
                  <th className="text-left text-xs text-foreground/60 font-bold px-4 py-3 uppercase tracking-wider">Keterangan</th>
                  <th className="text-left text-xs text-foreground/60 font-bold px-4 py-3 uppercase tracking-wider">Kategori</th>
                  <th className="text-left text-xs text-foreground/60 font-bold px-4 py-3 uppercase tracking-wider">Dompet</th>
                  <th className="text-right text-xs text-foreground/60 font-bold px-4 py-3 uppercase tracking-wider">Jumlah</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => {
                  const wallet = wallets.find(w => w.id === tx.wallet_id);
                  const toWallet = tx.transfer_to_wallet_id ? wallets.find(w => w.id === tx.transfer_to_wallet_id) : null;
                  return (
                    <tr key={tx.id} className="border-b border-foreground/10 hover:bg-foreground/5 transition-colors group">
                      <td className="px-4 py-3 text-foreground/50 text-xs whitespace-nowrap">
                        {new Date(tx.transaction_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {tx.is_recurring && (
                            <span className="text-[10px] bg-primary/20 text-primary-foreground dark:text-primary border border-primary/20 rounded px-1.5 py-0.5 font-bold uppercase">
                              Rutin
                            </span>
                          )}
                          <span className="text-foreground/80 text-xs font-semibold">{tx.description || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span>{CATEGORY_ICONS[tx.category] || "📌"}</span>
                          <span className="text-foreground/60 text-xs font-medium">{tx.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground/50 text-xs font-medium">
                        {wallet?.name || "—"}
                        {toWallet && <span className="text-blue-500 font-bold"> → {toWallet.name}</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-extrabold text-sm ${tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : tx.type === "expense" ? "text-rose-600 dark:text-rose-400" : "text-blue-500"}`}>
                          {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                          {formatIDR(tx.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditTx(tx)} className="text-foreground/40 hover:text-primary transition-colors p-1 cursor-pointer">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => onDeleteTransaction(tx.id)} className="text-foreground/40 hover:text-rose-500 transition-colors p-1 cursor-pointer">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Transaction Dialog ── */}
      {showTxDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border-2 border-foreground rounded-2xl w-full max-w-md shadow-tactile p-6 text-foreground animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-display font-bold text-foreground mb-5 uppercase tracking-wide">{editingTx ? "Edit Transaksi" : "Tambah Transaksi"}</h3>

            {/* Type */}
            <div className="flex gap-2 mb-4 p-1 bg-foreground/5 border border-foreground/10 rounded-xl">
              {(["expense", "income", "transfer"] as TransactionType[]).map(t => (
                <button key={t} onClick={() => { setTxForm(p => ({ ...p, type: t, category: "" })); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${txForm.type === t ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/60 hover:text-foreground"}`}>
                  {t === "income" ? "Pemasukan" : t === "expense" ? "Pengeluaran" : "Transfer"}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {/* Amount */}
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Jumlah (IDR)</label>
                <input type="text" value={txForm.amount} onChange={e => {
                  const clean = e.target.value.replace(/\D/g, "");
                  setTxForm(p => ({ ...p, amount: formatNumberWithDots(clean) }));
                }}
                  placeholder="0"
                  className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold" />
              </div>

              {/* Source Wallet */}
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">{txForm.type === "transfer" ? "Dari Dompet" : "Dompet"}</label>
                <select value={txForm.wallet_id} onChange={e => setTxForm(p => ({ ...p, wallet_id: e.target.value }))}
                  className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold cursor-pointer">
                  <option value="">Pilih dompet</option>
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              {/* Transfer destination */}
              {txForm.type === "transfer" && (
                <div>
                  <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Ke Dompet</label>
                  <select value={txForm.transfer_to_wallet_id} onChange={e => setTxForm(p => ({ ...p, transfer_to_wallet_id: e.target.value }))}
                    className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold cursor-pointer">
                    <option value="">Pilih tujuan</option>
                    {wallets.filter(w => w.id !== txForm.wallet_id).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Kategori</label>
                <select value={txForm.category} onChange={e => setTxForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold cursor-pointer">
                  <option value="">Pilih kategori</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Keterangan (opsional)</label>
                <input type="text" value={txForm.description} onChange={e => setTxForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Makan siang kantor..."
                  className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold" />
              </div>

              {/* Date */}
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Tanggal</label>
                <input type="date" value={txForm.transaction_date} onChange={e => setTxForm(p => ({ ...p, transaction_date: e.target.value }))}
                  className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold cursor-pointer" />
              </div>

              {/* Recurring */}
              <div className="flex items-center gap-3 bg-foreground/5 border border-foreground/10 rounded-xl p-3 select-none">
                <input type="checkbox" id="recurring" checked={txForm.is_recurring}
                  onChange={e => setTxForm(p => ({ ...p, is_recurring: e.target.checked }))}
                  className="w-4 h-4 rounded accent-primary cursor-pointer" />
                <label htmlFor="recurring" className="text-xs font-bold uppercase text-foreground/70 flex-1 cursor-pointer">Tagihan Rutin</label>
                {txForm.is_recurring && (
                  <select value={txForm.recurring_interval} onChange={e => setTxForm(p => ({ ...p, recurring_interval: e.target.value as any }))}
                    className="p-1 border border-foreground/15 rounded-lg bg-background text-[10px] font-bold outline-none cursor-pointer text-foreground">
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                    <option value="yearly">Tahunan</option>
                  </select>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowTxDialog(false)} className="flex-1 py-3 border border-foreground/15 rounded-xl text-xs font-bold uppercase text-foreground/75 bg-background hover:bg-foreground/5 transition-colors cursor-pointer">Batal</button>
              <button onClick={handleSaveTx} disabled={saving || !txForm.amount || !txForm.wallet_id || !txForm.category}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Wallet Dialog ── */}
      {showWalletDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border-2 border-foreground rounded-2xl w-full max-w-sm shadow-tactile p-6 text-foreground animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-display font-bold text-foreground mb-5 uppercase tracking-wide">Tambah Dompet</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Nama Dompet</label>
                <input value={walletForm.name} onChange={e => setWalletForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. BCA Tabungan, GoPay..."
                  className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Tipe</label>
                <select value={walletForm.type} onChange={e => setWalletForm(p => ({ ...p, type: e.target.value as any }))}
                  className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold cursor-pointer">
                  {WALLET_TYPES.map(t => <option key={t} value={t}>{WALLET_TYPE_ICONS[t]} {t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Saldo Awal (IDR)</label>
                <input type="text" value={walletForm.balance} onChange={e => {
                  const clean = e.target.value.replace(/\D/g, "");
                  setWalletForm(p => ({ ...p, balance: formatNumberWithDots(clean) }));
                }}
                  placeholder="0"
                  className="w-full bg-background border border-foreground/15 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-foreground/30 font-bold" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowWalletDialog(false)} className="flex-1 py-3 border border-foreground/15 rounded-xl text-xs font-bold uppercase text-foreground/75 bg-background hover:bg-foreground/5 transition-colors cursor-pointer">Batal</button>
              <button onClick={handleSaveWallet} disabled={saving || !walletForm.name}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer">
                {saving ? "Menyimpan..." : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
