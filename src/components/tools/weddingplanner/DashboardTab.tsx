import { DollarSign, CheckSquare, MapPin } from "lucide-react";
import { WeddingSettings, TodoItem } from "./types";
import { formatIDR } from "./utils";

interface DashboardTabProps {
  settings: WeddingSettings;
  totalActualBudget: number;
  totalPaidBudget: number;
  todos: TodoItem[];
  onToggleTodo: (id: string) => void;
  onSettingsChange?: (updater: (prev: WeddingSettings) => WeddingSettings) => void;
}

export function DashboardTab({
  settings,
  totalActualBudget,
  totalPaidBudget,
  todos,
  onToggleTodo,
  onSettingsChange
}: DashboardTabProps) {
  const upcomingTodos = todos.filter(t => !t.title.startsWith("LOGISTICS:") && !t.is_completed).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="border-b border-foreground/10 pb-4">
        <h3 className="font-display md:text-2xl uppercase">Dashboard Ringkasan</h3>
        <p className="text-xs text-foreground/60 mt-1">Status dan pandangan umum kesiapan pernikahan Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Summary Card */}
        <div className="border border-foreground/15 rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-sm uppercase text-foreground/75 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" /> Rangkuman Anggaran
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-foreground/5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-foreground/50 block">Anggaran Target</span>
              <span className="text-sm font-mono font-bold">{formatIDR(settings.total_budget)}</span>
            </div>
            <div className="p-3 bg-foreground/5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-foreground/50 block">Rencana Biaya Riil</span>
              <span className="text-sm font-mono font-bold text-primary">{formatIDR(totalActualBudget)}</span>
            </div>
            <div className="p-3 bg-foreground/5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-foreground/50 block">Sudah Dibayar</span>
              <span className="text-sm font-mono font-bold text-emerald-600">{formatIDR(totalPaidBudget)}</span>
            </div>
            <div className="p-3 bg-foreground/5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-foreground/50 block">Belum Dibayar</span>
              <span className="text-sm font-mono font-bold text-rose-500">{formatIDR(totalActualBudget - totalPaidBudget)}</span>
            </div>
          </div>
        </div>

        {/* Quick Timeline Tasks Card */}
        <div className="border border-foreground/15 rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-sm uppercase text-foreground/75 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" /> Tugas Penting Mendatang
          </h4>
          <div className="space-y-3">
            {upcomingTodos.map(todo => (
              <div key={todo.id} className="flex justify-between items-center bg-foreground/5 p-3 rounded-xl border border-foreground/5">
                <div>
                  <p className="text-xs font-bold text-foreground/85">{todo.title}</p>
                  {todo.due_date && (
                    <span className="text-[9px] font-mono text-foreground/45 mt-1 block">Batas: {todo.due_date}</span>
                  )}
                </div>
                <button
                  onClick={() => onToggleTodo(todo.id)}
                  className="w-6 h-6 border-2 border-foreground/30 rounded-md flex items-center justify-center hover:border-foreground transition-all cursor-pointer bg-background"
                >
                </button>
              </div>
            ))}
            {upcomingTodos.length === 0 && (
              <p className="text-xs text-foreground/50 text-center py-6">🎉 Semua tugas penting telah diselesaikan!</p>
            )}
          </div>
        </div>
      </div>

      {/* Venue & Location Settings Card */}
      <div className="border border-foreground/15 rounded-xl p-5 space-y-4">
        <h4 className="font-bold text-sm uppercase text-foreground/75 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" /> Informasi Lokasi & Peta Acara
        </h4>
        <p className="text-xs text-foreground/50">
          Informasi tempat resepsi/akad ini akan ditampilkan secara langsung pada halaman undangan tamu Anda.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-foreground/50 mb-1">Nama Tempat & Alamat Lengkap</label>
            <textarea
              value={settings.wedding_location || ""}
              onChange={(e) => onSettingsChange && onSettingsChange(prev => ({ ...prev, wedding_location: e.target.value }))}
              placeholder="Contoh: Gedung Pertemuan Utama, Jl. Raya Kebahagiaan No. 77, Jakarta Selatan"
              rows={3}
              className="text-xs font-mono bg-background border border-foreground/15 rounded-xl p-3 w-full outline-none text-foreground focus:border-primary transition-colors resize-none"
            />
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <label className="block text-[10px] uppercase font-bold text-foreground/50 mb-1">Link Google Maps (URL)</label>
              <input
                type="text"
                value={settings.location_maps_url || ""}
                onChange={(e) => onSettingsChange && onSettingsChange(prev => ({ ...prev, location_maps_url: e.target.value }))}
                placeholder="Contoh: https://maps.app.goo.gl/..."
                className="text-xs font-mono bg-background border border-foreground/15 rounded-xl p-3 w-full outline-none text-foreground focus:border-primary transition-colors"
              />
            </div>
            {settings.location_maps_url && (
              <div className="mt-2">
                <a
                  href={settings.location_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase hover:underline"
                >
                  🗺️ Test Link Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardTab;
