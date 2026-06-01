import { useState, useEffect } from "react";

export function SvgWaveGenerator() {
  const [wavesCount, setWavesCount] = useState(4);
  const [waveHeight, setWaveHeight] = useState(60);
  const [wavePosition, setWavePosition] = useState<"top" | "bottom">("bottom");
  const [fillType, setFillType] = useState<"solid" | "gradient">("gradient");
  const [color1, setColor1] = useState("#00c6ff"); // Cyan default
  const [color2, setColor2] = useState("#0072ff"); // Blue default
  const [path, setPath] = useState("");
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState(42);

  const width = 1440;
  const height = 320;

  const generateWave = () => {
    // Generate deterministic wave heights using seed
    const rng = (i: number) => {
      const x = Math.sin(seed + i * 4321) * 10000;
      return x - Math.floor(x);
    };

    const points: { x: number; y: number }[] = [];
    const step = width / wavesCount;
    const baseLine = wavePosition === "bottom" ? height - 120 : 120;

    for (let i = 0; i <= wavesCount; i++) {
      const x = i * step;
      // Alternate direction and randomize height factor slightly
      const direction = i % 2 === 0 ? 1 : -1;
      const heightFactor = 0.6 + rng(i) * 0.8; // Randomize height variation
      const y = baseLine + direction * waveHeight * heightFactor;
      points.push({ x, y });
    }

    // Start drawing path
    let d = wavePosition === "bottom"
      ? `M 0 ${height} L 0 ${points[0].y}`
      : `M 0 0 L 0 ${points[0].y}`;

    // Cubic Bezier spline interpolation
    for (let i = 0; i < wavesCount; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      // Control points centered between step values
      const cp1x = p1.x + step / 2;
      const cp1y = p1.y;
      const cp2x = p2.x - step / 2;
      const cp2y = p2.y;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    // Complete the polygon
    if (wavePosition === "bottom") {
      d += ` L ${width} ${height} Z`;
    } else {
      d += ` L ${width} 0 Z`;
    }

    setPath(d);
  };

  useEffect(() => {
    generateWave();
  }, [wavesCount, waveHeight, wavePosition, seed]);

  const randomize = () => {
    setSeed(Math.floor(Math.random() * 10000));
  };

  const getSvgCode = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  ${
    fillType === "gradient"
      ? `<defs>
    <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>`
      : ""
  }
  <path d="${path}" fill="${fillType === "gradient" ? "url(#wave-grad)" : color1}" />
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
    link.download = `wave-${wavePosition}-${Math.round(seed)}.svg`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-foreground/5 pb-2">
              Pengaturan Bentuk Gelombang
            </h3>

            {/* Wave Position */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                Posisi Gelombang
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setWavePosition("top")}
                  className={`h-9 px-4 text-xs font-bold rounded-lg ${
                    wavePosition === "top"
                      ? "bg-primary text-white"
                      : "border border-foreground/10 hover:bg-foreground/5"
                  }`}
                >
                  Di Atas (Top)
                </button>
                <button
                  onClick={() => setWavePosition("bottom")}
                  className={`h-9 px-4 text-xs font-bold rounded-lg ${
                    wavePosition === "bottom"
                      ? "bg-primary text-white"
                      : "border border-foreground/10 hover:bg-foreground/5"
                  }`}
                >
                  Di Bawah (Bottom)
                </button>
              </div>
            </div>

            {/* Waves Count Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                  Jumlah Puncak Gelombang (Waves Count)
                </label>
                <span className="text-xs font-mono text-primary font-bold">{wavesCount}</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={wavesCount}
                onChange={(e) => setWavesCount(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Wave Height Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                  Tinggi Gelombang (Wave Height)
                </label>
                <span className="text-xs font-mono text-primary font-bold">{waveHeight}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                value={waveHeight}
                onChange={(e) => setWaveHeight(parseInt(e.target.value, 10))}
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
                Warna Gelombang
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
                🌊 Ubah Variasi Alur Gelombang
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
              Pratinjau Wave SVG
            </h3>

            <div className="w-full aspect-[16/6] bg-white border border-foreground/5 rounded-lg shadow-inner overflow-hidden relative flex items-center">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {fillType === "gradient" && (
                  <defs>
                    <linearGradient id="preview-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color={color1} />
                      <stop offset="100%" stop-color={color2} />
                    </linearGradient>
                  </defs>
                )}
                <path d={path} fill={fillType === "gradient" ? "url(#preview-wave-grad)" : color1} />
              </svg>
            </div>
            <span className="text-[10px] font-mono text-foreground/40 mt-4">
              Rasio aspek standar untuk pratinjau adalah 1440 x 320 piksel.
            </span>
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
