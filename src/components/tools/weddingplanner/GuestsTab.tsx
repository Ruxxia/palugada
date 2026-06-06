import { useState } from "react";
import { Search, FileSpreadsheet, Printer, Plus, Trash2, Copy, Check } from "lucide-react";
import { GuestItem } from "./types";
import { CATEGORIES_GUEST, downloadCSV } from "./utils";

interface GuestsTabProps {
  guests: GuestItem[];
  onAddGuest: (name: string, category: string, contactInfo: string) => void;
  onUpdateGuestRSVP: (id: string, status: GuestItem["rsvp_status"]) => void;
  onDeleteGuest: (id: string) => void;
}

export function GuestsTab({
  guests,
  onAddGuest,
  onUpdateGuestRSVP,
  onDeleteGuest
}: GuestsTabProps) {
  const [guestSearch, setGuestSearch] = useState("");
  const [guestFilterCategory, setGuestFilterCategory] = useState("all");
  const [guestFilterRSVP, setGuestFilterRSVP] = useState("all");
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: "", category: "Keluarga Utama", contact_info: "" });
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);

  const handleCopyInviteLink = (guestId: string) => {
    if (typeof window === "undefined") return;
    const inviteUrl = `${window.location.origin}/invite/${guestId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedGuestId(guestId);
    setTimeout(() => setCopiedGuestId(null), 2000);
  };

  const exportGuestsToCSV = () => {
    const headers = ["Nama Tamu", "Kategori", "Status RSVP", "Kontak", "Catatan"];
    const csvRows = [
      headers.join(","),
      ...guests.map(g => [
        `"${g.name.replace(/"/g, '""')}"`,
        `"${g.category.replace(/"/g, '""')}"`,
        `"${g.rsvp_status}"`,
        `"${(g.contact_info || "").replace(/"/g, '""')}"`,
        `"${(g.notes || "").replace(/"/g, '""')}"`
      ].join(","))
    ];
    const csvString = "\uFEFF" + csvRows.join("\n");
    downloadCSV(csvString, `daftar_tamu_pernikahan_${Date.now()}.csv`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest.name.trim()) return;
    onAddGuest(newGuest.name, newGuest.category, newGuest.contact_info);
    setNewGuest({ name: "", category: "Keluarga Utama", contact_info: "" });
    setShowGuestForm(false);
  };

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(guestSearch.toLowerCase());
    const matchesCat = guestFilterCategory === "all" || g.category === guestFilterCategory;
    const matchesRSVP = guestFilterRSVP === "all" || g.rsvp_status === guestFilterRSVP;
    return matchesSearch && matchesCat && matchesRSVP;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-foreground/10 pb-4">
        <div>
          <h3 className="font-display md:text-2xl uppercase">Daftar Tamu & RSVP</h3>
          <p className="text-xs text-foreground/60 mt-1">Kelola undangan dan lacak konfirmasi kehadiran tamu.</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
          {/* Search bar */}
          <div className="relative flex-1 sm:flex-initial w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-3 text-foreground/40" />
            <input
              type="text"
              value={guestSearch}
              onChange={(e) => setGuestSearch(e.target.value)}
              placeholder="Cari nama tamu..."
              className="pl-9 pr-3 py-2 w-full sm:w-48 border border-foreground/15 rounded-lg bg-background text-xs outline-none focus:border-primary text-foreground min-h-[40px]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={guestFilterCategory}
            onChange={(e) => setGuestFilterCategory(e.target.value)}
            className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground flex-1 sm:flex-initial min-h-[40px]"
          >
            <option value="all">Semua Kategori</option>
            {CATEGORIES_GUEST.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* RSVP Filter */}
          <select
            value={guestFilterRSVP}
            onChange={(e) => setGuestFilterRSVP(e.target.value)}
            className="p-2 border border-foreground/15 rounded-lg bg-background text-xs font-bold outline-none cursor-pointer text-foreground flex-1 sm:flex-initial min-h-[40px]"
          >
            <option value="all">Semua RSVP</option>
            <option value="Attending">Hadir</option>
            <option value="Declined">Menolak</option>
            <option value="Pending">Pending</option>
          </select>

          <button
            onClick={exportGuestsToCSV}
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
            onClick={() => setShowGuestForm(true)}
            className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity cursor-pointer min-h-[44px] w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Undang Tamu
          </button>
        </div>
      </div>

      {/* Add Guest Form */}
      {showGuestForm && (
        <form onSubmit={handleSubmit} className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 space-y-3">
          <h4 className="font-bold text-xs uppercase text-foreground/50 tracking-wider">Undang Tamu Baru</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={newGuest.name}
                onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama Tamu / Keluarga"
                className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Kategori Hubungan</label>
              <select
                value={newGuest.category}
                onChange={(e) => setNewGuest(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
              >
                {CATEGORIES_GUEST.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-foreground/60 block mb-1">Info Kontak / HP</label>
              <input
                type="text"
                value={newGuest.contact_info}
                onChange={(e) => setNewGuest(prev => ({ ...prev, contact_info: e.target.value }))}
                placeholder="0812xxxxxx"
                className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowGuestForm(false)}
              className="px-3.5 py-1.5 border border-foreground/20 text-xs uppercase font-bold rounded-lg text-foreground/60 hover:bg-foreground/5 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-foreground text-background text-xs uppercase font-bold rounded-lg hover:opacity-90 cursor-pointer"
            >
              Tambah Tamu
            </button>
          </div>
        </form>
      )}

      {/* Guest Table (Desktop View) */}
      <div className="hidden md:block print:block overflow-x-auto border border-foreground/15 rounded-xl print:border-none">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="bg-foreground/5 border-b border-foreground/15 font-mono text-[10px] uppercase font-bold text-foreground/60">
              <th className="p-2 sm:p-3">Nama Tamu</th>
              <th className="p-2 sm:p-3">Kategori</th>
              <th className="p-2 sm:p-3">Kontak</th>
              <th className="p-2 sm:p-3">Status RSVP</th>
              <th className="p-2 sm:p-3 text-right print:hidden">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/10">
            {filteredGuests.map(guest => (
              <tr key={guest.id} className="hover:bg-foreground/5 transition-colors">
                <td className="p-2 sm:p-3 font-bold">{guest.name}</td>
                <td className="p-2 sm:p-3">
                  <span className="px-2 py-0.5 border border-foreground/10 bg-background rounded-full font-mono text-[9px]">
                    {guest.category}
                  </span>
                </td>
                <td className="p-2 sm:p-3 font-mono text-foreground/75">{guest.contact_info || "-"}</td>
                <td className="p-2 sm:p-3">
                  <select
                    value={guest.rsvp_status}
                    onChange={(e) => onUpdateGuestRSVP(guest.id, e.target.value as any)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer print:hidden ${guest.rsvp_status === "Attending"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                        : guest.rsvp_status === "Declined"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-600"
                      }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Attending">Hadir</option>
                    <option value="Declined">Menolak</option>
                  </select>
                  <span className={`hidden print:inline-block px-2 py-0.5 rounded text-[9px] font-bold font-mono border ${guest.rsvp_status === "Attending"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                      : guest.rsvp_status === "Declined"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-600"
                    }`}>
                    {guest.rsvp_status === "Attending" ? "Hadir" : guest.rsvp_status === "Declined" ? "Menolak" : "Pending"}
                  </span>
                </td>
                <td className="p-2 sm:p-3 text-right flex items-center justify-end gap-1.5 print:hidden">
                  {guest.id.startsWith("g_") ? (
                    <span className="text-[9px] text-foreground/40 font-bold font-mono uppercase select-none cursor-help" title="Simpan ke cloud untuk buat link">
                      Belum Sync
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCopyInviteLink(guest.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${copiedGuestId === guest.id
                          ? "text-emerald-500 bg-emerald-500/10"
                          : "text-foreground/40 hover:text-primary hover:bg-primary/10"
                        }`}
                      title="Salin Link Undangan"
                    >
                      {copiedGuestId === guest.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteGuest(guest.id)}
                    className="p-1.5 text-foreground/40 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Hapus Tamu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredGuests.length === 0 && (
          <p className="text-center text-xs text-foreground/50 py-12">Belum ada tamu diundang atau tidak cocok dengan filter.</p>
        )}
      </div>

      {/* Guest List (Mobile View Card Grid) */}
      <div className="grid grid-cols-1 gap-3 md:hidden print:hidden">
        {filteredGuests.map(guest => (
          <div key={guest.id} className="bg-card border border-foreground/15 rounded-xl p-3.5 shadow-sm space-y-2.5 select-none">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-xs text-foreground">{guest.name}</h4>
                <span className="inline-block px-2 py-0.5 mt-1 border border-foreground/10 bg-background rounded-full font-mono text-[9px] text-foreground/60">
                  {guest.category}
                </span>
              </div>
              <select
                value={guest.rsvp_status}
                onChange={(e) => onUpdateGuestRSVP(guest.id, e.target.value as any)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${guest.rsvp_status === "Attending"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                    : guest.rsvp_status === "Declined"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-600"
                  }`}
              >
                <option value="Pending">Pending</option>
                <option value="Attending">Hadir</option>
                <option value="Declined">Menolak</option>
              </select>
            </div>
            {guest.contact_info && (
              <div className="text-[10px] font-mono text-foreground/75 flex items-center gap-1">
                <span>📱</span> {guest.contact_info}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2.5 border-t border-foreground/5">
              {guest.id.startsWith("g_") ? (
                <span className="text-[9px] text-foreground/40 font-bold font-mono uppercase select-none align-middle py-1.5" title="Simpan ke cloud untuk buat link">
                  Belum Sync
                </span>
              ) : (
                <button
                  onClick={() => handleCopyInviteLink(guest.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-foreground/10 text-[10px] font-bold text-foreground/70 ${copiedGuestId === guest.id ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "hover:text-primary hover:bg-primary/5"
                    }`}
                  title="Salin Link Undangan"
                >
                  {copiedGuestId === guest.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Disalin
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Salin Link Undangan
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => onDeleteGuest(guest.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-rose-500 border border-rose-500/10 rounded-lg hover:bg-rose-500/5 transition-colors cursor-pointer text-[10px] font-bold"
                title="Hapus Tamu"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            </div>
          </div>
        ))}
        {filteredGuests.length === 0 && (
          <p className="text-center text-xs text-foreground/50 py-12">Tidak ada tamu yang cocok dengan filter / pencarian.</p>
        )}
      </div>
    </div>
  );
}

export default GuestsTab;
