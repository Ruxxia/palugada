import { WeddingSettings } from "./types";
import { formatIDR } from "./utils";

interface BentoStatsProps {
  settings: WeddingSettings;
  onSettingsChange: (updater: (prev: WeddingSettings) => WeddingSettings) => void;
  countdown: { days: number; hours: number; minutes: number };
  totalEstimatedBudget: number;
  totalActualBudget: number;
  totalGuests: number;
  guestsAttending: number;
  guestsDeclined: number;
  guestsPending: number;
  completedTodos: number;
  totalTodos: number;
  todoPercentage: number;
}

export function BentoStats({
  settings,
  onSettingsChange,
  countdown,
  totalEstimatedBudget,
  totalActualBudget,
  totalGuests,
  guestsAttending,
  guestsDeclined,
  guestsPending,
  completedTodos,
  totalTodos,
  todoPercentage
}: BentoStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {/* Countdown Card */}
      <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 shadow-sm md:shadow-tactile flex flex-col justify-between relative overflow-hidden select-none">
        <div className="absolute right-0 top-0 opacity-5 text-7xl translate-x-2 -translate-y-2">🔔</div>
        <div>
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-foreground/50 uppercase tracking-widest block">Hari H Pernikahan</span>
          <input
            type="date"
            value={settings.wedding_date}
            onChange={(e) => onSettingsChange(prev => ({ ...prev, wedding_date: e.target.value }))}
            className="text-[10px] sm:text-xs font-mono font-bold mt-1.5 bg-background border border-foreground/15 rounded p-1 w-full outline-none text-foreground cursor-pointer"
          />
        </div>
        <div className="mt-3 sm:mt-4 flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl md:text-5xl font-display font-bold leading-none">{countdown.days}</span>
          <span className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wide text-foreground/60">Hari Lagi</span>
        </div>
        <div className="mt-1.5 sm:mt-2 text-[8px] sm:text-[10px] font-mono text-foreground/50">
          {countdown.hours} Jam {countdown.minutes} Menit tersisa
        </div>
      </div>

      {/* Budget Tracker Bento Card */}
      <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 shadow-sm md:shadow-tactile flex flex-col justify-between select-none">
        <div>
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-foreground/50 uppercase tracking-widest block">Target Anggaran</span>
          <input
            type="number"
            value={settings.total_budget}
            onChange={(e) => onSettingsChange(prev => ({ ...prev, total_budget: Number(e.target.value) }))}
            className="text-sm sm:text-base md:text-lg font-display font-bold mt-1 bg-background border border-foreground/15 rounded p-1 w-full outline-none text-foreground"
          />
        </div>
        <div className="mt-3 sm:mt-4">
          <div className="flex justify-between text-[9px] sm:text-[10px] md:text-xs text-foreground/75 mb-1 font-bold">
            <span>Rencana Riil</span>
            <span>{settings.total_budget > 0 ? Math.round((totalActualBudget / settings.total_budget) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-foreground/10 h-1.5 sm:h-2 md:h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${settings.total_budget > 0 ? Math.min(100, Math.round((totalActualBudget / settings.total_budget) * 100)) : 0}%` }}
            ></div>
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2 text-[8px] sm:text-[10px] font-mono text-foreground/50 flex flex-col sm:flex-row sm:justify-between sm:gap-2 gap-0.5">
          <span className="truncate">Est: {formatIDR(totalEstimatedBudget)}</span>
          <span className="truncate">Riil: {formatIDR(totalActualBudget)}</span>
        </div>
      </div>

      {/* Guest RSVP Stats Bento Card */}
      <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 shadow-sm md:shadow-tactile flex flex-col justify-between select-none">
        <div>
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-foreground/50 uppercase tracking-widest block">Manajemen Undangan</span>
          <span className="text-xl sm:text-2xl md:text-3xl font-display font-bold block mt-1">{totalGuests} <span className="text-[10px] sm:text-xs text-foreground/60 uppercase">Tamu</span></span>
        </div>
        <div className="grid grid-cols-3 gap-1 mt-3 sm:mt-4 text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-0.5 sm:p-1 md:p-1.5 rounded-lg md:rounded-xl">
            <span className="text-xs font-mono font-bold text-emerald-500 block">{guestsAttending}</span>
            <span className="text-[7px] sm:text-[8px] uppercase font-bold text-foreground/50">Hadir</span>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 p-0.5 sm:p-1 md:p-1.5 rounded-lg md:rounded-xl">
            <span className="text-xs font-mono font-bold text-rose-500 block">{guestsDeclined}</span>
            <span className="text-[7px] sm:text-[8px] uppercase font-bold text-foreground/50">Tolak</span>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 p-0.5 sm:p-1 md:p-1.5 rounded-lg md:rounded-xl">
            <span className="text-xs font-mono font-bold text-foreground/60 block">{guestsPending}</span>
            <span className="text-[7px] sm:text-[8px] uppercase font-bold text-foreground/50">Pend</span>
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2 text-[8px] sm:text-[10px] font-mono text-foreground/50 text-right">
          RSVP: {totalGuests > 0 ? Math.round(((guestsAttending + guestsDeclined) / totalGuests) * 100) : 0}%
        </div>
      </div>

      {/* Tasks Progress Bento Card */}
      <div className="bg-card border border-foreground/15 md:border-2 md:border-foreground rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 shadow-sm md:shadow-tactile flex flex-col justify-between select-none">
        <div>
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-foreground/50 uppercase tracking-widest block">Tugas & Timeline</span>
          <span className="text-xl sm:text-2xl md:text-3xl font-display font-bold block mt-1">{completedTodos} / {totalTodos} <span className="text-[10px] sm:text-xs text-foreground/60 uppercase">Selesai</span></span>
        </div>
        <div className="mt-3 sm:mt-4">
          <div className="flex justify-between text-[9px] sm:text-[10px] md:text-xs text-foreground/75 mb-1 font-bold">
            <span>Progres</span>
            <span>{todoPercentage}%</span>
          </div>
          <div className="w-full bg-foreground/10 h-1.5 sm:h-2 md:h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${todoPercentage}%` }}
            ></div>
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2 text-[8px] sm:text-[10px] font-mono text-foreground/50">
          Sisa: {totalTodos - completedTodos} tugas lagi
        </div>
      </div>
    </div>
  );
}

export default BentoStats;
