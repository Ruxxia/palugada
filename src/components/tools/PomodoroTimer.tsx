import { useState, useEffect, useRef } from "react";

type TimerMode = "work" | "shortBreak" | "longBreak";

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  // Custom configurations (in minutes)
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  const timerRef = useRef<number | null>(null);

  // Play synthetic alarm sound using Web Audio API
  const playAlarm = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Play double chime
      playTone(587.33, 0, 0.4); // D5
      playTone(880, 0.2, 0.5); // A5
    } catch (e) {
      console.warn("Web Audio API not supported or blocked");
    }
  };

  const getDurationByMode = (m: TimerMode) => {
    if (m === "work") return workDuration * 60;
    if (m === "shortBreak") return shortBreakDuration * 60;
    return longBreakDuration * 60;
  };

  useEffect(() => {
    setTimeLeft(getDurationByMode(mode));
    setIsRunning(false);
  }, [mode, workDuration, shortBreakDuration, longBreakDuration]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playAlarm();
            alert(
              mode === "work"
                ? "Sesi fokus selesai! Waktunya istirahat sejenak."
                : "Waktu istirahat selesai! Mari kembali fokus bekerja."
            );
            // Auto switch modes
            if (mode === "work") {
              setMode("shortBreak");
            } else {
              setMode("work");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDurationByMode(mode));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Circular progress calculations
  const totalDuration = getDurationByMode(mode);
  const progress = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left panel: Visual Timer ring */}
          <div className="flex flex-col items-center justify-center p-4 bg-background border border-foreground/5 rounded-lg shadow-inner relative aspect-square max-w-[280px] mx-auto w-full">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Outer circle bg */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-foreground/10"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Active progress ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-primary transition-all duration-300"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
              <span className="text-4xl font-extrabold font-mono tracking-tight text-foreground select-none">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary select-none">
                {mode === "work" ? "💻 Fokus Kerja" : "☕ Istirahat"}
              </span>
            </div>
          </div>

          {/* Right panel: Controls and customizations */}
          <div className="space-y-6">
            {/* Mode selection tabs */}
            <div className="flex bg-background border border-foreground/10 rounded-lg p-1">
              {(
                [
                  { key: "work", label: "Kerja" },
                  { key: "shortBreak", label: "Break Pendek" },
                  { key: "longBreak", label: "Break Panjang" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setMode(tab.key)}
                  className={`flex-1 py-1.5 text-xs font-bold font-mono rounded-md transition-colors ${
                    mode === tab.key
                      ? "bg-primary text-white"
                      : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Timer Actions */}
            <div className="flex gap-3">
              <button
                onClick={toggleTimer}
                className="flex-1 h-12 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
              >
                {isRunning ? "⏸️ Pause" : "▶️ Start"}
              </button>
              <button
                onClick={resetTimer}
                className="h-12 px-5 border border-foreground/10 hover:bg-foreground/5 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                🔄 Reset
              </button>
            </div>

            {/* Custom durations inputs */}
            <div className="space-y-4 pt-4 border-t border-foreground/5">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-foreground/40">
                Kustomisasi Durasi (Menit)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-foreground/50 block">Kerja</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={workDuration}
                    onChange={(e) => setWorkDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full h-9 px-2 border border-foreground/10 rounded text-xs bg-background text-center font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-foreground/50 block">Break Pendek</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={shortBreakDuration}
                    onChange={(e) => setShortBreakDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full h-9 px-2 border border-foreground/10 rounded text-xs bg-background text-center font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-foreground/50 block">Break Panjang</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={longBreakDuration}
                    onChange={(e) => setLongBreakDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full h-9 px-2 border border-foreground/10 rounded text-xs bg-background text-center font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
