import { useState, useEffect } from "react";

export function ZakatProfesiCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState("10000000");
  const [otherIncome, setOtherIncome] = useState("0");
  const [coreExpenses, setCoreExpenses] = useState("0");
  const [goldPrice, setGoldPrice] = useState("1300000"); // Standard gold price per gram in IDR

  const [totalIncome, setTotalIncome] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [nisabLimit, setNisabLimit] = useState(0);
  const [isObliged, setIsObliged] = useState(false);
  const [zakatDue, setZakatDue] = useState(0);

  useEffect(() => {
    const inc = parseFloat(monthlyIncome) || 0;
    const oth = parseFloat(otherIncome) || 0;
    const exp = parseFloat(coreExpenses) || 0;
    const gold = parseFloat(goldPrice) || 1200000;

    const total = inc + oth;
    const net = Math.max(0, total - exp);
    setTotalIncome(total);
    setNetIncome(net);

    // Nisab of Zakat Profesi: Equivalent to 85 grams of gold per year / 12 months
    const monthlyNisab = (85 * gold) / 12;
    setNisabLimit(monthlyNisab);

    // Check if net income is above monthly nisab limit
    if (net >= monthlyNisab) {
      setIsObliged(true);
      setZakatDue(net * 0.025);
    } else {
      setIsObliged(false);
      setZakatDue(0);
    }
  }, [monthlyIncome, otherIncome, coreExpenses, goldPrice]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Pendapatan Bulanan (Rp)
          </label>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 10000000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Bonus / Pendapatan Lain (Rp)
          </label>
          <input
            type="number"
            value={otherIncome}
            onChange={(e) => setOtherIncome(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 0"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Pengeluaran Pokok Bulanan (Rp)
          </label>
          <input
            type="number"
            value={coreExpenses}
            onChange={(e) => setCoreExpenses(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Kebutuhan pokok keluarga"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Harga Emas Saat Ini (Rp/gram)
          </label>
          <input
            type="number"
            value={goldPrice}
            onChange={(e) => setGoldPrice(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 1300000"
          />
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Perhitungan Zakat Profesi</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Batas Nisab Bulanan (85g Emas / 12)</span>
            <span className="text-xl font-bold font-mono text-foreground">{formatRupiah(nisabLimit)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Status Kewajiban Zakat</span>
            <span className={`text-lg font-bold ${isObliged ? "text-primary" : "text-foreground/50"}`}>
              {isObliged ? "Wajib Membayar Zakat" : "Belum Wajib Membayar Zakat"}
            </span>
          </div>
        </div>

        {isObliged && (
          <div className="p-5 bg-primary/5 border border-primary/25 rounded-lg text-center">
            <span className="block text-xs text-primary/75 font-mono uppercase mb-1">Jumlah Zakat Profesi Yang Harus Dibayar</span>
            <span className="text-3xl font-bold font-mono text-primary">{formatRupiah(zakatDue)} <span className="text-xs text-foreground/60">/bulan</span></span>
          </div>
        )}
      </div>
    </div>
  );
}
