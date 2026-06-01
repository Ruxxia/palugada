import { useState, useEffect, useRef } from "react";

export function CpsTest() {
  const [testDuration, setTestDuration] = useState<5 | 10 | 15>(5);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [cps, setCps] = useState(0);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startTest = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsRunning(true);
    setIsFinished(false);
    setClicks(1);
    setTimeLeft(testDuration);
    startTimeRef.current = Date.now();

    // Trigger initial ripple
    addRipple(e);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsRunning(false);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const addRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now() + Math.random(), x, y };
    setRipples((prev) => [...prev, newRipple].slice(-15)); // keep last 15
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFinished) return;

    if (!isRunning) {
      startTest(e);
      return;
    }

    setClicks((prev) => prev + 1);
    addRipple(e);
  };

  // Calculate live CPS
  useEffect(() => {
    if (isRunning && clicks > 0) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      if (elapsed > 0) {
        setCps(parseFloat((clicks / elapsed).toFixed(2)));
      }
    }
  }, [clicks, isRunning]);

  // Final CPS calculation at the end
  useEffect(() => {
    if (isFinished) {
      setCps(parseFloat((clicks / testDuration).toFixed(2)));
    }
  }, [isFinished, clicks, testDuration]);

  const resetTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setIsFinished(false);
    setClicks(0);
    setTimeLeft(testDuration);
    setCps(0);
    setRipples([]);
  };

  useEffect(() => {
    setTimeLeft(testDuration);
  }, [testDuration]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const getRank = (cpsVal: number) => {
    if (cpsVal >= 11) return "🐆 Cheetah (Dewa Clicker)";
    if (cpsVal >= 8) return "🐇 Kelinci (Sangat Cepat)";
    if (cpsVal >= 5) return "🐈 Kucing (Normal/Rata-rata)";
    return "🐢 Kura-Kura (Lambat)";
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-background border border-foreground/10 p-3 rounded-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/40 block">Waktu</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-primary">{timeLeft}s</span>
          </div>
          <div className="bg-background border border-foreground/10 p-3 rounded-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/40 block">Total Klik</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-primary">{clicks}</span>
          </div>
          <div className="bg-background border border-foreground/10 p-3 rounded-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/40 block">CPS (Clicks/Sec)</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-primary">{cps}</span>
          </div>
        </div>

        {/* Configuration */}
        {!isRunning && (
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
              Pilih Durasi Tes
            </label>
            <div className="flex gap-2">
              {([5, 10, 15] as const).map((duration) => (
                <button
                  key={duration}
                  disabled={isRunning}
                  onClick={() => setTestDuration(duration)}
                  className={`h-9 px-4 text-xs font-bold rounded-lg transition-colors ${
                    testDuration === duration
                      ? "bg-primary text-white"
                      : "border border-foreground/10 hover:bg-foreground/5"
                  }`}
                >
                  {duration} Detik
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Click Area */}
        <div
          onClick={handleClick}
          className="relative w-full aspect-[16/9] md:aspect-[16/7] rounded-xl bg-background border border-foreground/15 hover:border-foreground/35 cursor-pointer flex flex-col items-center justify-center select-none overflow-hidden transition-colors shadow-inner"
        >
          {/* Ripples animations */}
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute w-12 h-12 bg-primary/20 rounded-full animate-ping pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: ripple.x, top: ripple.y }}
            />
          ))}

          {!isRunning && !isFinished && (
            <div className="text-center space-y-2 pointer-events-none">
              <span className="text-4xl block">🖱️</span>
              <h4 className="text-lg font-bold">Mulai Klik Di Sini</h4>
              <p className="text-xs opacity-60">Klik secepat mungkin untuk memulai hitungan mundur.</p>
            </div>
          )}

          {isRunning && (
            <div className="text-center space-y-1 pointer-events-none">
              <h4 className="text-3xl font-black uppercase tracking-wider text-primary animate-pulse">KLIK TERUS!</h4>
              <p className="text-xs opacity-60">Klik sebanyak mungkin!</p>
            </div>
          )}

          {isFinished && (
            <div className="text-center space-y-2 pointer-events-none animate-scaleIn">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-green-500 block">Tes Selesai!</span>
              <h4 className="text-4xl font-extrabold font-mono">{cps} CPS</h4>
              <p className="text-xs font-bold text-primary">{getRank(cps)}</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={resetTest}
          className="w-full h-11 border border-foreground/10 hover:bg-foreground/5 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
        >
          🔄 Ulangi Tes / Reset
        </button>
      </div>
    </div>
  );
}
