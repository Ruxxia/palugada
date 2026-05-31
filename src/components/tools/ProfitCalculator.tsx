import { useState, useEffect } from "react";

export function ProfitCalculator() {
  const [revenue, setRevenue] = useState("10000000");
  const [cogs, setCogs] = useState("6000000");
  const [expenses, setExpenses] = useState("1500000");

  const [grossProfit, setGrossProfit] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [grossMargin, setGrossMargin] = useState(0);
  const [netMargin, setNetMargin] = useState(0);

  useEffect(() => {
    const rev = parseFloat(revenue) || 0;
    const cg = parseFloat(cogs) || 0;
    const exp = parseFloat(expenses) || 0;

    const gross = rev - cg;
    const net = gross - exp;

    setGrossProfit(gross);
    setNetProfit(net);

    if (rev > 0) {
      setGrossMargin((gross / rev) * 100);
      setNetMargin((net / rev) * 100);
    } else {
      setGrossMargin(0);
      setNetMargin(0);
    }
  }, [revenue, cogs, expenses]);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Total Pendapatan / Omset (Rp)
          </label>
          <input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 10000000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Harga Pokok Penjualan / HPP (Rp)
          </label>
          <input
            type="number"
            value={cogs}
            onChange={(e) => setCogs(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 6000000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Biaya Operasional / Pengeluaran (Rp)
          </label>
          <input
            type="number"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 1500000"
          />
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Analisis Profit</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Gross Profit (Laba Kotor)</span>
            <span className="text-xl font-bold font-mono text-foreground">{formatRupiah(grossProfit)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Net Profit (Laba Bersih)</span>
            <span className="text-xl font-bold font-mono text-primary">{formatRupiah(netProfit)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Gross Margin (%)</span>
            <span className="text-xl font-bold font-mono text-foreground">{grossMargin.toFixed(2)}%</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Net Margin (%)</span>
            <span className="text-xl font-bold font-mono text-accent">{netMargin.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
