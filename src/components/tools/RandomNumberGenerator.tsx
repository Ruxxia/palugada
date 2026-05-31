import { useState } from "react";

export function RandomNumberGenerator() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [isInteger, setIsInteger] = useState(true);
  const [results, setResults] = useState<number[]>([]);

  const generate = () => {
    const minVal = Math.min(min, max);
    const maxVal = Math.max(min, max);
    const newResults: number[] = [];

    if (isInteger) {
      const range = maxVal - minVal + 1;
      if (!allowDuplicates && count > range) {
        alert("Jumlah angka melebihi rentang yang tersedia tanpa duplikasi!");
        return;
      }

      const pool = Array.from({ length: range }, (_, i) => minVal + i);
      if (!allowDuplicates) {
        // Fisher-Yates shuffle subset
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * (pool.length - i)) + i;
          const temp = pool[i];
          pool[i] = pool[idx];
          pool[idx] = temp;
          newResults.push(pool[i]);
        }
      } else {
        for (let i = 0; i < count; i++) {
          newResults.push(Math.floor(Math.random() * range) + minVal);
        }
      }
    } else {
      // Float generation
      if (!allowDuplicates) {
        // High-precision floats rarely duplicate, but we can do a unique check loop
        const uniqueFloats = new Set<number>();
        let attempts = 0;
        while (uniqueFloats.size < count && attempts < count * 10) {
          const rand = Math.random() * (maxVal - minVal) + minVal;
          uniqueFloats.add(Number(rand.toFixed(4)));
          attempts++;
        }
        newResults.push(...Array.from(uniqueFloats));
      } else {
        for (let i = 0; i < count; i++) {
          const rand = Math.random() * (maxVal - minVal) + minVal;
          newResults.push(Number(rand.toFixed(4)));
        }
      }
    }

    setResults(newResults);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Batas Minimum</label>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Batas Maksimum</label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Jumlah Angka</label>
          <input
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(e) => setCount(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex gap-6 flex-wrap items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isInteger}
            onChange={(e) => setIsInteger(e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-primary border-foreground/20"
          />
          <span className="text-sm font-medium">Bilangan Bulat (Integer)</span>
        </label>
        {isInteger && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allowDuplicates}
              onChange={(e) => setAllowDuplicates(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-foreground/20"
            />
            <span className="text-sm font-medium">Izinkan Duplikasi</span>
          </label>
        )}
      </div>

      <button
        onClick={generate}
        className="bg-foreground text-background px-5 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
      >
        Generate Angka
      </button>

      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Angka</span>
            <button
              onClick={() => navigator.clipboard.writeText(results.join(", "))}
              className="text-xs font-mono uppercase tracking-wider text-primary hover:underline"
            >
              Copy Semua
            </button>
          </div>
          <div className="bg-background border border-foreground/15 rounded-lg p-4 font-mono text-lg flex flex-wrap gap-2 max-h-60 overflow-auto">
            {results.map((num, i) => (
              <span key={i} className="bg-foreground/5 border border-foreground/10 px-3 py-1.5 rounded-lg">
                {num}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
