import { useState, useEffect } from "react";

export function BorderRadiusGenerator() {
  const [allLinked, setAllLinked] = useState(true);
  const [allVal, setAllVal] = useState(20);
  const [topLeft, setTopLeft] = useState(20);
  const [topRight, setTopRight] = useState(20);
  const [bottomRight, setBottomRight] = useState(20);
  const [bottomLeft, setBottomLeft] = useState(20);
  const [unit, setUnit] = useState<"px" | "%">("px");

  const [cssCode, setCssCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let radiusVal = "";
    if (allLinked) {
      radiusVal = `${allVal}${unit}`;
    } else {
      radiusVal = `${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit}`;
    }
    setCssCode(`border-radius: ${radiusVal};\n-webkit-border-radius: ${radiusVal};\n-moz-border-radius: ${radiusVal};`);
  }, [allLinked, allVal, topLeft, topRight, bottomRight, bottomLeft, unit]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine inline styles for preview
  const borderRadiusStyle = allLinked
    ? `${allVal}${unit}`
    : `${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Settings */}
      <div className="space-y-6">
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 p-1 bg-foreground/5 rounded-lg">
            <button
              onClick={() => setAllLinked(true)}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
                allLinked ? "bg-foreground text-background" : "hover:text-foreground"
              }`}
            >
              Semua Sama
            </button>
            <button
              onClick={() => setAllLinked(false)}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
                !allLinked ? "bg-foreground text-background" : "hover:text-foreground"
              }`}
            >
              Pisah Sudut
            </button>
          </div>

          <div className="flex gap-2 p-1 bg-foreground/5 rounded-lg">
            <button
              onClick={() => setUnit("px")}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
                unit === "px" ? "bg-foreground text-background" : "hover:text-foreground"
              }`}
            >
              PX
            </button>
            <button
              onClick={() => setUnit("%")}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
                unit === "%" ? "bg-foreground text-background" : "hover:text-foreground"
              }`}
            >
              %
            </button>
          </div>
        </div>

        {allLinked ? (
          <div>
            <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
              <span>Radius (Semua Sudut)</span>
              <span>{allVal}{unit}</span>
            </div>
            <input
              type="range"
              min="0"
              max={unit === "px" ? 200 : 50}
              value={allVal}
              onChange={(e) => setAllVal(parseInt(e.target.value))}
              className="w-full accent-foreground"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
                  <span>Top Left</span>
                  <span>{topLeft}{unit}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={unit === "px" ? 200 : 50}
                  value={topLeft}
                  onChange={(e) => setTopLeft(parseInt(e.target.value))}
                  className="w-full accent-foreground"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
                  <span>Top Right</span>
                  <span>{topRight}{unit}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={unit === "px" ? 200 : 50}
                  value={topRight}
                  onChange={(e) => setTopRight(parseInt(e.target.value))}
                  className="w-full accent-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
                  <span>Bottom Right</span>
                  <span>{bottomRight}{unit}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={unit === "px" ? 200 : 50}
                  value={bottomRight}
                  onChange={(e) => setBottomRight(parseInt(e.target.value))}
                  className="w-full accent-foreground"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
                  <span>Bottom Left</span>
                  <span>{bottomLeft}{unit}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={unit === "px" ? 200 : 50}
                  value={bottomLeft}
                  onChange={(e) => setBottomLeft(parseInt(e.target.value))}
                  className="w-full accent-foreground"
                />
              </div>
            </div>
          </div>
        )}

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
        <span className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-8">Preview</span>
        <div
          className="w-40 h-40 bg-foreground border border-foreground/15 transition-all shadow-md"
          style={{ borderRadius: borderRadiusStyle }}
        />
      </div>
    </div>
  );
}
