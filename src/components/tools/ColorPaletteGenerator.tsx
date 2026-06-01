import { useState, useEffect } from "react";

interface ColorItem {
  hex: string;
  name: string;
}

export function ColorPaletteGenerator() {
  const [palette, setPalette] = useState<ColorItem[]>([]);
  const [baseColor, setBaseColor] = useState("#3b82f6");
  const [harmony, setHarmony] = useState<"random" | "monochromatic" | "analogous" | "triadic" | "complementary">("random");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Generate random hex color
  const getRandomColor = () => {
    const chars = "0123456789abcdef";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += chars[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Convert hex to HSL
  const hexToHsl = (hex: string) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Convert HSL to Hex
  const hslToHex = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r = l;
    let g = l;
    let b = l;

    if (s !== 0) {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Generate palette based on harmony logic
  const generatePalette = () => {
    if (harmony === "random") {
      const colors: ColorItem[] = [];
      for (let i = 0; i < 5; i++) {
        const hex = getRandomColor();
        colors.push({ hex, name: `Warna ${i + 1}` });
      }
      setPalette(colors);
      // set base color to first random generated color quietly
      setBaseColor(colors[0].hex);
    } else {
      const { h, s, l } = hexToHsl(baseColor);
      const colors: ColorItem[] = [];

      if (harmony === "monochromatic") {
        const steps = [-20, -10, 0, 10, 20];
        steps.forEach((step, idx) => {
          const newL = Math.max(10, Math.min(90, l + step));
          colors.push({
            hex: hslToHex(h, s, newL),
            name: `Mono ${idx + 1}`,
          });
        });
      } else if (harmony === "analogous") {
        const steps = [-30, -15, 0, 15, 30];
        steps.forEach((step, idx) => {
          const newH = (h + step + 360) % 360;
          colors.push({
            hex: hslToHex(newH, s, l),
            name: `Analog ${idx + 1}`,
          });
        });
      } else if (harmony === "triadic") {
        // base, base+120, base+240, plus some shade variations
        colors.push({ hex: hslToHex(h, s, Math.max(15, l - 15)), name: "Triad 1" });
        colors.push({ hex: baseColor, name: "Base" });
        colors.push({ hex: hslToHex((h + 120) % 360, s, l), name: "Triad 2" });
        colors.push({ hex: hslToHex((h + 240) % 360, s, l), name: "Triad 3" });
        colors.push({ hex: hslToHex((h + 120) % 360, s, Math.min(85, l + 15)), name: "Triad 4" });
      } else if (harmony === "complementary") {
        // Base, lighter base, opposite complementary, opposite lighter/darker
        const compH = (h + 180) % 360;
        colors.push({ hex: hslToHex(h, s, Math.max(15, l - 15)), name: "Kontras Gelap" });
        colors.push({ hex: baseColor, name: "Warna Utama" });
        colors.push({ hex: hslToHex(h, s, Math.min(85, l + 15)), name: "Kontras Terang" });
        colors.push({ hex: hslToHex(compH, s, l), name: "Komplementer" });
        colors.push({ hex: hslToHex(compH, s, Math.max(20, l - 15)), name: "Komp. Gelap" });
      }

      setPalette(colors);
    }
  };

  useEffect(() => {
    generatePalette();
  }, [baseColor, harmony]);

  const copyColor = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const getCSSCode = () => {
    return `:root {\n${palette
      .map((c, i) => `  --color-${i + 1}: ${c.hex}; /* ${c.name} */`)
      .join("\n")}\n}`;
  };

  const getJSONCode = () => {
    return JSON.stringify(palette.reduce((acc, c, i) => ({ ...acc, [`color${i + 1}`]: c.hex }), {}), null, 2);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
              Metode Keharmonisan Warna
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "random", label: "Acak (Random)" },
                { key: "monochromatic", label: "Monokromatik" },
                { key: "analogous", label: "Analogous" },
                { key: "triadic", label: "Triadic" },
                { key: "complementary", label: "Komplementer" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setHarmony(item.key as any)}
                  className={`h-9 px-3 text-xs font-bold rounded-lg transition-all ${
                    harmony === item.key
                      ? "bg-primary text-white"
                      : "border border-foreground/10 hover:bg-foreground/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {harmony !== "random" && (
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                Pilih Warna Dasar (Base Color)
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-10 h-10 border border-foreground/10 rounded cursor-pointer p-0.5 bg-card"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => {
                    if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                      setBaseColor(e.target.value);
                    }
                  }}
                  className="h-10 px-3 border border-foreground/10 rounded-lg text-sm bg-card font-mono uppercase w-32 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePalette}
          className="w-full h-11 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
        >
          {harmony === "random" ? "Acak Palet Warna Baru" : "Terapkan Harmonisasi"}
        </button>

        {/* Palette Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {palette.map((color, index) => (
            <div
              key={index}
              onClick={() => copyColor(color.hex, index)}
              className="group relative bg-background border border-foreground/10 rounded-xl overflow-hidden cursor-pointer hover:shadow-tactile hover:-translate-y-1 transition-all p-2 flex flex-col"
            >
              <div
                className="aspect-[4/3] rounded-lg mb-3 flex items-end justify-end p-2 transition-transform group-hover:scale-[1.02]"
                style={{ backgroundColor: color.hex }}
              />
              <div className="px-1 space-y-0.5">
                <span className="text-[10px] font-mono text-foreground/40 uppercase block">{color.name}</span>
                <span className="text-xs font-mono font-bold uppercase block">{color.hex}</span>
              </div>
              
              {/* Copy Overlay */}
              <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${
                copiedIndex === index ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}>
                <span className="text-white text-xs font-bold font-mono bg-primary px-2.5 py-1 rounded shadow">
                  Tersalin!
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Export Codes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-foreground/5">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                Ekspor CSS Variables
              </label>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getCSSCode());
                  alert("CSS tersalin ke clipboard!");
                }}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Salin Kode
              </button>
            </div>
            <pre className="p-4 bg-background border border-foreground/10 rounded-lg text-xs font-mono text-foreground/80 overflow-x-auto max-h-40">
              {getCSSCode()}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                Ekspor JSON Schema
              </label>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getJSONCode());
                  alert("JSON tersalin ke clipboard!");
                }}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Salin Kode
              </button>
            </div>
            <pre className="p-4 bg-background border border-foreground/10 rounded-lg text-xs font-mono text-foreground/80 overflow-x-auto max-h-40">
              {getJSONCode()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
