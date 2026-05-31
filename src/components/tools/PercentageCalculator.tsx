import { useState, useEffect } from "react";

export function PercentageCalculator() {
  // Case 1: What is X% of Y?
  const [c1X, setC1X] = useState("10");
  const [c1Y, setC1Y] = useState("100");
  const [c1Result, setC1Result] = useState<number | null>(null);

  // Case 2: X is what percent of Y?
  const [c2X, setC2X] = useState("10");
  const [c2Y, setC2Y] = useState("100");
  const [c2Result, setC2Result] = useState<number | null>(null);

  // Case 3: Percentage increase/decrease from X to Y?
  const [c3X, setC3X] = useState("50");
  const [c3Y, setC3Y] = useState("80");
  const [c3Result, setC3Result] = useState<number | null>(null);

  useEffect(() => {
    const x = parseFloat(c1X);
    const y = parseFloat(c1Y);
    if (!isNaN(x) && !isNaN(y)) {
      setC1Result((x / 100) * y);
    } else {
      setC1Result(null);
    }
  }, [c1X, c1Y]);

  useEffect(() => {
    const x = parseFloat(c2X);
    const y = parseFloat(c2Y);
    if (!isNaN(x) && !isNaN(y) && y !== 0) {
      setC2Result((x / y) * 100);
    } else {
      setC2Result(null);
    }
  }, [c2X, c2Y]);

  useEffect(() => {
    const x = parseFloat(c3X);
    const y = parseFloat(c3Y);
    if (!isNaN(x) && !isNaN(y) && x !== 0) {
      setC3Result(((y - x) / x) * 100);
    } else {
      setC3Result(null);
    }
  }, [c3X, c3Y]);

  return (
    <div className="space-y-8">
      {/* Case 1 */}
      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Berapa X% dari Y?</h3>
        <div className="flex gap-4 items-center flex-wrap">
          <span className="text-sm font-medium">Berapa</span>
          <input
            type="number"
            value={c1X}
            onChange={(e) => setC1X(e.target.value)}
            className="w-24 p-2.5 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="X"
          />
          <span className="text-sm font-medium">% dari</span>
          <input
            type="number"
            value={c1Y}
            onChange={(e) => setC1Y(e.target.value)}
            className="w-28 p-2.5 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Y"
          />
          <span className="text-sm font-medium">?</span>
          <span className="text-sm font-medium">Hasil:</span>
          <div className="px-4 py-2 bg-background border border-foreground/15 rounded-lg font-mono font-bold text-sm min-w-[80px] text-center">
            {c1Result !== null ? c1Result.toFixed(2).replace(/\.00$/, "") : ""}
          </div>
        </div>
      </div>

      {/* Case 2 */}
      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">X adalah berapa persen dari Y?</h3>
        <div className="flex gap-4 items-center flex-wrap">
          <input
            type="number"
            value={c2X}
            onChange={(e) => setC2X(e.target.value)}
            className="w-28 p-2.5 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="X"
          />
          <span className="text-sm font-medium">adalah berapa persen dari</span>
          <input
            type="number"
            value={c2Y}
            onChange={(e) => setC2Y(e.target.value)}
            className="w-28 p-2.5 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Y"
          />
          <span className="text-sm font-medium">?</span>
          <span className="text-sm font-medium">Hasil:</span>
          <div className="px-4 py-2 bg-background border border-foreground/15 rounded-lg font-mono font-bold text-sm min-w-[80px] text-center">
            {c2Result !== null ? `${c2Result.toFixed(2).replace(/\.00$/, "")}%` : ""}
          </div>
        </div>
      </div>

      {/* Case 3 */}
      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Berapa persentase kenaikan/penurunan dari X ke Y?</h3>
        <div className="flex gap-4 items-center flex-wrap">
          <span className="text-sm font-medium">Dari</span>
          <input
            type="number"
            value={c3X}
            onChange={(e) => setC3X(e.target.value)}
            className="w-28 p-2.5 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="X"
          />
          <span className="text-sm font-medium">ke</span>
          <input
            type="number"
            value={c3Y}
            onChange={(e) => setC3Y(e.target.value)}
            className="w-28 p-2.5 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Y"
          />
          <span className="text-sm font-medium">?</span>
          <span className="text-sm font-medium">Hasil:</span>
          <div className="px-4 py-2 bg-background border border-foreground/15 rounded-lg font-mono font-bold text-sm min-w-[80px] text-center">
            {c3Result !== null
              ? `${c3Result >= 0 ? "+" : ""}${c3Result.toFixed(2).replace(/\.00$/, "")}%`
              : ""}
          </div>
          {c3Result !== null && (
            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${c3Result >= 0 ? "text-primary" : "text-destructive"}`}>
              ({c3Result >= 0 ? "Kenaikan" : "Penurunan"})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
