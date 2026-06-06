import { RefreshCw, CloudCheck, AlertCircle, Info, Save } from "lucide-react";

interface SyncHeaderProps {
  userName: string;
  autoSave: boolean;
  onToggleAutoSave: (checked: boolean) => void;
  savingStatus: "idle" | "saving" | "saved" | "error" | "unsaved";
  onTriggerSave: () => void;
}

export function SyncHeader({
  userName,
  autoSave,
  onToggleAutoSave,
  savingStatus,
  onTriggerSave
}: SyncHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background border border-foreground/10 rounded-2xl p-4 shadow-sm select-none">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-mono font-bold text-foreground/50">AKTIF: {userName}</span>
        </div>
        <p className="text-[10px] text-foreground/60 mt-0.5">Semua data disinkronkan secara aman ke data center.</p>
      </div>

      {/* Sync Controls */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {/* Auto Save Toggle */}
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => onToggleAutoSave(e.target.checked)}
            className="w-4 h-4 rounded border-foreground/15 accent-primary cursor-pointer"
          />
          <span>Auto Save</span>
        </label>

        {/* Sync indicator */}
        <div className="flex items-center gap-2">
          {savingStatus === "saving" && (
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
            </span>
          )}
          {savingStatus === "saved" && (
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
              <CloudCheck className="w-3.5 h-3.5" /> Cloud Tersinkron
            </span>
          )}
          {savingStatus === "error" && (
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Gagal Simpan
            </span>
          )}
          {savingStatus === "unsaved" && (
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Perubahan Lokal
            </span>
          )}
          {savingStatus === "idle" && (
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/40 flex items-center gap-1">
              <CloudCheck className="w-3.5 h-3.5" /> Tersimpan
            </span>
          )}
        </div>

        {/* Manual Save Button */}
        {!autoSave && (
          <button
            onClick={onTriggerSave}
            disabled={savingStatus === "saving"}
            className="px-3.5 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Simpan
          </button>
        )}
      </div>
    </div>
  );
}

export default SyncHeader;
