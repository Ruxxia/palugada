import { useState, useEffect, useMemo } from "react";
import { Copy, Check, Info, Calendar, RefreshCw, AlertCircle } from "lucide-react";

// ==========================================
// Emojis & Consts Maps
// ==========================================
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const WEEKDAY_NAMES = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
];

// Presets
const PRESETS = [
  { label: "Setiap Menit", value: "* * * * *" },
  { label: "Setiap 5 Menit", value: "*/5 * * * *" },
  { label: "Setiap Jam (Awal Jam)", value: "0 * * * *" },
  { label: "Setiap 2 Jam", value: "0 */2 * * * *" },
  { label: "Setiap Hari (Tengah Malam)", value: "0 0 * * *" },
  { label: "Setiap Hari jam 09:00 pagi", value: "0 9 * * *" },
  { label: "Hari Kerja (Senin - Jumat) Jam 08:00", value: "0 8 * * 1-5" },
  { label: "Setiap Awal Minggu (Minggu Tengah Malam)", value: "0 0 * * 0" },
  { label: "Setiap Awal Bulan (Tanggal 1 Tengah Malam)", value: "0 0 1 * *" }
];

// ==========================================
// Parsing & Allowed Value Math
// ==========================================
function parseRange(part: string, min: number, max: number): number[] {
  const result: number[] = [];

  // Comma-separated lists
  if (part.includes(",")) {
    const list = part.split(",");
    for (const item of list) {
      result.push(...parseRange(item, min, max));
    }
    return Array.from(new Set(result)).sort((a, b) => a - b);
  }

  // Step values (e.g. */15 or 1-30/5)
  if (part.includes("/")) {
    const [rangePart, stepPart] = part.split("/");
    const step = parseInt(stepPart, 10);
    if (isNaN(step) || step <= 0) return [];
    
    let start = min;
    let end = max;

    if (rangePart !== "*") {
      if (rangePart.includes("-")) {
        const [s, e] = rangePart.split("-").map(x => parseInt(x, 10));
        if (!isNaN(s)) start = s;
        if (!isNaN(e)) end = e;
      } else {
        const singleVal = parseInt(rangePart, 10);
        if (!isNaN(singleVal)) start = singleVal;
      }
    }

    for (let i = start; i <= end; i += step) {
      if (i >= min && i <= max) {
        result.push(i);
      }
    }
    return result;
  }

  // Range values (e.g. 1-5)
  if (part.includes("-")) {
    const [s, e] = part.split("-").map(x => parseInt(x, 10));
    if (isNaN(s) || isNaN(e)) return [];
    const start = Math.min(s, e);
    const end = Math.max(s, e);
    for (let i = start; i <= end; i++) {
      if (i >= min && i <= max) {
        result.push(i);
      }
    }
    return result;
  }

  // Wildcard
  if (part === "*") {
    for (let i = min; i <= max; i++) {
      result.push(i);
    }
    return result;
  }

  // Single value
  const val = parseInt(part, 10);
  if (!isNaN(val) && val >= min && val <= max) {
    return [val];
  }

  return [];
}

// Prediction Loop (Next 5 runs)
function getNextExecutions(cronString: string, count = 5): Date[] {
  const parts = cronString.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const allowedMinutes = parseRange(parts[0], 0, 59);
  const allowedHours = parseRange(parts[1], 0, 23);
  const allowedDays = parseRange(parts[2], 1, 31);
  const allowedMonths = parseRange(parts[3], 1, 12); // 1-indexed

  // For weekdays, standard cron is 0-7 where 0 and 7 is Sunday.
  // We map standard JS getDay() (0 is Sunday, 1 is Monday... 6 is Saturday)
  let rawWeekdays = parseRange(parts[4], 0, 7);
  const allowedWeekdays = Array.from(
    new Set(rawWeekdays.map(d => (d === 7 ? 0 : d)))
  );

  if (
    allowedMinutes.length === 0 ||
    allowedHours.length === 0 ||
    allowedDays.length === 0 ||
    allowedMonths.length === 0 ||
    allowedWeekdays.length === 0
  ) {
    return [];
  }

  const results: Date[] = [];
  let current = new Date();
  // Reset seconds & milliseconds to align with minute increments
  current.setSeconds(0, 0);

  // Avoid infinite loops if matching condition is very far
  let iterations = 0;
  const maxIterations = 50000;

  while (results.length < count && iterations < maxIterations) {
    iterations++;
    
    // Increment first to check starting from the next minute onwards
    current.setMinutes(current.getMinutes() + 1);

    const m = current.getMinutes();
    const h = current.getHours();
    const d = current.getDate();
    const mo = current.getMonth() + 1; // JS month is 0-indexed
    const dw = current.getDay();

    // Skip month check optimization
    if (!allowedMonths.includes(mo)) {
      current.setMonth(current.getMonth() + 1);
      current.setDate(1);
      current.setHours(0, 0);
      continue;
    }

    // Skip day of month check
    if (!allowedDays.includes(d)) {
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0);
      continue;
    }

    // Skip weekday check
    if (!allowedWeekdays.includes(dw)) {
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0);
      continue;
    }

    // Skip hour check
    if (!allowedHours.includes(h)) {
      current.setHours(current.getHours() + 1, 0);
      continue;
    }

    // Skip minute check
    if (!allowedMinutes.includes(m)) {
      current.setMinutes(current.getMinutes() + 1);
      continue;
    }

    results.push(new Date(current));
  }

  return results;
}

// Translation Builder
function translateField(part: string, min: number, max: number, singleLabel: string, labelsMap?: string[]): string {
  if (part === "*") return `setiap ${singleLabel}`;

  if (part.includes(",")) {
    const list = part.split(",");
    const items = list.map(item => translateField(item, min, max, singleLabel, labelsMap));
    // Join with 'dan' or commas
    if (items.length === 2) return `${items[0]} dan ${items[1]}`;
    return items.slice(0, -1).join(", ") + ", dan " + items[items.length - 1];
  }

  if (part.includes("/")) {
    const [rangePart, stepPart] = part.split("/");
    const step = parseInt(stepPart, 10);
    if (rangePart === "*") {
      return `setiap ${step} ${singleLabel}`;
    }
    return `setiap ${step} ${singleLabel} mulai dari ${translateField(rangePart, min, max, singleLabel, labelsMap)}`;
  }

  if (part.includes("-")) {
    const [s, e] = part.split("-").map(x => parseInt(x, 10));
    if (labelsMap) {
      const startLabel = labelsMap[s] || String(s);
      const endLabel = labelsMap[e] || String(e);
      return `dari ${startLabel} sampai ${endLabel}`;
    }
    return `dari ${singleLabel} ${s} sampai ${e}`;
  }

  const val = parseInt(part, 10);
  if (!isNaN(val)) {
    if (labelsMap) {
      return labelsMap[val] || String(val);
    }
    return `pada ${singleLabel} ke-${val}`;
  }

  return part;
}

function translateCronToIndonesian(cronString: string): string {
  const parts = cronString.trim().split(/\s+/);
  if (parts.length !== 5) return "Ekspresi Cron tidak valid.";

  const minDesc = translateField(parts[0], 0, 59, "menit");
  const hourDesc = translateField(parts[1], 0, 23, "jam");
  const dayDesc = translateField(parts[2], 1, 31, "tanggal");
  const monthDesc = translateField(parts[3], 1, 12, "bulan", ["", ...MONTH_NAMES]);
  const weekdayDesc = translateField(parts[4], 0, 7, "hari", [...WEEKDAY_NAMES, "Minggu"]);

  // Format descriptors nicely
  let explanation = "Menjalankan tugas ";

  // Combine into a sentence
  if (parts[0] === "*" && parts[1] === "*") {
    explanation += "setiap menit ";
  } else if (parts[0] !== "*" && parts[1] === "*") {
    explanation += `${minDesc} setiap jam `;
  } else {
    // Both specific or hour specific
    const formatTime = (hStr: string, mStr: string) => {
      const hVal = parseInt(hStr, 10);
      const mVal = parseInt(mStr, 10);
      if (!isNaN(hVal) && !isNaN(mVal)) {
        return `pada pukul ${String(hVal).padStart(2, "0")}:${String(mVal).padStart(2, "0")}`;
      }
      return `${minDesc} pada ${hourDesc}`;
    };
    if (!parts[0].includes(",") && !parts[0].includes("/") && !parts[0].includes("-") &&
        !parts[1].includes(",") && !parts[1].includes("/") && !parts[1].includes("-")) {
      explanation += `${formatTime(parts[1], parts[0])} `;
    } else {
      explanation += `${minDesc} pada ${hourDesc} `;
    }
  }

  if (parts[2] !== "*") explanation += `pada ${dayDesc} `;
  if (parts[3] !== "*") explanation += `di ${monthDesc} `;
  if (parts[4] !== "*") explanation += `pada ${weekdayDesc} `;

  if (parts[2] === "*" && parts[3] === "*" && parts[4] === "*") {
    explanation += "setiap hari";
  }

  return explanation.trim() + ".";
}

export function CronBuilder() {
  const [cronInput, setCronInput] = useState("*/15 * * * *");
  const [activeTab, setActiveTab] = useState<"minute" | "hour" | "day" | "month" | "weekday">("minute");
  const [copied, setCopied] = useState(false);

  // Visual individual states mapped from cronInput
  const cronFields = useMemo(() => {
    const parts = cronInput.trim().split(/\s+/);
    return {
      minute: parts[0] || "*",
      hour: parts[1] || "*",
      dayOfMonth: parts[2] || "*",
      month: parts[3] || "*",
      dayOfWeek: parts[4] || "*"
    };
  }, [cronInput]);

  // Handle visual changes and rebuild string
  const updateField = (field: "minute" | "hour" | "dayOfMonth" | "month" | "dayOfWeek", value: string) => {
    const parts = cronInput.trim().split(/\s+/);
    // Pad array to size 5
    while (parts.length < 5) parts.push("*");
    
    const indexMap = {
      minute: 0,
      hour: 1,
      dayOfMonth: 2,
      month: 3,
      dayOfWeek: 4
    };

    parts[indexMap[field]] = value;
    setCronInput(parts.join(" "));
  };

  // Check validation state
  const validationResult = useMemo(() => {
    const parts = cronInput.trim().split(/\s+/);
    if (parts.length !== 5) {
      return { valid: false, error: "Ekspresi Cron harus berisi tepat 5 kolom dipisahkan spasi." };
    }
    
    const minTest = parseRange(parts[0], 0, 59);
    const hourTest = parseRange(parts[1], 0, 23);
    const dayTest = parseRange(parts[2], 1, 31);
    const monthTest = parseRange(parts[3], 1, 12);
    const weekdayTest = parseRange(parts[4], 0, 7);

    if (minTest.length === 0) return { valid: false, error: "Kolom Menit (kolom 1) tidak valid atau di luar rentang 0-59." };
    if (hourTest.length === 0) return { valid: false, error: "Kolom Jam (kolom 2) tidak valid atau di luar rentang 0-23." };
    if (dayTest.length === 0) return { valid: false, error: "Kolom Tanggal (kolom 3) tidak valid atau di luar rentang 1-31." };
    if (monthTest.length === 0) return { valid: false, error: "Kolom Bulan (kolom 4) tidak valid atau di luar rentang 1-12." };
    if (weekdayTest.length === 0) return { valid: false, error: "Kolom Hari kerja (kolom 5) tidak valid atau di luar rentang 0-7." };

    return { valid: true };
  }, [cronInput]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cronInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Next execution calculations
  const nextDates = useMemo(() => {
    if (!validationResult.valid) return [];
    return getNextExecutions(cronInput, 5);
  }, [cronInput, validationResult]);

  const indonesianTranslation = useMemo(() => {
    if (!validationResult.valid) return "";
    return translateCronToIndonesian(cronInput);
  }, [cronInput, validationResult]);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="border border-foreground/15 rounded-lg bg-card p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div>
          <h2 className="font-bold text-sm uppercase tracking-wide">💡 Panduan Cepat</h2>
          <p className="text-xs text-foreground/75 mt-1">
            Konfigurasikan jadwal tugas berkala (cron job) menggunakan visual tab di sebelah kiri, atau paste langsung ekspresi cron di input box untuk memvalidasi dan melihat jadwal eksekusi selanjutnya secara live.
          </p>
        </div>
      </div>

      {/* Preset List Bar */}
      <div className="border border-foreground/15 rounded-lg bg-background p-3 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-foreground/50 mr-2 select-none">Preset Populer:</span>
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setCronInput(p.value)}
            className="text-[10px] font-mono font-bold bg-card border border-foreground/10 hover:border-foreground/30 hover:bg-foreground/5 px-2.5 py-1.5 rounded transition-all cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Split Pane Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Pane (Visual Controls) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-foreground/15 rounded-lg bg-background overflow-hidden flex flex-col">
            
            {/* Visual Tabs Navigation */}
            <div className="flex border-b border-foreground/10 bg-card select-none">
              {(["minute", "hour", "day", "month", "weekday"] as const).map((tab) => {
                const labelMap = {
                  minute: "Menit",
                  hour: "Jam",
                  day: "Tanggal",
                  month: "Bulan",
                  weekday: "Hari"
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-r border-foreground/10 last:border-r-0 transition-colors cursor-pointer text-center ${
                      activeTab === tab ? "bg-background text-foreground border-b-2 border-b-primary" : "text-foreground/60 hover:bg-foreground/5"
                    }`}
                  >
                    {labelMap[tab]}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="p-4 min-h-[300px]">
              
              {/* Tab: Minutes */}
              {activeTab === "minute" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">Frekuensi Menit</span>
                    
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1.5">
                      <input
                        type="radio"
                        name="minute-opt"
                        checked={cronFields.minute === "*"}
                        onChange={() => updateField("minute", "*")}
                        className="w-4 h-4 accent-foreground"
                      />
                      Setiap menit (*)
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1.5">
                      <input
                        type="radio"
                        name="minute-opt"
                        checked={cronFields.minute.startsWith("*/")}
                        onChange={() => updateField("minute", "*/15")}
                        className="w-4 h-4 accent-foreground"
                      />
                      Setiap selang menit tertentu (*/n)
                    </label>

                    {cronFields.minute.startsWith("*/") && (
                      <div className="pl-6 flex items-center gap-2">
                        <span className="text-xs text-foreground/70">Jeda menit:</span>
                        <select
                          value={cronFields.minute.split("/")[1] || "15"}
                          onChange={(e) => updateField("minute", `*/${e.target.value}`)}
                          className="p-1 text-xs border border-foreground/15 rounded bg-background font-mono outline-none"
                        >
                          {[2, 5, 10, 15, 20, 30].map(v => (
                            <option key={v} value={v}>{v} menit</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1.5">
                      <input
                        type="radio"
                        name="minute-opt"
                        checked={!cronFields.minute.startsWith("*/") && cronFields.minute !== "*"}
                        onChange={() => updateField("minute", "0")}
                        className="w-4 h-4 accent-foreground"
                      />
                      Pada menit spesifik (contoh: menit ke-0, ke-30)
                    </label>

                    {!cronFields.minute.startsWith("*/") && cronFields.minute !== "*" && (
                      <div className="pl-6 space-y-2">
                        <span className="text-[10px] font-bold text-foreground/50 uppercase block">Pilih Menit:</span>
                        <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
                          {Array.from({ length: 60 }).map((_, mIdx) => {
                            const activeVal = cronFields.minute.split(",");
                            const isChecked = activeVal.includes(String(mIdx));
                            return (
                              <button
                                key={mIdx}
                                onClick={() => {
                                  let newList = isChecked
                                    ? activeVal.filter(x => x !== String(mIdx))
                                    : [...activeVal, String(mIdx)];
                                  // Clean list
                                  newList = newList.filter(x => x !== "");
                                  if (newList.length === 0) newList = ["0"];
                                  // Sort numeric
                                  newList.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
                                  updateField("minute", newList.join(","));
                                }}
                                className={`py-1 rounded font-mono text-xs border transition-colors cursor-pointer text-center ${
                                  isChecked ? "bg-foreground text-background border-foreground font-bold" : "border-foreground/15 hover:bg-foreground/5"
                                }`}
                              >
                                {mIdx}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Hours */}
              {activeTab === "hour" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">Frekuensi Jam</span>
                    
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1.5">
                      <input
                        type="radio"
                        name="hour-opt"
                        checked={cronFields.hour === "*"}
                        onChange={() => updateField("hour", "*")}
                        className="w-4 h-4 accent-foreground"
                      />
                      Setiap jam (*)
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1.5">
                      <input
                        type="radio"
                        name="hour-opt"
                        checked={cronFields.hour.startsWith("*/")}
                        onChange={() => updateField("hour", "*/2")}
                        className="w-4 h-4 accent-foreground"
                      />
                      Setiap selang jam tertentu (*/n)
                    </label>

                    {cronFields.hour.startsWith("*/") && (
                      <div className="pl-6 flex items-center gap-2">
                        <span className="text-xs text-foreground/70">Jeda jam:</span>
                        <select
                          value={cronFields.hour.split("/")[1] || "2"}
                          onChange={(e) => updateField("hour", `*/${e.target.value}`)}
                          className="p-1 text-xs border border-foreground/15 rounded bg-background font-mono outline-none"
                        >
                          {[2, 3, 4, 6, 8, 12].map(v => (
                            <option key={v} value={v}>{v} jam</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1.5">
                      <input
                        type="radio"
                        name="hour-opt"
                        checked={!cronFields.hour.startsWith("*/") && cronFields.hour !== "*"}
                        onChange={() => updateField("hour", "0")}
                        className="w-4 h-4 accent-foreground"
                      />
                      Pada jam spesifik (contoh: jam 09:00 pagi)
                    </label>

                    {!cronFields.hour.startsWith("*/") && cronFields.hour !== "*" && (
                      <div className="pl-6 space-y-2">
                        <span className="text-[10px] font-bold text-foreground/50 uppercase block">Pilih Jam:</span>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                          {Array.from({ length: 24 }).map((_, hIdx) => {
                            const activeVal = cronFields.hour.split(",");
                            const isChecked = activeVal.includes(String(hIdx));
                            return (
                              <button
                                key={hIdx}
                                onClick={() => {
                                  let newList = isChecked
                                    ? activeVal.filter(x => x !== String(hIdx))
                                    : [...activeVal, String(hIdx)];
                                  newList = newList.filter(x => x !== "");
                                  if (newList.length === 0) newList = ["0"];
                                  newList.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
                                  updateField("hour", newList.join(","));
                                }}
                                className={`py-1 rounded font-mono text-xs border transition-colors cursor-pointer text-center ${
                                  isChecked ? "bg-foreground text-background border-foreground font-bold" : "border-foreground/15 hover:bg-foreground/5"
                                }`}
                              >
                                {String(hIdx).padStart(2, "0")}:00
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Days */}
              {activeTab === "day" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">Hari / Tanggal Bulanan</span>
                    
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1.5">
                      <input
                        type="radio"
                        name="day-opt"
                        checked={cronFields.dayOfMonth === "*"}
                        onChange={() => updateField("dayOfMonth", "*")}
                        className="w-4 h-4 accent-foreground"
                      />
                      Setiap hari (*)
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1.5">
                      <input
                        type="radio"
                        name="day-opt"
                        checked={cronFields.dayOfMonth !== "*"}
                        onChange={() => updateField("dayOfMonth", "1")}
                        className="w-4 h-4 accent-foreground"
                      />
                      Pada tanggal tertentu (1-31)
                    </label>

                    {cronFields.dayOfMonth !== "*" && (
                      <div className="pl-6 space-y-2">
                        <span className="text-[10px] font-bold text-foreground/50 uppercase block">Pilih Tanggal:</span>
                        <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
                          {Array.from({ length: 31 }).map((_, dIdx) => {
                            const dateVal = dIdx + 1;
                            const activeVal = cronFields.dayOfMonth.split(",");
                            const isChecked = activeVal.includes(String(dateVal));
                            return (
                              <button
                                key={dateVal}
                                onClick={() => {
                                  let newList = isChecked
                                    ? activeVal.filter(x => x !== String(dateVal))
                                    : [...activeVal, String(dateVal)];
                                  newList = newList.filter(x => x !== "");
                                  if (newList.length === 0) newList = ["1"];
                                  newList.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
                                  updateField("dayOfMonth", newList.join(","));
                                }}
                                className={`py-1 rounded font-mono text-xs border transition-colors cursor-pointer text-center ${
                                  isChecked ? "bg-foreground text-background border-foreground font-bold" : "border-foreground/15 hover:bg-foreground/5"
                                }`}
                              >
                                {dateVal}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Months */}
              {activeTab === "month" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">Pilih Bulan Eksekusi</span>
                    
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1.5">
                      <input
                        type="radio"
                        name="month-opt"
                        checked={cronFields.month === "*"}
                        onChange={() => updateField("month", "*")}
                        className="w-4 h-4 accent-foreground"
                      />
                      Setiap bulan (*)
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1.5">
                      <input
                        type="radio"
                        name="month-opt"
                        checked={cronFields.month !== "*"}
                        onChange={() => updateField("month", "1")}
                        className="w-4 h-4 accent-foreground"
                      />
                      Hanya bulan-bulan tertentu
                    </label>

                    {cronFields.month !== "*" && (
                      <div className="pl-6 space-y-2">
                        <span className="text-[10px] font-bold text-foreground/50 uppercase block">Pilih Bulan:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {MONTH_NAMES.map((name, mIdx) => {
                            const monthVal = mIdx + 1;
                            const activeVal = cronFields.month.split(",");
                            const isChecked = activeVal.includes(String(monthVal));
                            return (
                              <button
                                key={monthVal}
                                onClick={() => {
                                  let newList = isChecked
                                    ? activeVal.filter(x => x !== String(monthVal))
                                    : [...activeVal, String(monthVal)];
                                  newList = newList.filter(x => x !== "");
                                  if (newList.length === 0) newList = ["1"];
                                  newList.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
                                  updateField("month", newList.join(","));
                                }}
                                className={`p-2 rounded text-left text-xs border transition-colors cursor-pointer flex justify-between items-center ${
                                  isChecked ? "bg-foreground text-background border-foreground font-bold" : "border-foreground/15 hover:bg-foreground/5"
                                }`}
                              >
                                <span>{name}</span>
                                <span className="font-mono text-[9px] opacity-50">#{monthVal}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Weekdays */}
              {activeTab === "weekday" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">Hari Dalam Seminggu</span>
                    
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1.5">
                      <input
                        type="radio"
                        name="weekday-opt"
                        checked={cronFields.dayOfWeek === "*"}
                        onChange={() => updateField("dayOfWeek", "*")}
                        className="w-4 h-4 accent-foreground"
                      />
                      Setiap hari seminggu (Senin - Minggu) (*)
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1.5">
                      <input
                        type="radio"
                        name="weekday-opt"
                        checked={cronFields.dayOfWeek !== "*"}
                        onChange={() => updateField("dayOfWeek", "1")}
                        className="w-4 h-4 accent-foreground"
                      />
                      Hanya pada hari kerja spesifik
                    </label>

                    {cronFields.dayOfWeek !== "*" && (
                      <div className="pl-6 space-y-2">
                        <span className="text-[10px] font-bold text-foreground/50 uppercase block">Pilih Hari:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {WEEKDAY_NAMES.map((name, dIdx) => {
                            const activeVal = cronFields.dayOfWeek.split(",");
                            const isChecked = activeVal.includes(String(dIdx));
                            return (
                              <button
                                key={dIdx}
                                onClick={() => {
                                  let newList = isChecked
                                    ? activeVal.filter(x => x !== String(dIdx))
                                    : [...activeVal, String(dIdx)];
                                  newList = newList.filter(x => x !== "");
                                  if (newList.length === 0) newList = ["0"];
                                  newList.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
                                  updateField("dayOfWeek", newList.join(","));
                                }}
                                className={`p-2 rounded text-left text-xs border transition-colors cursor-pointer flex justify-between items-center ${
                                  isChecked ? "bg-foreground text-background border-foreground font-bold" : "border-foreground/15 hover:bg-foreground/5"
                                }`}
                              >
                                <span>{name}</span>
                                <span className="font-mono text-[9px] opacity-50">#{dIdx}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right Pane (Output & Live Translation) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Section: Cron Input & Output String */}
          <div className="border border-foreground/15 rounded-lg bg-background p-4 space-y-3">
            <span className="font-bold text-xs uppercase tracking-wider block select-none">Hasil Ekspresi Cron</span>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={cronInput}
                onChange={(e) => setCronInput(e.target.value)}
                className="flex-1 font-mono text-sm p-3 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary text-center font-bold tracking-widest"
                placeholder="* * * * *"
                aria-label="Cron expression string"
              />
              
              <button
                onClick={copyToClipboard}
                disabled={!validationResult.valid}
                className="bg-foreground text-background px-4 rounded-lg font-bold hover:bg-foreground/90 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Salin ke clipboard"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>

            {/* Error state */}
            {!validationResult.valid && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-xs font-mono flex items-start gap-2 animate-shake">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block font-bold">Kesalahan Ekspresi:</strong>
                  {validationResult.error}
                </div>
              </div>
            )}
          </div>

          {/* Section: Translation Output */}
          {validationResult.valid && (
            <div className="border border-foreground/15 rounded-lg bg-background p-4 space-y-3">
              <span className="font-bold text-xs uppercase tracking-wider block text-foreground/50 select-none">Arti Deskripsi</span>
              
              <div className="bg-card p-3.5 border border-foreground/10 rounded-lg flex items-start gap-3">
                <Info size={16} className="text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/90 leading-relaxed font-mono">
                  {indonesianTranslation}
                </p>
              </div>
            </div>
          )}

          {/* Section: Next Runs (Forecaster) */}
          {validationResult.valid && (
            <div className="border border-foreground/15 rounded-lg bg-background p-4 space-y-3">
              <span className="font-bold text-xs uppercase tracking-wider block text-foreground/50 select-none">5 Eksekusi Selanjutnya</span>
              
              {nextDates.length === 0 ? (
                <p className="text-xs text-foreground/40 text-center py-4 font-mono">Tidak ada jadwal eksekusi yang cocok.</p>
              ) : (
                <div className="space-y-1.5">
                  {nextDates.map((date, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-foreground/5 bg-card text-xs font-mono select-none"
                    >
                      <Calendar size={14} className="text-foreground/45 shrink-0" />
                      <div className="flex-1 flex justify-between">
                        <span className="font-bold uppercase">
                          {WEEKDAY_NAMES[date.getDay()]}, {date.getDate()} {MONTH_NAMES[date.getMonth()]} {date.getFullYear()}
                        </span>
                        <span className="text-primary font-bold">
                          {String(date.getHours()).padStart(2, "0")}:{String(date.getMinutes()).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
