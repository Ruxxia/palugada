import { useState, useEffect } from "react";

export function SvgBlobGenerator() {
  const [pointsCount, setPointsCount] = useState(6);
  const [randomness, setRandomness] = useState(40);
  const [fillType, setFillType] = useState<"solid" | "gradient">("gradient");
  const [color1, setColor1] = useState("#a855f7"); // Purple default
  const [color2, setColor2] = useState("#ec4899"); // Pink default
  const [path, setPath] = useState("");
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState(1);

  const size = 400;

  const generateBlob = () => {
    const center = size / 2;
    const radius = size * 0.32;
    const points: { x: number; y: number }[] = [];
    const angleStep = (Math.PI * 2) / pointsCount;

    // Use seed to make it reproducible or random when clicking button
    const rng = (i: number) => {
      const x = Math.sin(seed + i * 999) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < pointsCount; i++) {
      const angle = i * angleStep;
      // Perturb the radius slightly using rng
      const radFactor = 1 - (rng(i) * randomness) / 100;
      const r = radius * radFactor;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      points.push({ x, y });
    }

    // Connect points smoothly using bezier interpolation
    let d = `M ${points[0].x} ${points[0].y}`;
    const tension = 0.25;

    for (let i = 0; i < pointsCount; i++) {
      const pPrev = points[(i - 1 + pointsCount) % pointsCount];
      const pCur = points[i];
      const pNext = points[(i + 1) % pointsCount];
      const pNextNext = points[(i + 2) % pointsCount];

      // Calculate control points for cubic Bezier
      const cp1x = pCur.x + (pNext.x - pPrev.x) * tension;
      const cp1y = pCur.y + (pNext.y - pPrev.y) * tension;
      const cp2x = pNext.x - (pNextNext.x - pCur.x) * tension;
      const cp2y = pNext.y - (pNextNext.y - pCur.y) * tension;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pNext.x} ${pNext.y}`;
    }
    d += " Z";
    setPath(d);
  };

  useEffect(() => {
    generateBlob();
  }, [pointsCount, randomness, seed]);

  const randomize = () => {
    setSeed(Math.random() * 1000);
  };

  const getSvgCode = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%">
  ${
    fillType === "gradient"
      ? `<defs>
    <linearGradient id="blob-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>`
      : ""
  }
  <path d="${path}" fill="${fillType === "gradient" ? "url(#blob-grad)" : color1}" />
</svg>`;
  };

  const copySvg = () => {
    navigator.clipboard.writeText(getSvgCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadSvg = () => {
    const blob = new Blob([getSvgCode()], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `blob-${Math.round(seed)}.svg`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-foreground/5 pb-2">
              Pengaturan Bentuk Blob
            </h3>

            {/* Vertices/Points Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                  Jumlah Titik Sudut (Complexity)
                </label>
                <span className="text-xs font-mono text-primary font-bold">{pointsCount}</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                value={pointsCount}
                onChange={(e) => setPointsCount(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Randomness/Distortion Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                  Keacakan Bentuk (Distortion)
                </label>
                <span className="text-xs font-mono text-primary font-bold">{randomness}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="85"
                value={randomness}
                onChange={(e) => setRandomness(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Fill Type Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                Pewarnaan (Fill)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFillType("solid")}
                  className={`h-9 px-4 text-xs font-bold rounded-lg ${
                    fillType === "solid"
                      ? "bg-primary text-white"
                      : "border border-foreground/10 hover:bg-foreground/5"
                  }`}
                >
                  Solid
                </button>
                <button
                  onClick={() => setFillType("gradient")}
                  className={`h-9 px-4 text-xs font-bold rounded-lg ${
                    fillType === "gradient"
                      ? "bg-primary text-white"
                      : "border border-foreground/10 hover:bg-foreground/5"
                  }`}
                >
                  Gradasi
                </button>
              </div>
            </div>

            {/* Colors picker */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                Warna Blob
              </label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className="w-9 h-9 border border-foreground/10 rounded cursor-pointer p-0.5 bg-background"
                  />
                  <span className="text-xs font-mono uppercase text-foreground/70">{color1}</span>
                </div>

                {fillType === "gradient" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color2}
                      onChange={(e) => setColor2(e.target.value)}
                      className="w-9 h-9 border border-foreground/10 rounded cursor-pointer p-0.5 bg-background"
                    />
                    <span className="text-xs font-mono uppercase text-foreground/70">{color2}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={randomize}
                className="w-full h-11 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
              >
                🔄 Acak Bentuk Baru
              </button>
              <div className="flex gap-3">
                <button
                  onClick={copySvg}
                  className="flex-1 h-11 border border-foreground/10 hover:bg-foreground/5 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
                >
                  {copied ? "Tersalin!" : "Copy SVG"}
                </button>
                <button
                  onClick={downloadSvg}
                  className="flex-1 h-11 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-primary/95 transition-colors"
                >
                  Download SVG
                </button>
              </div>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="flex flex-col items-center justify-center p-6 bg-background rounded-xl border border-foreground/10 shadow-[4px_4px_0px_rgba(0,0,0,0.02)] min-h-[300px]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-foreground/5 pb-2 w-full text-center mb-6">
              Pratinjau Blob SVG
            </h3>
            
            <div className="w-full max-w-[280px] aspect-square flex items-center justify-center relative bg-white border border-foreground/5 rounded-lg p-4 shadow-inner">
              <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-md">
                {fillType === "gradient" && (
                  <defs>
                    <linearGradient id="preview-blob-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color={color1} />
                      <stop offset="100%" stop-color={color2} />
                    </linearGradient>
                  </defs>
                )}
                <path d={path} fill={fillType === "gradient" ? "url(#preview-blob-grad)" : color1} />
              </svg>
            </div>
          </div>
        </div>

        {/* Code Box */}
        <div className="space-y-2 border-t border-foreground/5 pt-6">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
            SVG Source Code
          </label>
          <pre className="p-4 bg-background border border-foreground/10 rounded-lg text-xs font-mono text-foreground/80 overflow-x-auto select-all max-h-40">
            {getSvgCode()}
          </pre>
        </div>
      </div>
    </div>
  );
}
