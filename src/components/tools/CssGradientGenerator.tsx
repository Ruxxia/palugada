import { useState, useEffect } from "react";

export function CssGradientGenerator() {
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(135);
  const [color1, setColor1] = useState("#3b82f6");
  const [pos1, setPos1] = useState(0);
  const [color2, setColor2] = useState("#ec4899");
  const [pos2, setPos2] = useState(100);
  const [copied, setCopied] = useState(false);

  const [cssCode, setCssCode] = useState("");

  useEffect(() => {
    let code = "";
    if (type === "linear") {
      code = `background: ${color1};\nbackground: linear-gradient(${angle}deg, ${color1} ${pos1}%, ${color2} ${pos2}%);`;
    } else {
      code = `background: ${color1};\nbackground: radial-gradient(circle, ${color1} ${pos1}%, ${color2} ${pos2}%);`;
    }
    setCssCode(code);
  }, [type, angle, color1, pos1, color2, pos2]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gradientStyle = type === "linear" 
    ? `linear-gradient(${angle}deg, ${color1} ${pos1}%, ${color2} ${pos2}%)`
    : `radial-gradient(circle, ${color1} ${pos1}%, ${color2} ${pos2}%)`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Settings */}
      <div className="space-y-6">
        <div className="flex gap-2 p-1 bg-foreground/5 rounded-lg max-w-xs">
          <button
            onClick={() => setType("linear")}
            className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
              type === "linear" ? "bg-foreground text-background" : "hover:text-foreground"
            }`}
          >
            Linear
          </button>
          <button
            onClick={() => setType("radial")}
            className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
              type === "radial" ? "bg-foreground text-background" : "hover:text-foreground"
            }`}
          >
            Radial
          </button>
        </div>

        {type === "linear" && (
          <div>
            <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
              <span>Sudut (Angle)</span>
              <span>{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full accent-foreground"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-foreground/10 rounded-xl space-y-3 bg-card">
            <span className="block text-xs font-mono uppercase tracking-wider text-primary font-bold">Warna 1</span>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
                className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
                className="flex-1 p-2 border border-foreground/15 rounded bg-background font-mono text-xs uppercase"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono text-foreground/50 mb-1">
                <span>Posisi</span>
                <span>{pos1}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={pos1}
                onChange={(e) => setPos1(parseInt(e.target.value))}
                className="w-full accent-foreground"
              />
            </div>
          </div>

          <div className="p-4 border border-foreground/10 rounded-xl space-y-3 bg-card">
            <span className="block text-xs font-mono uppercase tracking-wider text-primary font-bold">Warna 2</span>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
                className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
                className="flex-1 p-2 border border-foreground/15 rounded bg-background font-mono text-xs uppercase"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono text-foreground/50 mb-1">
                <span>Posisi</span>
                <span>{pos2}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={pos2}
                onChange={(e) => setPos2(parseInt(e.target.value))}
                className="w-full accent-foreground"
              />
            </div>
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

      {/* Preview Box */}
      <div className="flex flex-col items-center justify-center border border-foreground/10 rounded-2xl bg-foreground/[0.02] p-8 min-h-[300px]">
        <span className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Preview</span>
        <div
          className="w-full max-w-sm aspect-video rounded-xl shadow-lg border border-foreground/15"
          style={{ background: gradientStyle }}
        />
      </div>
    </div>
  );
}
