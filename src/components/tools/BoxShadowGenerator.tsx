import { useState, useEffect } from "react";

export function BoxShadowGenerator() {
  const [hOffset, setHOffset] = useState(10);
  const [vOffset, setVOffset] = useState(10);
  const [blur, setBlur] = useState(20);
  const [spread, setSpread] = useState(0);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowOpacity, setShadowOpacity] = useState(25); // percentage (0 - 100)
  const [inset, setInset] = useState(false);

  const [boxColor, setBoxColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#f3f4f6");

  const [cssCode, setCssCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Hex to RGBA conversion
    const hex = shadowColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const a = (shadowOpacity / 100).toFixed(2);

    const insetStr = inset ? " inset" : "";
    const shadowVal = `${hOffset}px ${vOffset}px ${blur}px ${spread}px rgba(${r}, ${g}, ${b}, ${a})${insetStr}`;
    setCssCode(`box-shadow: ${shadowVal};\n-webkit-box-shadow: ${shadowVal};\n-moz-box-shadow: ${shadowVal};`);
  }, [hOffset, vOffset, blur, spread, shadowColor, shadowOpacity, inset]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract color for inline preview style
  const hex = shadowColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const a = (shadowOpacity / 100).toFixed(2);
  const insetStr = inset ? " inset" : "";
  const inlineShadow = `${hOffset}px ${vOffset}px ${blur}px ${spread}px rgba(${r}, ${g}, ${b}, ${a})${insetStr}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Controls */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
              <span>Horizontal Offset</span>
              <span>{hOffset}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={hOffset}
              onChange={(e) => setHOffset(parseInt(e.target.value))}
              className="w-full accent-foreground"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
              <span>Vertical Offset</span>
              <span>{vOffset}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={vOffset}
              onChange={(e) => setVOffset(parseInt(e.target.value))}
              className="w-full accent-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
              <span>Blur Radius</span>
              <span>{blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={blur}
              onChange={(e) => setBlur(parseInt(e.target.value))}
              className="w-full accent-foreground"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
              <span>Spread Radius</span>
              <span>{spread}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={spread}
              onChange={(e) => setSpread(parseInt(e.target.value))}
              className="w-full accent-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 border border-foreground/10 rounded-xl bg-card space-y-2">
            <span className="block text-xs font-mono uppercase tracking-wider text-foreground/50">Warna Shadow</span>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={shadowColor}
                onChange={(e) => setShadowColor(e.target.value)}
                className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={shadowColor}
                onChange={(e) => setShadowColor(e.target.value)}
                className="flex-1 p-1.5 border border-foreground/15 rounded bg-background font-mono text-xs uppercase"
              />
            </div>
          </div>

          <div className="p-3 border border-foreground/10 rounded-xl bg-card space-y-2">
            <div className="flex justify-between text-[11px] font-mono uppercase text-foreground/50">
              <span>Opacity Shadow</span>
              <span>{shadowOpacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={shadowOpacity}
              onChange={(e) => setShadowOpacity(parseInt(e.target.value))}
              className="w-full accent-foreground"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-foreground/75 cursor-pointer">
            <input
              type="checkbox"
              checked={inset}
              onChange={(e) => setInset(e.target.checked)}
              className="w-4 h-4 rounded border-foreground/15 text-primary accent-foreground"
            />
            Inset Shadow
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">Box Color</label>
            <input
              type="color"
              value={boxColor}
              onChange={(e) => setBoxColor(e.target.value)}
              className="w-full h-10 border-0 rounded cursor-pointer bg-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">Bg Preview</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-10 border-0 rounded cursor-pointer bg-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50">CSS Code</label>
          <div className="relative">
            <pre className="p-4 bg-foreground/5 border border-foreground/10 rounded-xl font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
              {cssCode}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-lg hover:bg-foreground/90 transition-colors"
            >
              {copied ? "Copied! ✓" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div 
        className="flex flex-col items-center justify-center border border-foreground/10 rounded-2xl p-8 min-h-[300px] transition-colors"
        style={{ backgroundColor: bgColor }}
      >
        <span className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-8">Preview</span>
        <div
          className="w-32 h-32 rounded-xl transition-all"
          style={{
            backgroundColor: boxColor,
            boxShadow: inlineShadow,
          }}
        />
      </div>
    </div>
  );
}
