import { useState, useEffect, useRef } from "react";

export function Stopwatch() {
  const [time, setTime] = useState(0); // time in milliseconds
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const startStop = () => {
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const lap = () => {
    setLaps((prev) => [time, ...prev]);
  };

  const formatTime = (timeMs: number) => {
    const min = Math.floor(timeMs / 60000);
    const sec = Math.floor((timeMs % 60000) / 1000);
    const ms = Math.floor((timeMs % 1000) / 10);
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center gap-6 py-8 bg-foreground/5 rounded-2xl border border-foreground/10">
        <div className="text-5xl font-mono font-bold tracking-widest">{formatTime(time)}</div>

        <div className="flex gap-3">
          <button
            onClick={startStop}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors ${
              isRunning
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-foreground text-background hover:bg-foreground/90"
            }`}
          >
            {isRunning ? "Stop" : "Start"}
          </button>
          {isRunning && (
            <button
              onClick={lap}
              className="bg-card border-2 border-foreground px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider"
            >
              Lap
            </button>
          )}
          {!isRunning && time > 0 && (
            <button
              onClick={reset}
              className="bg-card border-2 border-foreground px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {laps.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Laps</h3>
          <div className="bg-background border border-foreground/15 rounded-lg p-4 font-mono text-sm space-y-1 max-h-60 overflow-auto">
            {laps.map((lapTime, i) => {
              const currentLapIndex = laps.length - i;
              const prevLapTime = i === laps.length - 1 ? 0 : laps[i + 1];
              const diff = lapTime - prevLapTime;
              return (
                <div key={i} className="flex justify-between items-center py-1 border-b border-foreground/5">
                  <span className="text-foreground/50">Lap {currentLapIndex}</span>
                  <span>{formatTime(lapTime)} <span className="text-xs text-foreground/40 ml-2">(+{formatTime(diff)})</span></span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
