import { useState, useEffect } from "react";

interface TimezoneItem {
  name: string;
  id: string;
  label: string;
}

const DEFAULT_TIMEZONES: TimezoneItem[] = [
  { name: "WIB (Jakarta)", id: "Asia/Jakarta", label: "WIB" },
  { name: "UTC (Coordinated Universal Time)", id: "UTC", label: "UTC" },
  { name: "SGT (Singapore)", id: "Asia/Singapore", label: "SGT" },
  { name: "GMT (London)", id: "Europe/London", label: "GMT" },
  { name: "EST (New York)", id: "America/New York", label: "EST" },
  { name: "PST (Los Angeles)", id: "America/Los_Angeles", label: "PST" },
  { name: "JST (Tokyo)", id: "Asia/Tokyo", label: "JST" },
];

export function MeetingTimeCalculator() {
  const [meetingDate, setMeetingDate] = useState(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    return d.toISOString().split("T")[0];
  });
  const [meetingHour, setMeetingHour] = useState(14); // 14:00 (2 PM) WIB base default
  const [baseTimezone, setBaseTimezone] = useState("Asia/Jakarta");
  const [activeTimezones, setActiveTimezones] = useState<TimezoneItem[]>(DEFAULT_TIMEZONES);

  const getTzTime = (baseDateStr: string, baseHour: number, baseTz: string, targetTz: string) => {
    try {
      // Create local date object in base timezone
      const localDate = new Date(`${baseDateStr}T${String(baseHour).padStart(2, "0")}:00:00`);
      
      // Get the time in target timezone
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: targetTz,
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      });
      const parts = formatter.formatToParts(localDate);
      const hourVal = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
      const minVal = parts.find((p) => p.type === "minute")?.value || "00";

      return {
        hour: hourVal,
        minute: minVal,
        formatted: `${String(hourVal).padStart(2, "0")}:${minVal}`,
      };
    } catch (e) {
      return { hour: 0, minute: "00", formatted: "00:00" };
    }
  };

  const getStatusColor = (hour: number) => {
    // 9 AM to 5 PM (9 to 17) -> Golden overlap / Working Hours
    if (hour >= 9 && hour < 18) {
      return "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400";
    }
    // 10 PM to 6 AM (22 to 6) -> Sleeping hours
    if (hour >= 22 || hour < 6) {
      return "bg-destructive/10 border-destructive/20 text-destructive";
    }
    // Personal hours / off hours
    return "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400";
  };

  const getStatusLabel = (hour: number) => {
    if (hour >= 9 && hour < 18) return "Waktu Kerja";
    if (hour >= 22 || hour < 6) return "Waktu Tidur";
    return "Luar Jam Kerja";
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        {/* Controls block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
              Pilih Tanggal Rapat
            </label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full h-10 px-3 border border-foreground/10 rounded-lg text-sm bg-background focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
              Zona Waktu Utama (Base)
            </label>
            <select
              value={baseTimezone}
              onChange={(e) => setBaseTimezone(e.target.value)}
              className="w-full h-10 px-3 border border-foreground/10 rounded-lg text-sm bg-background focus:outline-none focus:border-primary font-mono font-bold"
            >
              {DEFAULT_TIMEZONES.map((tz) => (
                <option key={tz.id} value={tz.id}>
                  {tz.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                Jam Rapat Utama (Base)
              </label>
              <span className="text-xs font-mono text-primary font-bold">{String(meetingHour).padStart(2, "0")}:00</span>
            </div>
            <input
              type="range"
              min="0"
              max="23"
              value={meetingHour}
              onChange={(e) => setMeetingHour(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Timelines Output */}
        <div className="space-y-4 pt-4 border-t border-foreground/5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
            Perbandingan Waktu Pertemuan Global
          </h3>

          <div className="space-y-3">
            {activeTimezones.map((tz) => {
              const info = getTzTime(meetingDate, meetingHour, baseTimezone, tz.id);
              const colorClass = getStatusColor(info.hour);
              const isBase = tz.id === baseTimezone;

              return (
                <div
                  key={tz.id}
                  className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${
                    isBase ? "border-primary bg-primary/5" : "border-foreground/10 bg-background"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-foreground/90">{tz.name}</span>
                      {isBase && (
                        <span className="text-[9px] bg-primary text-white font-mono px-1.5 py-0.5 rounded font-bold uppercase">
                          Base
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-foreground/40 uppercase block">
                      Zona: {tz.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded border uppercase tracking-wider ${colorClass}`}>
                      {info.formatted} - {getStatusLabel(info.hour)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informational Guidelines on working hours */}
        <div className="p-4 bg-background border border-foreground/10 rounded-lg flex flex-wrap gap-6 justify-center text-xs font-mono text-foreground/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span>Jam Kerja Utama (09:00 - 18:00)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span>Luar Jam Kerja (Malam/Sore)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Jam Istirahat/Tidur (22:00 - 06:00)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
