import { useState, useRef, useEffect } from "react";

export function SpinWheel() {
  const [optionsText, setOptionsText] = useState("Pizza\nBurger\nSushi\nRamen\nNasi Goreng\nSate");
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const [confettiActive, setConfettiActive] = useState(false);

  // Rotation states
  const startAngleRef = useRef(0);
  const baseAngleRef = useRef(0);
  const spinAngleStartRef = useRef(0);
  const spinTimeRef = useRef(0);
  const spinTimeTotalRef = useRef(0);
  const spinStartTimestampRef = useRef<number>(0);

  const getOptions = () => {
    return optionsText
      .split(/[\n,]+/)
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);
  };

  // Play synthetic tick sound using Web Audio API
  const playTick = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch (e) {
      // Ignore
    }
  };

  // Draw the spin wheel
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const options = getOptions();
    if (options.length === 0) return;

    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    const radius = Math.min(width, height) / 2 - 15;

    ctx.clearRect(0, 0, width, height);

    const arc = Math.PI / (options.length / 2);
    let currentAngle = startAngleRef.current;

    // Palette colors
    const colors = [
      "#f43f5e", "#3b82f6", "#10b981", "#eab308",
      "#a855f7", "#f97316", "#06b6d4", "#ec4899"
    ];

    options.forEach((opt, idx) => {
      const angle = currentAngle + idx * arc;
      ctx.fillStyle = colors[idx % colors.length];

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc, false);
      ctx.lineTo(center, center);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "right";
      
      const textX = radius - 15;
      // Truncate text if too long
      const displayOpt = opt.length > 12 ? opt.substring(0, 10) + "..." : opt;
      ctx.fillText(displayOpt, textX, 5);
      ctx.restore();
    });

    // Draw pointer arrow (triangle at the top center pointing down)
    ctx.fillStyle = "#000000";
    if (document.documentElement.classList.contains("dark")) {
      ctx.fillStyle = "#ffffff";
    }
    ctx.beginPath();
    ctx.moveTo(center - 10, 10);
    ctx.lineTo(center + 10, 10);
    ctx.lineTo(center, 25);
    ctx.closePath();
    ctx.fill();

    // Draw center pin
    ctx.beginPath();
    ctx.arc(center, center, 12, 0, 2 * Math.PI, false);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
  };

  useEffect(() => {
    drawWheel();
  }, [optionsText]);

  // Confetti effect
  useEffect(() => {
    if (!confettiActive) return;
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = canvas.parentElement?.clientHeight || 400;

    const colors = ["#f43f5e", "#3b82f6", "#10b981", "#eab308", "#a855f7"];
    const particles = Array.from({ length: 80 }).map(() => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.7) * 10 - 2,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 8,
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
        p.vy += 0.2;
        p.opacity -= 0.015;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
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

  const rotateWheel = (timestamp: number) => {
    if (!spinStartTimestampRef.current) {
      spinStartTimestampRef.current = timestamp;
    }
    const elapsed = timestamp - spinStartTimestampRef.current;

    if (elapsed >= spinTimeTotalRef.current) {
      const finalAngle = baseAngleRef.current + spinAngleStartRef.current;
      startAngleRef.current = finalAngle;
      drawWheel();
      stopRotateWheel();
      return;
    }

    // Ease-out rotation velocity
    const spinProgress = elapsed / spinTimeTotalRef.current;
    const easeOutVal = 1 - Math.pow(1 - spinProgress, 3); // cubic ease out
    const currentAngle = baseAngleRef.current + spinAngleStartRef.current * easeOutVal;
    
    // Play tick sound when passing sector boundaries
    const options = getOptions();
    const arc = Math.PI / (options.length / 2);
    const oldTickIndex = Math.floor(startAngleRef.current / arc);
    const newTickIndex = Math.floor(currentAngle / arc);
    if (oldTickIndex !== newTickIndex) {
      playTick();
    }

    startAngleRef.current = currentAngle;
    drawWheel();
    requestAnimationFrame(rotateWheel);
  };

  const stopRotateWheel = () => {
    setIsSpinning(false);
    const options = getOptions();
    const arc = Math.PI / (options.length / 2);
    
    // Pointer is at -90 degrees (top vertical center). Subtract angle to find selected sector
    const degrees = (startAngleRef.current * 180) / Math.PI + 90;
    const arcd = (arc * 180) / Math.PI;
    const index = Math.floor((360 - (degrees % 360)) / arcd);
    
    const actualIdx = (index + options.length) % options.length;
    setWinner(options[actualIdx]);
    setConfettiActive(true);
  };

  const handleSpin = () => {
    const options = getOptions();
    if (options.length < 2) {
      alert("Masukkan minimal 2 pilihan.");
      return;
    }

    setWinner(null);
    setIsSpinning(true);
    setConfettiActive(false);
    
    // Normalize base angle and set target spin amount (at least 6-11 full turns plus random fraction)
    baseAngleRef.current = startAngleRef.current % (2 * Math.PI);
    spinAngleStartRef.current = (Math.random() * 5 + 6) * 2 * Math.PI + Math.random() * 2 * Math.PI;
    
    spinTimeTotalRef.current = 3000 + Math.random() * 2000; // duration in ms
    spinStartTimestampRef.current = 0; // reset timestamp

    requestAnimationFrame(rotateWheel);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Options Column */}
          <div className="space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-foreground/5 pb-2">
              Pilihan Roda Putar
            </h3>
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                Masukkan Pilihan (Satu per baris / pisahkan koma)
              </label>
              <textarea
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                rows={7}
                disabled={isSpinning}
                className="w-full p-4 border border-foreground/10 rounded-lg text-sm bg-background font-mono focus:outline-none focus:border-primary resize-y"
              />
            </div>

            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSpinning ? "Memutar Roda..." : "🎯 Putar Roda Keputusan"}
            </button>
          </div>

          {/* Wheel column */}
          <div className="flex flex-col items-center justify-center p-4 bg-background border border-foreground/5 rounded-lg relative min-h-[300px]">
            <canvas ref={confettiCanvasRef} className="absolute inset-0 pointer-events-none w-full h-full z-20" />
            
            <div className="relative w-[280px] h-[280px]">
              <canvas ref={canvasRef} width={280} height={280} className="w-full h-full" />
            </div>

            {winner && (
              <div className="text-center mt-6 space-y-1 animate-scaleIn z-10">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">Hasil Terpilih:</span>
                <div className="text-xl font-extrabold bg-card border-2 border-foreground py-2 px-6 rounded-lg shadow font-mono">
                  {winner}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
