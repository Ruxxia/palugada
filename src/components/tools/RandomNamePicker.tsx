import { useState, useRef, useEffect } from "react";

export function RandomNamePicker() {
  const [namesText, setNamesText] = useState("Andi\nBudi\nCici\nDedi\nEvi\nFani\nGita\nHari");
  const [numWinners, setNumWinners] = useState(1);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [winners, setWinners] = useState<string[]>([]);
  const [isPicking, setIsPicking] = useState(false);
  const [currentNameHighlight, setCurrentNameHighlight] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [confettiActive, setConfettiActive] = useState(false);

  // Play synthetic sound using Web Audio API
  const playBeep = (freq = 440, duration = 0.08) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Web Audio API not supported or blocked");
    }
  };

  // Canvas confetti animation
  useEffect(() => {
    if (!confettiActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 400;

    const colors = ["#f43f5e", "#3b82f6", "#10b981", "#eab308", "#a855f7", "#ff7849"];
    const particles = Array.from({ length: 80 }).map(() => ({
      x: canvas.width / 2,
      y: canvas.height / 2 - 20,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.7) * 12 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        if (p.opacity <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.vx *= 0.98; // air resistance
        p.rotation += p.rSpeed;
        p.opacity -= 0.015;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (alive) {
        animationId = requestAnimationFrame(render);
      } else {
        setConfettiActive(false);
      }
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [confettiActive]);

  const handlePick = () => {
    const list = namesText
      .split(/[\n,]+/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (list.length === 0) {
      alert("Masukkan minimal 1 nama di dalam kolom daftar nama.");
      return;
    }

    setWinners([]);
    setIsPicking(true);
    setConfettiActive(false);

    // Dynamic tick delay algorithm for slot machine effect
    let count = 0;
    const totalTicks = 24;
    let delay = 50;

    const tick = () => {
      count++;
      const randomIdx = Math.floor(Math.random() * list.length);
      setCurrentNameHighlight(list[randomIdx]);
      playBeep(300 + count * 20, 0.05);

      if (count < totalTicks) {
        // Slow down tick speed towards the end
        if (count > totalTicks - 6) {
          delay += 60;
        } else if (count > totalTicks - 12) {
          delay += 25;
        }
        setTimeout(tick, delay);
      } else {
        // Finish picking
        const pickedWinners: string[] = [];
        const pool = [...list];

        const actualWinnersNum = Math.min(numWinners, allowDuplicates ? numWinners : pool.length);

        for (let i = 0; i < actualWinnersNum; i++) {
          const idx = Math.floor(Math.random() * pool.length);
          if (allowDuplicates) {
            pickedWinners.push(pool[idx]);
          } else {
            pickedWinners.push(pool.splice(idx, 1)[0]);
          }
        }

        setWinners(pickedWinners);
        setIsPicking(false);
        playBeep(880, 0.25);
        setTimeout(() => playBeep(1100, 0.3), 120);
        setConfettiActive(true);
      }
    };

    setTimeout(tick, delay);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inputs Section */}
          <div className="space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-foreground/5 pb-2">
              Daftar Nama
            </h3>
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                Masukkan Nama (satu per baris / pisahkan koma)
              </label>
              <textarea
                value={namesText}
                onChange={(e) => setNamesText(e.target.value)}
                rows={8}
                placeholder="Andi&#10;Budi&#10;Cici"
                className="w-full p-4 border border-foreground/10 rounded-lg text-sm bg-background font-mono focus:outline-none focus:border-primary resize-y"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                  Jumlah Pemenang
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={numWinners}
                  onChange={(e) => setNumWinners(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full h-10 px-3 border border-foreground/10 rounded-lg text-sm bg-background focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div className="space-y-2 flex flex-col justify-end pb-1.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold font-mono text-foreground/75">
                  <input
                    type="checkbox"
                    checked={allowDuplicates}
                    onChange={(e) => setAllowDuplicates(e.target.checked)}
                    className="w-4 h-4 rounded border-foreground/20 text-primary focus:ring-primary"
                  />
                  Boleh Duplikat?
                </label>
              </div>
            </div>

            <button
              onClick={handlePick}
              disabled={isPicking}
              className="w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPicking ? "Mengundi..." : "🎰 Mulai Undi Nama"}
            </button>
          </div>

          {/* Results/Animation Section */}
          <div className="flex flex-col items-center justify-center p-6 bg-background rounded-xl border border-foreground/10 relative overflow-hidden min-h-[300px]">
            {confettiActive && <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full z-10" />}

            {isPicking && (
              <div className="text-center space-y-4 animate-pulse">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">Mengacak Nama...</span>
                <div className="text-3xl md:text-4xl font-extrabold uppercase border-y-2 border-foreground/20 py-4 px-8 font-mono bg-card tracking-wide max-w-[300px] truncate shadow">
                  {currentNameHighlight}
                </div>
              </div>
            )}

            {!isPicking && winners.length > 0 && (
              <div className="text-center space-y-6 z-20">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-green-500 block">
                  🎉 Selamat Kepada Pemenang!
                </span>
                <div className="flex flex-col gap-2.5 items-center max-h-[220px] overflow-y-auto px-4">
                  {winners.map((winner, idx) => (
                    <div
                      key={idx}
                      className="text-lg md:text-xl font-bold uppercase py-2.5 px-6 border-2 border-foreground rounded-lg bg-card shadow-[3px_3px_0px_rgba(0,0,0,0.15)] flex items-center gap-3 animate-scaleIn"
                    >
                      <span className="text-xs bg-primary text-white font-mono rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-mono">{winner}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isPicking && winners.length === 0 && (
              <div className="text-center text-foreground/40 space-y-2 max-w-[250px]">
                <span className="text-4xl block">🎲</span>
                <p className="text-xs font-bold uppercase tracking-wider font-mono">Daftar Undian Kosong</p>
                <p className="text-[11px] leading-relaxed">Masukkan daftar nama lalu klik tombol undi untuk memilih pemenang secara acak.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
