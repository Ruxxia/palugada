import { useState } from "react";
import { FileSpreadsheet, Printer, Plus, Package, Trash2, Edit3, Check, X } from "lucide-react";
import { TodoItem, LogisticsMeta } from "./types";
import { parseLogisticsNotes, buildLogisticsNotes, formatIDR, downloadCSV } from "./utils";

interface LogisticsTabProps {
  todos: TodoItem[];
  onAddLogistics: (title: string, status: LogisticsMeta["status"], source: string, price: number, notes: string) => void;
  onUpdateLogisticsStatus: (id: string, status: LogisticsMeta["status"]) => void;
  onDeleteLogistics: (id: string) => void;
  onUpdateLogisticsMeta: (id: string, title: string, meta: LogisticsMeta) => void;
  onInitLogisticsTemplate: () => void;
}

export function LogisticsTab({
  todos,
  onAddLogistics,
  onUpdateLogisticsStatus,
  onDeleteLogistics,
  onUpdateLogisticsMeta,
  onInitLogisticsTemplate
}: LogisticsTabProps) {
  const [logisticsFilterStatus, setLogisticsFilterStatus] = useState("all");
  const [showLogisticsForm, setShowLogisticsForm] = useState(false);
  const [newLogistics, setNewLogistics] = useState({
    title: "",
    status: "Belum Dibeli" as LogisticsMeta["status"],
    source: "",
    price: 0,
    notes: ""
  });

  const [editingLogisticsId, setEditingLogisticsId] = useState<string | null>(null);
  const [editingLogisticsData, setEditingLogisticsData] = useState<{
    title: string;
    source: string;
    price: number;
    notes: string;
  } | null>(null);

  const logisticsTodos = todos.filter(t => t.title.startsWith("LOGISTICS:"));
  const totalLogistics = logisticsTodos.length;
  const completedLogistics = logisticsTodos.filter(t => {
    const meta = parseLogisticsNotes(t.notes);
    return meta.status === "Siap (Ready)";
  }).length;

  const totalLogisticsEstimatedCost = logisticsTodos.reduce((acc, curr) => {
    const meta = parseLogisticsNotes(curr.notes);
    return acc + (meta.price || 0);
  }, 0);

  const totalLogisticsSpent = logisticsTodos.reduce((acc, curr) => {
    const meta = parseLogisticsNotes(curr.notes);
    return acc + (meta.status === "Siap (Ready)" ? (meta.price || 0) : 0);
  }, 0);

  const exportLogisticsToCSV = () => {
    const headers = ["Nama Barang", "Status", "Sumber/Toko", "Harga", "Catatan"];
    const csvRows = [
      headers.join(","),
      ...logisticsTodos.map(t => {
        const meta = parseLogisticsNotes(t.notes);
        return [
          `"${t.title.replace("LOGISTICS:", "").replace(/"/g, '""')}"`,
          `"${meta.status}"`,
          `"${(meta.source || "").replace(/"/g, '""')}"`,
          `"${meta.price || 0}"`,
          `"${(meta.notes || "").replace(/"/g, '""')}"`
        ].join(",");
      })
    ];
    const csvString = "\uFEFF" + csvRows.join("\n");
    downloadCSV(csvString, `logistik_pernikahan_${Date.now()}.csv`);
  };

  const handleStartEdit = (id: string, title: string, meta: LogisticsMeta) => {
    setEditingLogisticsId(id);
    setEditingLogisticsData({
      title: title.replace("LOGISTICS:", ""),
      source: meta.source || "",
      price: meta.price || 0,
      notes: meta.notes || ""
    });
  };

  const handleSaveEdit = (id: string) => {
    if (!editingLogisticsData) return;
    const meta = parseLogisticsNotes(todos.find(t => t.id === id)?.notes);
    const updatedMeta: LogisticsMeta = {
      ...meta,
      source: editingLogisticsData.source || undefined,
      price: editingLogisticsData.price || undefined,
      notes: editingLogisticsData.notes || undefined
    };
    onUpdateLogisticsMeta(id, editingLogisticsData.title, updatedMeta);
    setEditingLogisticsId(null);
    setEditingLogisticsData(null);
  };

  const handleCancelEdit = () => {
    setEditingLogisticsId(null);
    setEditingLogisticsData(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogistics.title.trim()) return;
    onAddLogistics(
      newLogistics.title,
      newLogistics.status,
      newLogistics.source,
      newLogistics.price,
      newLogistics.notes
    );
    setNewLogistics({ title: "", status: "Belum Dibeli", source: "", price: 0, notes: "" });
    setShowLogisticsForm(false);
  };

  const filteredLogistics = logisticsTodos.filter(t => {
    if (logisticsFilterStatus === "all") return true;
    const meta = parseLogisticsNotes(t.notes);
    return meta.status === logisticsFilterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-foreground/10 pb-4">
        <div>
          <h3 className="font-display md:text-2xl uppercase">Logistik & Belanja</h3>
          <p className="text-xs text-foreground/60 mt-1">Kelola barang bawaan, mahar, seserahan, suvenir, dan perlengkapan lainnya.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
          <select
            value={logisticsFilterStatus}
            onChange={(e) => setLogisticsFilterStatus(e.target.value)}
            className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground flex-1 sm:flex-initial min-h-[40px]"
          >
            <option value="all">Semua Status</option>
            <option value="Belum Dibeli">Belum Dibeli</option>
            <option value="Sedang Diproses">Sedang Diproses</option>
            <option value="Siap (Ready)">Siap (Ready)</option>
          </select>

          <button
            onClick={exportLogisticsToCSV}
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
            onClick={() => setShowLogisticsForm(true)}
            className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer min-h-[44px] w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Tambah Barang
          </button>
        </div>
      </div>

      {/* Logistics Stats Bento Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <div className="bg-foreground/[0.02] border border-foreground/15 rounded-xl p-4">
          <span className="text-[10px] font-mono font-bold text-foreground/50 uppercase block">Total Barang</span>
          <span className="md:text-2xl font-bold block mt-1">{totalLogistics}</span>
        </div>
        <div className="bg-foreground/[0.02] border border-foreground/15 rounded-xl p-4">
          <span className="text-[10px] font-mono font-bold text-foreground/50 uppercase block">Barang Siap</span>
          <span className="md:text-2xl font-bold text-emerald-600 block mt-1">{completedLogistics}</span>
        </div>
        <div className="bg-foreground/[0.02] border border-foreground/15 rounded-xl p-4">
          <span className="text-[10px] font-mono font-bold text-foreground/50 uppercase block">Estimasi Belanja</span>
          <span className="md:text-2xl font-bold block mt-1">{formatIDR(totalLogisticsEstimatedCost)}</span>
        </div>
        <div className="bg-foreground/[0.02] border border-foreground/15 rounded-xl p-4">
          <span className="text-[10px] font-mono font-bold text-foreground/50 uppercase block">Realisasi</span>
          <span className="md:text-2xl font-bold text-primary block mt-1">{formatIDR(totalLogisticsSpent)}</span>
        </div>
      </div>

      {/* Add Logistics Form */}
      {showLogisticsForm && (
        <form onSubmit={handleSubmit} className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 space-y-3">
          <h4 className="font-bold text-xs uppercase text-foreground/50 tracking-wider">Tambah Barang Logistik & Belanja</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Nama Barang / Keperluan</label>
              <input
                type="text"
                required
                value={newLogistics.title}
                onChange={(e) => setNewLogistics(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Cincin Kawin Emas 10gr"
                className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Status Awal</label>
              <select
                value={newLogistics.status}
                onChange={(e) => setNewLogistics(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary font-bold cursor-pointer"
              >
                <option value="Belum Dibeli">Belum Dibeli</option>
                <option value="Sedang Diproses">Sedang Diproses</option>
                <option value="Siap (Ready)">Siap (Ready)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Harga Estimasi (IDR)</label>
              <input
                type="number"
                value={newLogistics.price}
                onChange={(e) => setNewLogistics(prev => ({ ...prev, price: Number(e.target.value) }))}
                className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Sumber / Toko / Vendor</label>
              <input
                type="text"
                value={newLogistics.source}
                onChange={(e) => setNewLogistics(prev => ({ ...prev, source: e.target.value }))}
                placeholder="Contoh: Toko Emas Melati"
                className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Catatan Tambahan</label>
              <input
                type="text"
                value={newLogistics.notes}
                onChange={(e) => setNewLogistics(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Contoh: Perlu diukur ulang sebelum tanggal 10"
                className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowLogisticsForm(false)}
              className="px-3.5 py-1.5 border border-foreground/20 text-xs uppercase font-bold rounded-lg text-foreground/60 hover:bg-foreground/5 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-foreground text-background text-xs uppercase font-bold rounded-lg hover:opacity-90 cursor-pointer"
            >
              Simpan Barang
            </button>
          </div>
        </form>
      )}

      {/* Default Template Initialization Banner */}
      {totalLogistics === 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-4">
          <Package className="w-12 h-12 text-primary mx-auto opacity-75 animate-bounce" />
          <div>
            <h4 className="font-bold text-sm uppercase">Mulai dengan Templat Bawaan</h4>
            <p className="text-xs text-foreground/60 max-w-md mx-auto mt-1">
              Belum ada barang di daftar logistik Anda. Gunakan templat bawaan untuk memuat item standar seperti Cincin, Mahar, Seserahan, Souvenir, dan lainnya.
            </p>
          </div>
          <button
            onClick={onInitLogisticsTemplate}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Inisialisasi Templat Bawaan
          </button>
        </div>
      )}

      {/* Logistics List Table (Desktop View) */}
      {totalLogistics > 0 && (
        <div className="hidden md:block print:block overflow-x-auto border border-foreground/15 rounded-xl print:border-none">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-foreground/5 border-b border-foreground/15 font-mono text-[10px] uppercase font-bold text-foreground/60">
                <th className="p-2 sm:p-3">Nama Barang</th>
                <th className="p-2 sm:p-3">Status</th>
                <th className="p-2 sm:p-3">Sumber / Toko</th>
                <th className="p-2 sm:p-3">Harga Estimasi</th>
                <th className="p-2 sm:p-3">Catatan</th>
                <th className="p-2 sm:p-3 text-right print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {filteredLogistics.map(t => {
                const meta = parseLogisticsNotes(t.notes);
                const cleanTitle = t.title.replace("LOGISTICS:", "");
                const isEditing = editingLogisticsId === t.id && editingLogisticsData;

                return (
                  <tr key={t.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="p-2 sm:p-3 font-bold">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingLogisticsData.title}
                          onChange={(e) => setEditingLogisticsData(prev => prev ? { ...prev, title: e.target.value } : null)}
                          className="p-1 border border-foreground/15 rounded bg-background text-xs text-foreground font-bold outline-none w-full"
                        />
                      ) : (
                        cleanTitle
                      )}
                    </td>
                    <td className="p-2 sm:p-3">
                      <select
                        value={meta.status}
                        onChange={(e) => onUpdateLogisticsStatus(t.id, e.target.value as any)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer print:hidden ${
                          meta.status === "Siap (Ready)"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-bold"
                            : meta.status === "Sedang Diproses"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-600 font-bold"
                            : "bg-foreground/5 border-foreground/10 text-foreground/60 font-bold"
                        }`}
                      >
                        <option value="Belum Dibeli">Belum Dibeli</option>
                        <option value="Sedang Diproses">Sedang Diproses</option>
                        <option value="Siap (Ready)">Siap (Ready)</option>
                      </select>
                      <span className={`hidden print:inline-block px-2 py-0.5 rounded text-[9px] font-bold font-mono border ${
                        meta.status === "Siap (Ready)"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                          : meta.status === "Sedang Diproses"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                          : "bg-foreground/5 border-foreground/10 text-foreground/60"
                      }`}>
                        {meta.status}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 text-foreground/75 font-medium">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingLogisticsData.source}
                          onChange={(e) => setEditingLogisticsData(prev => prev ? { ...prev, source: e.target.value } : null)}
                          className="p-1 border border-foreground/15 rounded bg-background text-xs text-foreground outline-none w-full"
                          placeholder="Vendor / Sumber"
                        />
                      ) : (
                        meta.source || "-"
                      )}
                    </td>
                    <td className="p-2 sm:p-3 font-mono font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editingLogisticsData.price || ""}
                          onChange={(e) => setEditingLogisticsData(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                          className="p-1 border border-foreground/15 rounded bg-background text-xs text-foreground font-mono outline-none w-28"
                          placeholder="Harga"
                        />
                      ) : (
                        formatIDR(meta.price || 0)
                      )}
                    </td>
                    <td className="p-2 sm:p-3 text-foreground/60 italic">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingLogisticsData.notes}
                          onChange={(e) => setEditingLogisticsData(prev => prev ? { ...prev, notes: e.target.value } : null)}
                          className="p-1 border border-foreground/15 rounded bg-background text-xs text-foreground outline-none w-full"
                          placeholder="Catatan"
                        />
                      ) : (
                        meta.notes || "-"
                      )}
                    </td>
                    <td className="p-2 sm:p-3 text-right print:hidden">
                      <div className="flex justify-end gap-1 select-none print:hidden">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(t.id)}
                              className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer"
                              title="Simpan Perubahan"
                            >
                              <Check className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 text-foreground/40 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Batal"
                            >
                              <X className="w-4.5 h-4.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(t.id, t.title, meta)}
                              className="p-1.5 text-foreground/40 hover:text-amber-500 rounded-lg hover:bg-amber-500/10 transition-colors cursor-pointer"
                              title="Edit Barang"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteLogistics(t.id)}
                              className="p-1.5 text-foreground/40 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Hapus Barang"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Logistics List (Mobile View Card Grid) */}
      {totalLogistics > 0 && (
        <div className="grid grid-cols-1 gap-3 md:hidden print:hidden">
          {filteredLogistics.map(t => {
            const meta = parseLogisticsNotes(t.notes);
            const cleanTitle = t.title.replace("LOGISTICS:", "");
            const isEditing = editingLogisticsId === t.id && editingLogisticsData;

            return (
              <div key={t.id} className="bg-card border border-foreground/15 rounded-xl p-3.5 shadow-sm space-y-2.5 select-none">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[9px] font-bold uppercase text-foreground/50 block mb-1">Nama Barang</label>
                      <input
                        type="text"
                        value={editingLogisticsData.title}
                        onChange={(e) => setEditingLogisticsData(prev => prev ? { ...prev, title: e.target.value } : null)}
                        className="p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground font-bold outline-none w-full min-h-[38px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold uppercase text-foreground/50 block mb-1">Harga (IDR)</label>
                        <input
                          type="number"
                          value={editingLogisticsData.price || ""}
                          onChange={(e) => setEditingLogisticsData(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                          className="p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground font-mono outline-none w-full min-h-[38px]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-foreground/50 block mb-1">Sumber / Toko</label>
                        <input
                          type="text"
                          value={editingLogisticsData.source}
                          onChange={(e) => setEditingLogisticsData(prev => prev ? { ...prev, source: e.target.value } : null)}
                          className="p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none w-full min-h-[38px]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase text-foreground/50 block mb-1">Catatan</label>
                      <input
                        type="text"
                        value={editingLogisticsData.notes}
                        onChange={(e) => setEditingLogisticsData(prev => prev ? { ...prev, notes: e.target.value } : null)}
                        className="p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none w-full min-h-[38px]"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-foreground/5">
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1 px-3.5 py-1.5 border border-foreground/20 text-[10px] font-bold uppercase rounded-lg text-foreground/60 hover:bg-foreground/5 transition-colors cursor-pointer min-h-[34px]"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleSaveEdit(t.id)}
                        className="flex items-center gap-1 px-3.5 py-1.5 bg-foreground text-background text-[10px] font-bold uppercase rounded-lg hover:opacity-90 transition-opacity cursor-pointer min-h-[34px]"
                      >
                        <Check className="w-3.5 h-3.5" /> Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-foreground">{cleanTitle}</h4>
                        {meta.source && (
                          <span className="inline-block px-2 py-0.5 mt-1 border border-foreground/10 bg-background rounded-full font-mono text-[9px] text-foreground/60">
                            🏪 {meta.source}
                          </span>
                        )}
                      </div>
                      <select
                        value={meta.status}
                        onChange={(e) => onUpdateLogisticsStatus(t.id, e.target.value as any)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                          meta.status === "Siap (Ready)"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-bold"
                            : meta.status === "Sedang Diproses"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-600 font-bold"
                            : "bg-foreground/5 border-foreground/10 text-foreground/60 font-bold"
                        }`}
                      >
                        <option value="Belum Dibeli">Belum Dibeli</option>
                        <option value="Sedang Diproses">Sedang Diproses</option>
                        <option value="Siap (Ready)">Siap (Ready)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-foreground/[0.02] p-2 rounded-lg border border-foreground/5">
                        <span className="text-[9px] font-mono uppercase text-foreground/45 block">Harga Estimasi</span>
                        <span className="font-mono text-foreground/85">{formatIDR(meta.price || 0)}</span>
                      </div>
                      {meta.notes && (
                        <div className="bg-foreground/[0.02] p-2 rounded-lg border border-foreground/5 col-span-2">
                          <span className="text-[9px] font-mono uppercase text-foreground/45 block">Catatan</span>
                          <span className="text-foreground/75 italic">{meta.notes}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-2.5 border-t border-foreground/5">
                      <button
                        onClick={() => handleStartEdit(t.id, t.title, meta)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-foreground/10 rounded-lg text-[10px] font-bold text-foreground/70 hover:bg-foreground/5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => onDeleteLogistics(t.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-rose-500 border border-rose-500/10 rounded-lg hover:bg-rose-500/5 transition-colors cursor-pointer text-[10px] font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LogisticsTab;
