import { useState, useRef, useEffect } from "react";

interface Target {
  x: number; // percentage
  y: number; // percentage
  size: number; // size in px
}

export function AimTrainer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [targetsHit, setTargetsHit] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [target, setTarget] = useState<Target | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [historyHitTimes, setHistoryHitTimes] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const targetStartTimeRef = useRef<number>(0);

  const spawnTarget = () => {
    // Generate position between 5% and 90% to avoid target overflowing container edge
    const x = 5 + Math.random() * 85;
    const y = 5 + Math.random() * 85;
    const size = Math.max(30, 60 - targetsHit * 0.8); // targets shrink slightly as they hit more!
    setTarget({ x, y, size });
    targetStartTimeRef.current = Date.now();
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsFinished(false);
    setTargetsHit(0);
    setTotalClicks(0);
    setHistoryHitTimes([]);
    setStartTime(Date.now());
    spawnTarget();
  };

  const handleContainerClick = () => {
    if (!isPlaying || isFinished) return;
    setTotalClicks((prev) => prev + 1);
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering container click double count
    if (!isPlaying || isFinished) return;

    const hitTime = Date.now() - targetStartTimeRef.current;
    setHistoryHitTimes((prev) => [...prev, hitTime]);

    const newHitCount = targetsHit + 1;
    setTargetsHit(newHitCount);
    setTotalClicks((prev) => prev + 1);

    if (newHitCount >= 30) {
      // Game finishes after hitting 30 targets
      setIsFinished(true);
      setIsPlaying(false);
      setTarget(null);
    } else {
      spawnTarget();
    }
  };

  const getAccuracy = () => {
    if (totalClicks === 0) return 100;
    return Math.round((targetsHit / totalClicks) * 100);
  };

  const getAverageTime = () => {
    if (historyHitTimes.length === 0) return 0;
    const sum = historyHitTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / historyHitTimes.length);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setIsFinished(false);
    setTarget(null);
    setTargetsHit(0);
    setTotalClicks(0);
    setHistoryHitTimes([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-background border border-foreground/10 p-3 rounded-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/40 block">Target Hancur</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-primary">{targetsHit}/30</span>
          </div>
          <div className="bg-background border border-foreground/10 p-3 rounded-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/40 block">Akurasi</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-primary">{getAccuracy()}%</span>
          </div>
          <div className="bg-background border border-foreground/10 p-3 rounded-lg">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/40 block">Rata-Rata Respon</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-primary">{getAverageTime()} ms</span>
          </div>
        </div>

        {/* Play/Reflex Area */}
        <div
          ref={containerRef}
          onClick={handleContainerClick}
          className={`relative w-full aspect-[16/9] md:aspect-[16/7] rounded-xl bg-background border border-foreground/15 hover:border-foreground/35 select-none overflow-hidden transition-colors shadow-inner ${
            isPlaying ? "cursor-crosshair" : "cursor-default"
          }`}
        >
          {!isPlaying && !isFinished && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-3 p-4">
              <span className="text-4xl block">🎯</span>
              <h4 className="text-lg font-bold">Latihan Bidik (Aim Trainer)</h4>
              <p className="text-xs opacity-60 max-w-sm">Hancurkan 30 target lingkaran merah secepat mungkin. Klik seakurat mungkin.</p>
              <button
                onClick={startGame}
                className="h-10 px-6 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
              >
                Mulai Latihan
              </button>
            </div>
          )}

          {isPlaying && target && (
            <div
              onClick={handleTargetClick}
              className="absolute bg-destructive rounded-full border border-white/20 shadow-[0_0_12px_rgba(239,68,68,0.5)] transform -translate-x-1/2 -translate-y-1/2 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                width: `${target.size}px`,
                height: `${target.size}px`,
              }}
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          )}

          {isFinished && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-3 p-4 animate-scaleIn">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-green-500 block">Latihan Selesai!</span>
              <h4 className="text-2xl font-extrabold font-mono">Kecepatan Rata-Rata: {getAverageTime()} ms</h4>
              <p className="text-xs opacity-75">Akurasi tembakan Anda: <strong>{getAccuracy()}%</strong></p>
              <div className="flex gap-2">
                <button
                  onClick={startGame}
                  className="h-10 px-6 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
                >
                  Ulangi
                </button>
                <button
                  onClick={resetGame}
                  className="h-10 px-6 border border-foreground/10 hover:bg-foreground/5 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
