import { useState, useEffect } from "react";

export function RoiCalculator() {
  const [initialInvestment, setInitialInvestment] = useState("50000000");
  const [finalValue, setFinalValue] = useState("65000000");

  const [netProfit, setNetProfit] = useState(0);
  const [roiPercent, setRoiPercent] = useState(0);

  useEffect(() => {
    const init = parseFloat(initialInvestment) || 0;
    const fin = parseFloat(finalValue) || 0;

    const profit = fin - init;
    setNetProfit(profit);

    if (init > 0) {
      setRoiPercent((profit / init) * 100);
    } else {
      setRoiPercent(0);
    }
  }, [initialInvestment, finalValue]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Nilai Investasi Awal (Rp)
          </label>
          <input
            type="number"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 50000000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Nilai Pengembalian Akhir (Rp)
          </label>
          <input
            type="number"
            value={finalValue}
            onChange={(e) => setFinalValue(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 65000000"
          />
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Analisis ROI</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Keuntungan Bersih</span>
            <span className="text-2xl font-bold font-mono text-foreground">{formatRupiah(netProfit)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Return on Investment (ROI)</span>
            <span className={`text-2xl font-bold font-mono ${roiPercent >= 0 ? "text-accent" : "text-destructive"}`}>
              {roiPercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
