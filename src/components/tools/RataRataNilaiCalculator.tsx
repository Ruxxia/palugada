import { useState, useEffect } from "react";

export function RataRataNilaiCalculator() {
  const [inputVal, setInputVal] = useState("80, 85, 90, 75, 95");
  const [average, setAverage] = useState(0);
  const [median, setMedian] = useState(0);
  const [minVal, setMinVal] = useState(0);
  const [maxVal, setMaxVal] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Parse numbers from comma, space, or newline separated string
    const parsed = inputVal
      .split(/[\s,;\n]+/)
      .map((num) => parseFloat(num))
      .filter((num) => !isNaN(num));

    setCount(parsed.length);

    if (parsed.length > 0) {
      // Sum & Average
      const sum = parsed.reduce((a, b) => a + b, 0);
      setAverage(sum / parsed.length);

      // Min & Max
      setMinVal(Math.min(...parsed));
      setMaxVal(Math.max(...parsed));

      // Median
      const sorted = [...parsed].sort((a, b) => a - b);
      const half = Math.floor(sorted.length / 2);
      if (sorted.length % 2 !== 0) {
        setMedian(sorted[half]);
      } else {
        setMedian((sorted[half - 1] + sorted[half]) / 2.0);
      }
    } else {
      setAverage(0);
      setMedian(0);
      setMinVal(0);
      setMaxVal(0);
    }
  }, [inputVal]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
          Masukkan Daftar Nilai (pisahkan dengan koma, spasi, atau baris baru)
        </label>
        <textarea
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="w-full h-24 p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary text-sm"
          placeholder="Contoh: 80, 85, 90, 75, 95"
        />
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Analisis Rata-Rata & Statistik</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-3 bg-background border border-foreground/10 rounded-lg text-center">
            <span className="block text-[10px] text-foreground/50 font-mono uppercase mb-1">Rata-Rata</span>
            <span className="text-xl font-bold font-mono text-primary">{average.toFixed(2).replace(/\.00$/, "")}</span>
          </div>
          <div className="p-3 bg-background border border-foreground/10 rounded-lg text-center">
            <span className="block text-[10px] text-foreground/50 font-mono uppercase mb-1">Median</span>
            <span className="text-xl font-bold font-mono text-foreground">{median.toFixed(2).replace(/\.00$/, "")}</span>
          </div>
          <div className="p-3 bg-background border border-foreground/10 rounded-lg text-center">
            <span className="block text-[10px] text-foreground/50 font-mono uppercase mb-1">Nilai Min</span>
            <span className="text-xl font-bold font-mono text-foreground">{minVal}</span>
          </div>
          <div className="p-3 bg-background border border-foreground/10 rounded-lg text-center">
            <span className="block text-[10px] text-foreground/50 font-mono uppercase mb-1">Nilai Max</span>
            <span className="text-xl font-bold font-mono text-foreground">{maxVal}</span>
          </div>
          <div className="p-3 bg-background border border-foreground/10 rounded-lg text-center col-span-2 sm:col-span-1">
            <span className="block text-[10px] text-foreground/50 font-mono uppercase mb-1">Jumlah Data</span>
            <span className="text-xl font-bold font-mono text-accent">{count}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
