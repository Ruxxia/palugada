import { useState } from "react";

interface GradientPreset {
  name: string;
  colors: string[];
  angle: number;
}

const PRESETS: GradientPreset[] = [
  { name: "Sunset Orange", colors: ["#ff5e62", "#ff9966"], angle: 45 },
  { name: "Ocean Breeze", colors: ["#00c6ff", "#0072ff"], angle: 135 },
  { name: "Hyper Purple", colors: ["#7f00ff", "#e100ff"], angle: 90 },
  { name: "Mint Fresh", colors: ["#00b09b", "#96c93d"], angle: 45 },
  { name: "Cotton Candy", colors: ["#ff007f", "#7f00ff", "#00f0ff"], angle: 60 },
  { name: "Mystic Forest", colors: ["#11998e", "#38ef7d"], angle: 180 },
];

export function GradientPaletteGenerator() {
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [colors, setColors] = useState<string[]>(["#3b82f6", "#ec4899"]);
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState(false);

  const addColor = () => {
    if (colors.length < 5) {
      setColors([...colors, "#10b981"]);
    }
  };

  const removeColor = (idx: number) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== idx));
    }
  };

  const updateColor = (idx: number, hex: string) => {
    setColors(colors.map((c, i) => (i === idx ? hex : c)));
  };

  const getGradientCSS = () => {
    if (gradientType === "linear") {
      return `linear-gradient(${angle}deg, ${colors.join(", ")})`;
    } else {
      return `radial-gradient(circle, ${colors.join(", ")})`;
    }
  };

  const getCompleteCSS = () => {
    const css = getGradientCSS();
    return `background: ${colors[0]};\nbackground: ${css};`;
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(getCompleteCSS());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadPreset = (p: GradientPreset) => {
    setColors(p.colors);
    setAngle(p.angle);
    setGradientType("linear");
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interactive Settings */}
          <div className="space-y-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-foreground/5 pb-2">
              Kustomisasi Gradasi
            </h3>

            {/* Gradient Type */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                Tipe Gradien
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGradientType("linear")}
                  className={`h-9 px-4 text-xs font-bold rounded-lg ${
                    gradientType === "linear"
                      ? "bg-primary text-white"
                      : "border border-foreground/10 hover:bg-foreground/5"
                  }`}
                >
                  Linear
                </button>
                <button
                  onClick={() => setGradientType("radial")}
                  className={`h-9 px-4 text-xs font-bold rounded-lg ${
                    gradientType === "radial"
                      ? "bg-primary text-white"
                      : "border border-foreground/10 hover:bg-foreground/5"
                  }`}
                >
                  Radial
                </button>
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                  Daftar Warna ({colors.length}/5)
                </label>
                <button
                  onClick={addColor}
                  disabled={colors.length >= 5}
                  className="text-[10px] font-bold text-primary hover:underline disabled:opacity-20"
                >
                  + Tambah Warna
                </button>
              </div>
              <div className="space-y-2.5">
                {colors.map((c, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={c}
                      onChange={(e) => updateColor(idx, e.target.value)}
                      className="w-9 h-9 border border-foreground/10 rounded cursor-pointer p-0.5 bg-background"
                    />
                    <input
                      type="text"
                      value={c}
                      onChange={(e) => {
                        if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                          updateColor(idx, e.target.value);
                        }
                      }}
                      className="h-9 px-3 border border-foreground/10 rounded-lg text-xs font-mono uppercase w-28 bg-background focus:outline-none focus:border-primary"
                    />
                    {colors.length > 2 && (
                      <button
                        onClick={() => removeColor(idx)}
                        className="text-xs text-destructive hover:underline font-bold"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Angle Slider (Only for linear) */}
            {gradientType === "linear" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                    Sudut Kemiringan (Angle)
                  </label>
                  <span className="text-xs font-mono text-primary font-bold">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}
          </div>

          {/* Visual Preview */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-foreground/5 pb-2 w-full text-center">
              Pratinjau Visual
            </h3>
            <div
              className="w-full aspect-[16/10] rounded-xl border border-foreground/10 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] transition-all"
              style={{ background: getGradientCSS() }}
            />
            <button
              onClick={copyCSS}
              className="w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {copied ? "Berhasil Disalin!" : "Salin Kode CSS"}
            </button>
          </div>
        </div>

        {/* CSS Code Box */}
        <div className="space-y-2 border-t border-foreground/5 pt-6">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
            CSS Style Rule
          </label>
          <pre className="p-4 bg-background border border-foreground/10 rounded-lg text-xs font-mono text-foreground/80 overflow-x-auto select-all">
            {getCompleteCSS()}
          </pre>
        </div>

        {/* Presets List */}
        <div className="space-y-4 border-t border-foreground/5 pt-6">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
            Koleksi Gradien Populer
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PRESETS.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => loadPreset(preset)}
                className="border border-foreground/10 rounded-lg p-2 bg-background hover:border-foreground/30 hover:shadow transition-all cursor-pointer text-center space-y-2"
              >
                <div
                  className="w-full aspect-video rounded"
                  style={{
                    background: `linear-gradient(${preset.angle}deg, ${preset.colors.join(", ")})`,
                  }}
                />
                <span className="text-[10px] font-mono font-bold truncate block px-1 text-foreground/80">
                  {preset.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
