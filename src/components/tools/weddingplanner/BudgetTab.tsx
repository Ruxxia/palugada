import { useState } from "react";
import { FileSpreadsheet, Printer, Plus, Trash2 } from "lucide-react";
import { BudgetItem } from "./types";
import { CATEGORIES_BUDGET, formatIDR, downloadCSV } from "./utils";

interface BudgetTabProps {
  budgets: BudgetItem[];
  onAddBudget: (name: string, category: string, estimatedCost: number, actualCost: number, isPaid: boolean) => void;
  onToggleBudgetPaid: (id: string) => void;
  onDeleteBudget: (id: string) => void;
}

export function BudgetTab({
  budgets,
  onAddBudget,
  onToggleBudgetPaid,
  onDeleteBudget
}: BudgetTabProps) {
  const [budgetFilterCategory, setBudgetFilterCategory] = useState("all");
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [newBudget, setNewBudget] = useState({ name: "", category: "Gedung", estimated_cost: 0, actual_cost: 0, is_paid: false });

  const exportBudgetToCSV = () => {
    const headers = ["Nama Kebutuhan", "Kategori", "Estimasi Biaya", "Biaya Riil", "Status Bayar"];
    const csvRows = [
      headers.join(","),
      ...budgets.map(b => [
        `"${b.name.replace(/"/g, '""')}"`,
        `"${b.category.replace(/"/g, '""')}"`,
        `"${b.estimated_cost}"`,
        `"${b.actual_cost}"`,
        `"${b.is_paid ? "Lunas" : "Belum Lunas"}"`
      ].join(","))
    ];
    const csvString = "\uFEFF" + csvRows.join("\n");
    downloadCSV(csvString, `anggaran_pernikahan_${Date.now()}.csv`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.name.trim()) return;
    onAddBudget(
      newBudget.name,
      newGuestCategory(),
      newBudget.estimated_cost,
      newBudget.actual_cost,
      newBudget.is_paid
    );
    setNewBudget({ name: "", category: "Gedung", estimated_cost: 0, actual_cost: 0, is_paid: false });
    setShowBudgetForm(false);
  };

  const newGuestCategory = () => {
    return newBudget.category;
  };

  const filteredBudgets = budgets.filter(b => budgetFilterCategory === "all" || b.category === budgetFilterCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-foreground/10 pb-4">
        <div>
          <h3 className="font-display md:text-2xl uppercase">Manajemen Anggaran</h3>
          <p className="text-xs text-foreground/60 mt-1">Lacak pengeluaran estimasi dan realisasi vendor pernikahan.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
          <select
            value={budgetFilterCategory}
            onChange={(e) => setBudgetFilterCategory(e.target.value)}
            className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground flex-1 sm:flex-initial min-h-[40px]"
          >
            <option value="all">Semua Kategori</option>
            {CATEGORIES_BUDGET.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={exportBudgetToCSV}
            className="px-3 py-2 border border-foreground/15 text-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 hover:bg-foreground/5 transition-colors cursor-pointer min-h-[40px] flex-1 sm:flex-initial justify-center"
            title="Ekspor ke CSV"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 border border-foreground/15 text-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 hover:bg-foreground/5 transition-colors cursor-pointer min-h-[40px] flex-1 sm:flex-initial justify-center"
            title="Cetak Laporan / PDF"
          >
            <Printer className="w-4 h-4" /> Cetak / PDF
          </button>

          <button
            onClick={() => setShowBudgetForm(true)}
            className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer min-h-[44px] w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Tambah Alokasi
          </button>
        </div>
      </div>

      {/* Add Budget Form */}
      {showBudgetForm && (
        <form onSubmit={handleSubmit} className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 space-y-3">
          <h4 className="font-bold text-xs uppercase text-foreground/50 tracking-wider">Tambah Alokasi Anggaran</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Nama Kebutuhan / Vendor</label>
              <input
                type="text"
                required
                value={newBudget.name}
                onChange={(e) => setNewBudget(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Booking DP Gedung Serbaguna"
                className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Kategori</label>
              <select
                value={newBudget.category}
                onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
              >
                {CATEGORIES_BUDGET.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Estimasi Biaya (IDR)</label>
              <input
                type="number"
                required
                value={newBudget.estimated_cost}
                onChange={(e) => setNewBudget(prev => ({ ...prev, estimated_cost: Number(e.target.value) }))}
                placeholder="Estimasi"
                className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Biaya Riil / Nego (IDR)</label>
              <input
                type="number"
                value={newBudget.actual_cost}
                onChange={(e) => setNewBudget(prev => ({ ...prev, actual_cost: Number(e.target.value) }))}
                placeholder="Riil"
                className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowBudgetForm(false)}
              className="px-3.5 py-1.5 border border-foreground/20 text-xs uppercase font-bold rounded-lg text-foreground/60 hover:bg-foreground/5 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-foreground text-background text-xs uppercase font-bold rounded-lg hover:opacity-90 cursor-pointer"
            >
              Simpan Entri
            </button>
          </div>
        </form>
      )}

      {/* Budget Table (Desktop View) */}
      <div className="hidden md:block overflow-x-auto border border-foreground/15 rounded-xl">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="bg-foreground/5 border-b border-foreground/15 font-mono text-[10px] uppercase font-bold text-foreground/60">
              <th className="p-2 sm:p-3">Vendor / Keperluan</th>
              <th className="p-2 sm:p-3">Kategori</th>
              <th className="p-2 sm:p-3">Estimasi Biaya</th>
              <th className="p-2 sm:p-3">Biaya Riil</th>
              <th className="p-2 sm:p-3">Status Bayar</th>
              <th className="p-2 sm:p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/10">
            {filteredBudgets.map(budget => (
              <tr key={budget.id} className="hover:bg-foreground/5 transition-colors">
                <td className="p-2 sm:p-3 font-bold">{budget.name}</td>
                <td className="p-2 sm:p-3">
                  <span className="px-2 py-0.5 border border-foreground/10 bg-background rounded-full font-mono text-[9px]">
                    {budget.category}
                  </span>
                </td>
                <td className="p-2 sm:p-3 font-mono">{formatIDR(budget.estimated_cost)}</td>
                <td className="p-2 sm:p-3 font-mono text-primary font-bold">{formatIDR(budget.actual_cost)}</td>
                <td className="p-2 sm:p-3">
                  <button
                    onClick={() => onToggleBudgetPaid(budget.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      budget.is_paid
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-bold"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-600 font-bold"
                    }`}
                  >
                    {budget.is_paid ? "Lunas" : "Belum Lunas"}
                  </button>
                </td>
                <td className="p-2 sm:p-3 text-right">
                  <button
                    onClick={() => onDeleteBudget(budget.id)}
                    className="p-1.5 text-foreground/40 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBudgets.length === 0 && (
          <p className="text-center text-xs text-foreground/50 py-12">Belum ada alokasi anggaran dibuat atau tidak cocok dengan filter.</p>
        )}
      </div>

      {/* Budget List (Mobile View Card Grid) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredBudgets.map(budget => (
          <div key={budget.id} className="bg-card border border-foreground/15 rounded-xl p-3.5 shadow-sm space-y-2.5 select-none">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-xs text-foreground">{budget.name}</h4>
                <span className="inline-block px-2 py-0.5 mt-1 border border-foreground/10 bg-background rounded-full font-mono text-[9px] text-foreground/60">
                  {budget.category}
                </span>
              </div>
              <button
                onClick={() => onToggleBudgetPaid(budget.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer min-h-[28px] ${
                  budget.is_paid
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-600"
                }`}
              >
                {budget.is_paid ? "Lunas" : "Belum Lunas"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-foreground/[0.02] p-2 rounded-lg border border-foreground/5">
                <span className="text-[9px] font-mono uppercase text-foreground/45 block">Estimasi</span>
                <span className="font-mono text-foreground/80">{formatIDR(budget.estimated_cost)}</span>
              </div>
              <div className="bg-foreground/[0.02] p-2 rounded-lg border border-foreground/5">
                <span className="text-[9px] font-mono uppercase text-foreground/45 block">Riil / Nego</span>
                <span className="font-mono font-bold text-primary">{formatIDR(budget.actual_cost)}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-foreground/5">
              <button
                onClick={() => onDeleteBudget(budget.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-rose-500 border border-rose-500/10 rounded-lg hover:bg-rose-500/5 transition-colors cursor-pointer text-[10px] font-bold"
                title="Hapus Alokasi"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            </div>
          </div>
        ))}
        {filteredBudgets.length === 0 && (
          <p className="text-center text-xs text-foreground/50 py-12">Tidak ada alokasi anggaran yang cocok dengan filter.</p>
        )}
      </div>
    </div>
  );
}

export default BudgetTab;
