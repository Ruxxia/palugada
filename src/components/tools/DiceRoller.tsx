import { useState } from "react";

export function DiceRoller() {
  const [diceCount, setDiceCount] = useState(1);
  const [sides, setSides] = useState(6);
  const [results, setResults] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<{ rolls: number[]; sum: number }[]>([]);

  const roll = () => {
    setIsRolling(true);
    let counter = 0;
    
    // Simulate dice rolling animation
    const interval = setInterval(() => {
      const tempRolls = Array.from({ length: diceCount }, () => Math.floor(Math.random() * sides) + 1);
      setResults(tempRolls);
      counter++;
      if (counter > 8) {
        clearInterval(interval);
        const finalRolls = Array.from({ length: diceCount }, () => Math.floor(Math.random() * sides) + 1);
        setResults(finalRolls);
        const sum = finalRolls.reduce((a, b) => a + b, 0);
        setHistory((prev) => [{ rolls: finalRolls, sum }, ...prev.slice(0, 19)]);
        setIsRolling(false);
      }
    }, 80);
  };

  const getDiceSvg = (value: number, totalSides: number) => {
    // Return simple SVGs for standard D6 or a polyhedral shape for others
    if (totalSides === 6) {
      const dotsMap: Record<number, [number, number][]> = {
        1: [[50, 50]],
        2: [[25, 25], [75, 75]],
        3: [[25, 25], [50, 50], [75, 75]],
        4: [[25, 25], [25, 75], [75, 25], [75, 75]],
        5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
        6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]],
      };
      const dots = dotsMap[value] || [];
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 fill-foreground stroke-background stroke-2">
          <rect x="5" y="5" width="90" height="90" rx="15" className="fill-background stroke-foreground" strokeWidth="6" />
          {dots.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="8" className="fill-foreground" />
          ))}
        </svg>
      );
    }

    // Default polygon for D4, D8, D10, D12, D20, D100
    return (
      <div className="w-16 h-16 border-4 border-foreground rounded-xl flex items-center justify-center bg-background font-mono font-bold text-xl relative">
        <span className="z-10">{value}</span>
        <span className="absolute bottom-1 right-1 text-[8px] text-foreground/40 font-bold">D{totalSides}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Jumlah Dadu</label>
          <select
            value={diceCount}
            onChange={(e) => setDiceCount(Number(e.target.value))}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background text-sm font-mono focus:outline-none focus:border-primary"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
              <option key={n} value={n}>{n} Dadu</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Tipe Dadu (Sisi)</label>
          <select
            value={sides}
            onChange={(e) => setSides(Number(e.target.value))}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background text-sm font-mono focus:outline-none focus:border-primary"
          >
            <option value={4}>D4 (4 Sisi)</option>
            <option value={6}>D6 (6 Sisi)</option>
            <option value={8}>D8 (8 Sisi)</option>
            <option value={10}>D10 (10 Sisi)</option>
            <option value={12}>D12 (12 Sisi)</option>
            <option value={20}>D20 (20 Sisi)</option>
            <option value={100}>D100 (100 Sisi)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={roll}
          disabled={isRolling}
          className="bg-foreground text-background px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-50 transition-colors"
        >
          {isRolling ? "Mengocok..." : "Kocok Dadu"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4 bg-foreground/5 p-6 rounded-xl border border-foreground/10">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Kocokan</span>
            <span className="font-mono text-sm font-bold">Total: {results.reduce((a, b) => a + b, 0)}</span>
          </div>
          <div className="flex flex-wrap gap-4 justify-center items-center py-4">
            {results.map((val, i) => (
              <div key={i} className={`transform transition-all ${isRolling ? "animate-bounce" : ""}`}>
                {getDiceSvg(val, sides)}
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Riwayat Kocokan</h3>
          <div className="bg-background border border-foreground/15 rounded-lg p-4 font-mono text-xs space-y-2 max-h-40 overflow-auto">
            {history.map((h, i) => (
              <div key={i} className="flex justify-between border-b border-foreground/5 py-1">
                <span>Rolls: [{h.rolls.join(", ")}]</span>
                <span className="font-bold">Total: {h.sum}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
