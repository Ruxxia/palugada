import { useState, useEffect } from "react";

export function ColorConverter() {
  const [hex, setHex] = useState("#ff4d00");
  const [rVal, setRVal] = useState(255);
  const [gVal, setGVal] = useState(77);
  const [bVal, setBVal] = useState(0);

  const [hVal, setHVal] = useState(18);
  const [sVal, setSVal] = useState(100);
  const [lVal, setLVal] = useState(50);

  const [rgb, setRgb] = useState("rgb(255, 77, 0)");
  const [hsl, setHsl] = useState("hsl(18, 100%, 50%)");
  const [cmyk, setCmyk] = useState("cmyk(0%, 70%, 100%, 0%)");

  const [copiedHex, setCopiedHex] = useState(false);
  const [copiedRgb, setCopiedRgb] = useState(false);
  const [copiedHsl, setCopiedHsl] = useState(false);
  const [copiedCmyk, setCopiedCmyk] = useState(false);

  // Helper: RGB to Hex
  const rgbToHex = (r: number, g: number, b: number) => {
    const toHexStr = (c: number) => {
      const hexStr = Math.max(0, Math.min(255, c)).toString(16);
      return hexStr.length === 1 ? "0" + hexStr : hexStr;
    };
    return `#${toHexStr(r)}${toHexStr(g)}${toHexStr(b)}`;
  };

  // Helper: Hex to RGB
  const hexToRgb = (hexStr: string) => {
    let cleanHex = hexStr.replace(/^#/, "");
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split("").map((c) => c + c).join("");
    }
    const num = parseInt(cleanHex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  // Helper: RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // Helper: HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
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

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  };

  // Helper: RGB to CMYK
  const rgbToCmyk = (r: number, g: number, b: number) => {
    let c = 1 - r / 255;
    let m = 1 - g / 255;
    let y = 1 - b / 255;
    let k = Math.min(c, Math.min(m, y));

    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }

    c = Math.round(((c - k) / (1 - k)) * 100);
    m = Math.round(((m - k) / (1 - k)) * 100);
    y = Math.round(((y - k) / (1 - k)) * 100);
    k = Math.round(k * 100);

    return { c, m, y, k };
  };

  // Update everything when R, G, B changes
  const updateFromRgb = (r: number, g: number, b: number) => {
    setRVal(r);
    setGVal(g);
    setBVal(b);

    const calculatedHex = rgbToHex(r, g, b);
    setHex(calculatedHex);

    const hslVals = rgbToHsl(r, g, b);
    setHVal(hslVals.h);
    setSVal(hslVals.s);
    setLVal(hslVals.l);

    setRgb(`rgb(${r}, ${g}, ${b})`);
    setHsl(`hsl(${hslVals.h}, ${hslVals.s}%, ${hslVals.l}%)`);

    const cmykVals = rgbToCmyk(r, g, b);
    setCmyk(`cmyk(${cmykVals.c}%, ${cmykVals.m}%, ${cmykVals.y}%, ${cmykVals.k}%)`);
  };

  // Update everything when H, S, L changes
  const updateFromHsl = (h: number, s: number, l: number) => {
    setHVal(h);
    setSVal(s);
    setLVal(l);

    const { r, g, b } = hslToRgb(h, s, l);
    setRVal(r);
    setGVal(g);
    setBVal(b);

    const calculatedHex = rgbToHex(r, g, b);
    setHex(calculatedHex);

    setRgb(`rgb(${r}, ${g}, ${b})`);
    setHsl(`hsl(${h}, ${s}%, ${l}%)`);

    const cmykVals = rgbToCmyk(r, g, b);
    setCmyk(`cmyk(${cmykVals.c}%, ${cmykVals.m}%, ${cmykVals.y}%, ${cmykVals.k}%)`);
  };

  // Update everything when HEX text/input changes
  const handleHexChange = (value: string) => {
    let cleanVal = value;
    if (!cleanVal.startsWith("#")) cleanVal = "#" + cleanVal;
    setHex(cleanVal);

    if (/^#[0-9A-F]{6}$/i.test(cleanVal)) {
      const { r, g, b } = hexToRgb(cleanVal);
      setRVal(r);
      setGVal(g);
      setBVal(b);

      const hslVals = rgbToHsl(r, g, b);
      setHVal(hslVals.h);
      setSVal(hslVals.s);
      setLVal(hslVals.l);

      setRgb(`rgb(${r}, ${g}, ${b})`);
      setHsl(`hsl(${hslVals.h}, ${hslVals.s}%, ${hslVals.l}%)`);

      const cmykVals = rgbToCmyk(r, g, b);
      setCmyk(`cmyk(${cmykVals.c}%, ${cmykVals.m}%, ${cmykVals.y}%, ${cmykVals.k}%)`);
    }
  };

  const copyFormat = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Visual Color Pickers / Sliders */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Interactive Color Picker</h3>

        {/* Visual Swatch and System Picker */}
        <div className="flex gap-4 items-center bg-background border border-foreground/10 p-4 rounded-xl">
          <div
            className="w-16 h-16 rounded-lg border border-foreground/10 relative cursor-pointer group"
            style={{ backgroundColor: hex }}
          >
            <input
              type="color"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <span className="text-[10px] text-white font-bold">PICK</span>
            </div>
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-mono text-foreground/50 block">HEX CODE</span>
            <input
              type="text"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              className="bg-transparent border-b border-foreground/20 focus:border-primary font-mono text-lg font-bold outline-none w-full"
            />
          </div>
        </div>

        {/* HSL Sliders */}
        <div className="space-y-4 pt-4 border-t border-foreground/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/60">Pengaturan HSL</h4>
          
          {/* Hue */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span>Hue (H)</span>
              <span>{hVal}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={hVal}
              onChange={(e) => updateFromHsl(parseInt(e.target.value), sVal, lVal)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
              }}
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span>Saturation (S)</span>
              <span>{sVal}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sVal}
              onChange={(e) => updateFromHsl(hVal, parseInt(e.target.value), lVal)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(${hVal}, 0%, 50%), hsl(${hVal}, 100%, 50%))`,
              }}
            />
          </div>

          {/* Lightness */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span>Lightness (L)</span>
              <span>{lVal}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={lVal}
              onChange={(e) => updateFromHsl(hVal, sVal, parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #000 0%, hsl(${hVal}, ${sVal}%, 50%) 50%, #fff 100%)`,
              }}
            />
          </div>
        </div>

        {/* RGB Sliders */}
        <div className="space-y-4 pt-4 border-t border-foreground/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/60">Pengaturan RGB</h4>

          {/* Red */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span>Red (R)</span>
              <span>{rVal}</span>
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={rVal}
              onChange={(e) => updateFromRgb(parseInt(e.target.value), gVal, bVal)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(0, ${gVal}, ${bVal}), rgb(255, ${gVal}, ${bVal}))`,
              }}
            />
          </div>

          {/* Green */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span>Green (G)</span>
              <span>{gVal}</span>
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={gVal}
              onChange={(e) => updateFromRgb(rVal, parseInt(e.target.value), bVal)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(${rVal}, 0, ${bVal}), rgb(${rVal}, 255, ${bVal}))`,
              }}
            />
          </div>

          {/* Blue */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span>Blue (B)</span>
              <span>{bVal}</span>
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={bVal}
              onChange={(e) => updateFromRgb(rVal, gVal, parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(${rVal}, ${gVal}, 0), rgb(${rVal}, ${gVal}, 255))`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Conversion results panel */}
      <div className="space-y-4 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Hasil Konversi</h3>

          <div className="space-y-4">
            {/* HEX */}
            <div className="flex justify-between items-center bg-background border border-foreground/10 p-3.5 rounded-lg">
              <div>
                <span className="text-[10px] font-mono text-foreground/45 block">HEX</span>
                <span className="text-sm font-mono font-bold">{hex}</span>
              </div>
              <button
                onClick={() => copyFormat(hex, setCopiedHex)}
                className="px-3 py-1 bg-foreground/5 hover:bg-foreground/10 text-xs font-mono rounded"
              >
                {copiedHex ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* RGB */}
            <div className="flex justify-between items-center bg-background border border-foreground/10 p-3.5 rounded-lg">
              <div>
                <span className="text-[10px] font-mono text-foreground/45 block">RGB</span>
                <span className="text-sm font-mono font-bold">{rgb}</span>
              </div>
              <button
                onClick={() => copyFormat(rgb, setCopiedRgb)}
                className="px-3 py-1 bg-foreground/5 hover:bg-foreground/10 text-xs font-mono rounded"
              >
                {copiedRgb ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* HSL */}
            <div className="flex justify-between items-center bg-background border border-foreground/10 p-3.5 rounded-lg">
              <div>
                <span className="text-[10px] font-mono text-foreground/45 block">HSL</span>
                <span className="text-sm font-mono font-bold">{hsl}</span>
              </div>
              <button
                onClick={() => copyFormat(hsl, setCopiedHsl)}
                className="px-3 py-1 bg-foreground/5 hover:bg-foreground/10 text-xs font-mono rounded"
              >
                {copiedHsl ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* CMYK */}
            <div className="flex justify-between items-center bg-background border border-foreground/10 p-3.5 rounded-lg">
              <div>
                <span className="text-[10px] font-mono text-foreground/45 block">CMYK</span>
                <span className="text-sm font-mono font-bold">{cmyk}</span>
              </div>
              <button
                onClick={() => copyFormat(cmyk, setCopiedCmyk)}
                className="px-3 py-1 bg-foreground/5 hover:bg-foreground/10 text-xs font-mono rounded"
              >
                {copiedCmyk ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
