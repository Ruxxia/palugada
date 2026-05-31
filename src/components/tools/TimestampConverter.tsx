import { useState, useEffect } from "react";

export function TimestampConverter() {
  // Current Time State
  const [now, setNow] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  // Timestamp to Date State
  const [timestampInput, setTimestampInput] = useState(Math.floor(Date.now() / 1000).toString());
  const [tsResult, setTsResult] = useState<{
    local: string;
    utc: string;
    iso: string;
    relative: string;
  } | null>(null);

  // Date to Timestamp State
  const [dateInput, setDateInput] = useState(new Date().toISOString().substring(0, 16)); // YYYY-MM-DDTHH:mm
  const [dtResult, setDtResult] = useState<{
    seconds: number;
    milliseconds: number;
  } | null>(null);

  // Live clock effect
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isLive]);

  // Convert Timestamp -> Date effect
  useEffect(() => {
    const val = timestampInput.trim();
    if (!val || isNaN(Number(val))) {
      setTsResult(null);
      return;
    }

    const num = Number(val);
    // Auto detect if it's seconds or milliseconds
    const isMs = val.length > 11;
    const date = new Date(isMs ? num : num * 1000);

    if (isNaN(date.getTime())) {
      setTsResult(null);
      return;
    }

    // Relative time helper
    const diffMs = date.getTime() - Date.now();
    const diffSec = Math.floor(diffMs / 1000);
    let relativeStr = "";
    if (Math.abs(diffSec) < 5) {
      relativeStr = "Baru saja";
    } else {
      const rtf = new Intl.RelativeTimeFormat("id", { numeric: "auto" });
      if (Math.abs(diffSec) < 60) {
        relativeStr = rtf.format(diffSec, "second");
      } else if (Math.abs(diffSec) < 3600) {
        relativeStr = rtf.format(Math.floor(diffSec / 60), "minute");
      } else if (Math.abs(diffSec) < 86400) {
        relativeStr = rtf.format(Math.floor(diffSec / 3600), "hour");
      } else {
        relativeStr = rtf.format(Math.floor(diffSec / 86400), "day");
      }
    }

    setTsResult({
      local: date.toString(),
      utc: date.toUTCString(),
      iso: date.toISOString(),
      relative: relativeStr,
    });
  }, [timestampInput]);

  // Convert Date -> Timestamp effect
  useEffect(() => {
    if (!dateInput) {
      setDtResult(null);
      return;
    }
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      setDtResult(null);
      return;
    }
    const ms = date.getTime();
    setDtResult({
      seconds: Math.floor(ms / 1000),
      milliseconds: ms,
    });
  }, [dateInput]);

  return (
    <div className="space-y-8">
      {/* Live widget */}
      <div className="p-4 border-2 border-foreground rounded-xl bg-primary/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-foreground/50 block">Current Unix Timestamp</span>
          <span className="font-mono text-3xl font-bold text-primary">{Math.floor(now.getTime() / 1000)}</span>
          <span className="text-xs text-foreground/50 ml-2">(seconds)</span>
        </div>
        <div className="text-right md:text-right flex flex-col items-center md:items-end">
          <span className="font-mono text-xs uppercase tracking-wider text-foreground/50">Waktu Lokal Sekarang</span>
          <span className="text-sm font-semibold">{now.toLocaleString("id-ID")}</span>
          <button
            onClick={() => setIsLive(!isLive)}
            className="mt-1 text-xs font-mono uppercase text-primary hover:underline"
          >
            {isLive ? "⏸ Pause" : "▶ Resume"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Timestamp -> Date */}
        <div className="space-y-4">
          <h3 className="font-display text-xl uppercase tracking-tight">Convert Timestamp ke Tanggal</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/50 block mb-1">
                Unix Timestamp
              </label>
              <input
                type="text"
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                className="w-full font-mono text-sm p-3 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary"
                placeholder="1782839200"
              />
              <span className="text-[10px] text-foreground/40 mt-1 block">Auto-detect detik (10 digit) & milidetik (13 digit).</span>
            </div>

            {tsResult && (
              <div className="space-y-3 bg-foreground/5 p-4 rounded-xl text-xs font-mono">
                <div>
                  <span className="opacity-50 block uppercase text-[9px] tracking-wider">Waktu Lokal:</span>
                  <span className="font-bold text-sm text-foreground">{tsResult.local}</span>
                </div>
                <div>
                  <span className="opacity-50 block uppercase text-[9px] tracking-wider">Waktu UTC / GMT:</span>
                  <span className="font-bold text-foreground">{tsResult.utc}</span>
                </div>
                <div>
                  <span className="opacity-50 block uppercase text-[9px] tracking-wider">Format ISO 8601:</span>
                  <span className="font-bold text-foreground">{tsResult.iso}</span>
                </div>
                <div>
                  <span className="opacity-50 block uppercase text-[9px] tracking-wider">Relatif:</span>
                  <span className="font-bold text-primary">{tsResult.relative}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date -> Timestamp */}
        <div className="space-y-4">
          <h3 className="font-display text-xl uppercase tracking-tight">Convert Tanggal ke Timestamp</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/50 block mb-1">
                Pilih Tanggal & Waktu
              </label>
              <input
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full font-mono text-sm p-3 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary"
              />
            </div>

            {dtResult && (
              <div className="space-y-3 bg-foreground/5 p-4 rounded-xl text-xs font-mono">
                <div className="flex justify-between items-center border-b border-foreground/10 pb-2">
                  <div>
                    <span className="opacity-50 block uppercase text-[9px] tracking-wider">Detik (seconds):</span>
                    <span className="font-bold text-sm text-primary">{dtResult.seconds}</span>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(dtResult.seconds.toString())}
                    className="text-[9px] uppercase tracking-wider bg-foreground text-background px-2 py-0.5 rounded"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div>
                    <span className="opacity-50 block uppercase text-[9px] tracking-wider">Milidetik (ms):</span>
                    <span className="font-bold text-foreground">{dtResult.milliseconds}</span>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(dtResult.milliseconds.toString())}
                    className="text-[9px] uppercase tracking-wider bg-foreground text-background px-2 py-0.5 rounded"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
