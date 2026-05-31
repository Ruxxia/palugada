import { useState, useEffect, useRef } from "react";

export function CountdownTimer() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [totalDuration, setTotalDuration] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timeLeft <= 0) {
      const totalSec = hours * 3600 + minutes * 60 + seconds;
      if (totalSec <= 0) return;
      setTimeLeft(totalSec);
      setTotalDuration(totalSec);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setTotalDuration(0);
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play a simple beep sound using Web Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 1);
      } catch (e) {
        // Fallback or permission block
      }
      alert("Timer Selesai!");
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const formatDisplay = () => {
    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const percent = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;

  return (
    <div className="space-y-6">
      {totalDuration === 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Jam</label>
              <input
                type="number"
                min={0}
                max={23}
                value={hours}
                onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono text-center text-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Menit</label>
              <input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono text-center text-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Detik</label>
              <input
                type="number"
                min={0}
                max={59}
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono text-center text-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <button
            onClick={startTimer}
            className="w-full bg-foreground text-background py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
          >
            Mulai Timer
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 py-6 bg-foreground/5 rounded-2xl border border-foreground/10">
          <div className="text-5xl font-mono font-bold tracking-widest">{formatDisplay()}</div>

          {/* Progress bar */}
          <div className="w-4/5 bg-foreground/10 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-1000 ease-linear"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex gap-3">
            {isRunning ? (
              <button
                onClick={pauseTimer}
                className="bg-foreground text-background px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="bg-foreground text-background px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
              >
                Lanjutkan
              </button>
            )}
            <button
              onClick={resetTimer}
              className="bg-card border-2 border-foreground px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
