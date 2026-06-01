import { useState, useRef, useEffect } from "react";

type TestState = "idle" | "waiting" | "ready" | "clickedTooEarly" | "result";

export function ReactionTimeTest() {
  const [state, setState] = useState<TestState>("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startTest = () => {
    setState("waiting");
    setReactionTime(null);
    const randomDelay = 1500 + Math.random() * 2500; // 1.5s to 4s delay

    timeoutRef.current = window.setTimeout(() => {
      setState("ready");
      startTimeRef.current = Date.now();
    }, randomDelay);
  };

  const handleAreaClick = () => {
    if (state === "waiting") {
      // Clicked too early
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setState("clickedTooEarly");
    } else if (state === "ready") {
      const duration = Date.now() - startTimeRef.current;
      setReactionTime(duration);
      setHistory((prev) => [...prev, duration]);
      setState("result");
    }
  };

  const getAverage = () => {
    if (history.length === 0) return 0;
    const sum = history.reduce((a, b) => a + b, 0);
    return Math.round(sum / history.length);
  };

  const getRank = (ms: number) => {
    if (ms < 180) return "🚀 Reflek Kilat (Dewa)";
    if (ms < 250) return "⚡ Cepat (Di atas rata-rata)";
    if (ms < 350) return "🟢 Normal / Rata-rata";
    return "🐢 Lambat (Butuh Latihan)";
  };

  const resetAll = () => {
    setState("idle");
    setReactionTime(null);
    setHistory([]);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
            Reaction Time Speed Test
          </h3>
          {history.length > 0 && (
            <button onClick={resetAll} className="text-[10px] font-bold text-destructive hover:underline">
              Reset Riwayat
            </button>
          )}
        </div>

        {/* Reaction Test Area */}
        <div
          onClick={state === "idle" || state === "result" || state === "clickedTooEarly" ? startTest : handleAreaClick}
          className={`w-full aspect-[16/9] md:aspect-[16/7] rounded-xl flex flex-col items-center justify-center text-center cursor-pointer select-none transition-colors border shadow-inner p-6 ${
            state === "idle"
              ? "bg-background border-foreground/10 hover:border-foreground/30"
              : state === "waiting"
              ? "bg-destructive/95 border-destructive text-white"
              : state === "ready"
              ? "bg-green-500 border-green-600 text-white"
              : state === "clickedTooEarly"
              ? "bg-yellow-500 border-yellow-600 text-black"
              : "bg-background border-foreground/20"
          }`}
        >
          {state === "idle" && (
            <div className="space-y-2 pointer-events-none">
              <span className="text-4xl block">🔴</span>
              <h4 className="text-lg font-bold">Mulai Tes Reaksi</h4>
              <p className="text-xs opacity-60">Klik area ini untuk mulai. Tunggu warna berubah jadi HIJAU lalu klik secepatnya.</p>
            </div>
          )}

          {state === "waiting" && (
            <div className="space-y-1 pointer-events-none">
              <h4 className="text-xl font-black uppercase tracking-wider">Tunggu warna hijau...</h4>
              <p className="text-xs opacity-75">Jangan klik dahulu!</p>
            </div>
          )}

          {state === "ready" && (
            <div className="space-y-1 pointer-events-none animate-scaleIn">
              <h4 className="text-3xl font-black uppercase tracking-wider">KLIK SEKARANG!!!</h4>
              <p className="text-xs opacity-90">Tekan secepat mungkin!</p>
            </div>
          )}

          {state === "clickedTooEarly" && (
            <div className="space-y-2 pointer-events-none">
              <span className="text-4xl block">⚠️</span>
              <h4 className="text-lg font-bold">Terlalu Cepat!</h4>
              <p className="text-xs opacity-80">Anda mengklik sebelum warna berubah jadi hijau.</p>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/10 px-3 py-1 rounded">Klik untuk coba lagi</span>
            </div>
          )}

          {state === "result" && reactionTime !== null && (
            <div className="space-y-2 pointer-events-none">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">Waktu Reaksi Anda</span>
              <h4 className="text-4xl font-extrabold font-mono">{reactionTime} ms</h4>
              <p className="text-xs font-bold text-primary">{getRank(reactionTime)}</p>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-foreground text-background px-3 py-1.5 rounded inline-block mt-4">
                Klik untuk Tes Lagi
              </span>
            </div>
          )}
        </div>

        {/* History Stats */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-foreground/5">
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/50">
                Rata-Rata Percobaan ({history.length}x)
              </h4>
              <div className="bg-background border border-foreground/10 p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-foreground/80">Rata-Rata:</span>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-primary">{getAverage()} ms</span>
                  <span className="text-[9px] font-bold font-mono block text-primary/60 uppercase">
                    {getRank(getAverage())}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/50">
                Riwayat Klik
              </h4>
              <div className="flex gap-2 flex-wrap max-h-16 overflow-y-auto">
                {history.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono font-bold bg-background border border-foreground/10 px-2.5 py-1 rounded-md"
                  >
                    #{idx + 1}: <strong className="text-primary">{t}ms</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
