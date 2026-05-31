import { useState, useEffect } from "react";

export function CssGridGenerator() {
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(3);
  const [columnGap, setColumnGap] = useState(10);
  const [rowGap, setRowGap] = useState(10);

  const [cssCode, setCssCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const colStr = `repeat(${columns}, 1fr)`;
    const rowStr = `repeat(${rows}, 1fr)`;
    setCssCode(
      `display: grid;\ngrid-template-columns: ${colStr};\ngrid-template-rows: ${rowStr};\ncolumn-gap: ${columnGap}px;\nrow-gap: ${rowGap}px;`
    );
  }, [columns, rows, columnGap, rowGap]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalCells = columns * rows;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Controls */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
              <span>Kolom (Columns)</span>
              <span>{columns}</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              value={columns}
              onChange={(e) => setColumns(parseInt(e.target.value))}
              className="w-full accent-foreground"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
              <span>Baris (Rows)</span>
              <span>{rows}</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value))}
              className="w-full accent-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
              <span>Column Gap</span>
              <span>{columnGap}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={columnGap}
              onChange={(e) => setColumnGap(parseInt(e.target.value))}
              className="w-full accent-foreground"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1">
              <span>Row Gap</span>
              <span>{rowGap}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={rowGap}
              onChange={(e) => setRowGap(parseInt(e.target.value))}
              className="w-full accent-foreground"
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

      {/* Preview Container */}
      <div className="flex flex-col border border-foreground/10 rounded-2xl bg-foreground/[0.02] p-6 min-h-[350px]">
        <span className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4 text-center">Preview</span>
        <div
          className="flex-1 w-full bg-background border border-foreground/10 rounded-xl p-4 transition-all min-h-[250px]"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            columnGap: `${columnGap}px`,
            rowGap: `${rowGap}px`,
          }}
        >
          {Array.from({ length: totalCells }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-xs rounded-lg min-h-[40px] p-2"
            >
              Item {idx + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
