import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, ArrowRightLeft } from "lucide-react";
import {
  FinanceWallet, FinanceTransaction,
  WALLET_TYPE_ICONS, CATEGORY_COLORS, CATEGORY_ICONS
} from "./types";

interface Props {
  wallets: FinanceWallet[];
  transactions: FinanceTransaction[];
}

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function OverviewTab({ wallets, transactions }: Props) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthlyStats = useMemo(() => {
    const monthTx = transactions.filter(tx => tx.transaction_date.startsWith(currentMonth));
    const income = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  }, [transactions, currentMonth]);

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);

  // Last 6 months cash flow for bar chart
  const cashFlowData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("id-ID", { month: "short" });
      return { key, label };
    });
    return months.map(({ key, label }) => {
      const monthTx = transactions.filter(tx => tx.transaction_date.startsWith(key));
      return {
        bulan: label,
        Pemasukan: monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        Pengeluaran: monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions]);

  // Category breakdown for this month (expense only)
  const categoryData = useMemo(() => {
    const monthTx = transactions.filter(tx => tx.transaction_date.startsWith(currentMonth) && tx.type === "expense");
    const map: Record<string, number> = {};
    for (const tx of monthTx) {
      map[tx.category] = (map[tx.category] || 0) + tx.amount;
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [transactions, currentMonth]);

  const recent = transactions.slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-card border-2 border-foreground rounded-xl p-3 text-xs text-foreground shadow-sm">
        <p className="font-display font-bold uppercase mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.fill }} className="font-semibold">
            {p.name}: {formatIDR(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-5 shadow-sm md:shadow-tactile flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Wallet size={16} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/60">Total Aset</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{formatIDR(totalBalance)}</p>
          <p className="text-xs text-foreground/50 mt-1">{wallets.length} dompet terdaftar</p>
        </div>

        <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-5 shadow-sm md:shadow-tactile flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <TrendingUp size={16} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/60">Pemasukan Bulan Ini</span>
          </div>
          <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(monthlyStats.income)}</p>
          <p className="text-xs text-foreground/50 mt-1">{now.toLocaleString("id-ID", { month: "long", year: "numeric" })}</p>
        </div>

        <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-5 shadow-sm md:shadow-tactile flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
            <TrendingDown size={16} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/60">Pengeluaran Bulan Ini</span>
          </div>
          <p className="text-2xl font-display font-bold text-rose-600 dark:text-rose-400">{formatIDR(monthlyStats.expense)}</p>
          <p className="text-xs text-foreground/50 mt-1">Sisa: {formatIDR(monthlyStats.income - monthlyStats.expense)}</p>
        </div>
      </div>

      {/* Wallet List */}
      {wallets.length > 0 && (
        <div>
          <h3 className="text-xs font-mono font-bold text-foreground/50 uppercase tracking-widest mb-3">Dompet & Rekening</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {wallets.map(wallet => (
              <div key={wallet.id} className="bg-background border border-foreground/15 rounded-xl p-4 hover:border-foreground/30 transition-all shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{WALLET_TYPE_ICONS[wallet.type]}</span>
                  <div>
                    <p className="text-[10px] font-mono font-bold text-foreground/40 uppercase tracking-tight">{wallet.type}</p>
                    <p className="text-xs font-bold text-foreground">{wallet.name}</p>
                  </div>
                </div>
                <p className={`text-sm font-bold ${wallet.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {formatIDR(wallet.balance)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Cash Flow Chart */}
        <div className="lg:col-span-3 bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground/60 mb-4">Arus Kas 6 Bulan Terakhir</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cashFlowData} barGap={4}>
              <XAxis dataKey="bulan" tick={{ fill: "currentColor", opacity: 0.6, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "currentColor", opacity: 0.6, fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="lg:col-span-2 bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-foreground/60 mb-4">Pengeluaran per Kategori</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={65} paddingAngle={2}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => formatIDR(v)}
                  contentStyle={{ background: "var(--card)", border: "2px solid var(--foreground)", borderRadius: 12, fontSize: 11, color: "var(--foreground)" }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-foreground/30 text-sm">
              Belum ada pengeluaran bulan ini
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      {recent.length > 0 && (
        <div>
          <h3 className="text-xs font-mono font-bold text-foreground/50 uppercase tracking-widest mb-3">Transaksi Terbaru</h3>
          <div className="space-y-2">
            {recent.map(tx => {
              const wallet = wallets.find(w => w.id === tx.wallet_id);
              return (
                <div key={tx.id} className="flex items-center gap-3 bg-background border border-foreground/15 rounded-xl px-4 py-3 hover:border-foreground/30 transition-all shadow-sm">
                  <span className="text-xl w-8 text-center">{CATEGORY_ICONS[tx.category] || "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{tx.description || tx.category}</p>
                    <p className="text-[10px] text-foreground/50 mt-0.5">{tx.category} · {wallet?.name || "—"} · {new Date(tx.transaction_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {tx.type === "transfer" && <ArrowRightLeft size={12} className="text-blue-500" />}
                    <span className={`text-xs font-extrabold ${tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : tx.type === "expense" ? "text-rose-600 dark:text-rose-400" : "text-blue-500"}`}>
                      {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}{formatIDR(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {wallets.length === 0 && transactions.length === 0 && (
        <div className="text-center py-16 text-foreground/30 border-2 border-dashed border-foreground/15 rounded-2xl">
          <Wallet size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-bold text-sm">Belum ada data keuangan</p>
          <p className="text-xs mt-1 text-foreground/50">Tambahkan dompet pertama kamu di tab Transaksi</p>
        </div>
      )}
    </div>
  );
}
