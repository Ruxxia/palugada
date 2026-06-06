import { useState } from "react";
import { Download, FileText, Table } from "lucide-react";
import { FinanceWallet, FinanceTransaction, FinanceBudget, FinanceGoal, CATEGORY_ICONS } from "./types";

interface Props {
  wallets: FinanceWallet[];
  transactions: FinanceTransaction[];
  budgets: FinanceBudget[];
  goals: FinanceGoal[];
}

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function ExportTab({ wallets, transactions, budgets, goals }: Props) {
  const [exportMonth, setExportMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [printing, setPrinting] = useState(false);

  const filteredTx = transactions.filter(tx => tx.transaction_date.startsWith(exportMonth));
  const income = filteredTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = filteredTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const monthLabel = new Date(exportMonth + "-01").toLocaleString("id-ID", { month: "long", year: "numeric" });

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  const handleExportCSV = () => {
    const header = ["Tanggal", "Tipe", "Kategori", "Dompet", "Keterangan", "Jumlah"];
    const rows = filteredTx.map(tx => {
      const wallet = wallets.find(w => w.id === tx.wallet_id);
      return [
        tx.transaction_date,
        tx.type === "income" ? "Pemasukan" : tx.type === "expense" ? "Pengeluaran" : "Transfer",
        tx.category,
        wallet?.name || "—",
        tx.description || "—",
        tx.amount,
      ];
    });
    const csv = [header, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kelolauang_${exportMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-foreground/10 pb-4">
        <div>
          <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Bulan Ekspor</label>
          <input type="month" value={exportMonth} onChange={e => setExportMonth(e.target.value)}
            className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-5">
          <button onClick={handleExportCSV}
            className="px-3 py-2 border border-foreground/15 text-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 hover:bg-foreground/5 transition-colors cursor-pointer min-h-[40px] flex-1 sm:flex-initial justify-center">
            <Table size={15} /> Export CSV
          </button>
          <button onClick={handlePrint} disabled={printing}
            className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer min-h-[40px] flex-1 sm:flex-initial justify-center disabled:opacity-50">
            <FileText size={15} /> {printing ? "Membuka..." : "Cetak / PDF"}
          </button>
        </div>
      </div>

      {/* Print Preview */}
      <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-sm md:shadow-tactile print-area text-foreground overflow-hidden">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: fixed; top: 0; left: 0; width: 100%; background: white !important; color: #111 !important; padding: 24px; }
            .print-area .dark-text { color: #111 !important; }
            .print-area .muted-text { color: #555 !important; }
            .print-area .border-print { border-color: #ddd !important; }
          }
        `}</style>

        {/* Report Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-foreground dark-text uppercase tracking-wide">Laporan Keuangan</h2>
            <p className="text-foreground/50 text-xs font-semibold muted-text">{monthLabel}</p>
          </div>
          <p className="text-[9px] sm:text-[10px] text-foreground/30 font-bold uppercase tracking-wider muted-text text-right">Dicetak: {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          {[
            { label: "Total Pemasukan", value: income, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Total Pengeluaran", value: expense, color: "text-rose-600 dark:text-rose-400" },
            { label: "Selisih (Net)", value: net, color: net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400" },
          ].map(item => (
            <div key={item.label} className="bg-background border border-foreground/15 border-print rounded-xl p-2 sm:p-3 text-center shadow-sm select-none min-w-0">
              <p className="text-[8px] sm:text-[9px] font-bold uppercase text-foreground/50 muted-text mb-1 truncate">{item.label}</p>
              <p className={`text-[10px] sm:text-sm font-display font-extrabold dark-text truncate ${item.color}`}>{formatIDR(item.value)}</p>
            </div>
          ))}
        </div>

        {/* Wallet Balances */}
        <div className="mb-6">
          <h3 className="text-[10px] font-bold text-foreground/50 muted-text uppercase tracking-widest mb-3">Saldo Dompet</h3>
          <div className="overflow-x-auto w-full -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-xs sm:text-sm min-w-[420px] sm:min-w-0">
              <thead>
                <tr className="border-b border-foreground/15 border-print">
                  <th className="text-left text-xs text-foreground/60 font-bold muted-text py-2 pr-4">Nama</th>
                  <th className="text-left text-xs text-foreground/60 font-bold muted-text py-2 pr-4">Tipe</th>
                  <th className="text-right text-xs text-foreground/60 font-bold muted-text py-2">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map(w => (
                  <tr key={w.id} className="border-b border-foreground/10 border-print font-medium text-xs">
                    <td className="py-2 pr-4 text-foreground dark-text font-semibold">{w.name}</td>
                    <td className="py-2 pr-4 text-foreground/50 muted-text">{w.type}</td>
                    <td className={`py-2 text-right font-bold dark-text ${w.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{formatIDR(w.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction List */}
        <div>
          <h3 className="text-[10px] font-bold text-foreground/50 muted-text uppercase tracking-widest mb-3">
            Transaksi {monthLabel} ({filteredTx.length} entri)
          </h3>
          {filteredTx.length === 0 ? (
            <p className="text-xs text-foreground/30 muted-text italic">Tidak ada transaksi pada periode ini.</p>
          ) : (
            <div className="overflow-x-auto w-full -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-xs min-w-[500px] sm:min-w-0">
                <thead>
                  <tr className="border-b border-foreground/15 border-print">
                    {["Tanggal", "Kategori", "Keterangan", "Dompet", "Jumlah"].map(h => (
                      <th key={h} className="text-left text-foreground/60 font-bold muted-text py-2 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map(tx => {
                    const wallet = wallets.find(w => w.id === tx.wallet_id);
                    return (
                      <tr key={tx.id} className="border-b border-foreground/10 border-print font-medium text-xs">
                        <td className="py-2 pr-3 text-foreground/50 muted-text whitespace-nowrap">
                          {new Date(tx.transaction_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </td>
                        <td className="py-2 pr-3 text-foreground/70 dark-text font-semibold">{CATEGORY_ICONS[tx.category] || ""} {tx.category}</td>
                        <td className="py-2 pr-3 text-foreground/50 muted-text truncate max-w-[180px]">{tx.description || "—"}</td>
                        <td className="py-2 pr-3 text-foreground/50 muted-text">{wallet?.name || "—"}</td>
                        <td className={`py-2 font-bold whitespace-nowrap dark-text ${tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : tx.type === "expense" ? "text-rose-600 dark:text-rose-400" : "text-blue-500"}`}>
                          {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}{formatIDR(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
