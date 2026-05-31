import { useState, useEffect } from "react";

export function KprCalculator() {
  const [propertyPrice, setPropertyPrice] = useState("500000000");
  const [downPayment, setDownPayment] = useState("100000000");
  const [interestRate, setInterestRate] = useState("7.5");
  const [tenorYears, setTenorYears] = useState("15");

  const [loanAmount, setLoanAmount] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  useEffect(() => {
    const price = parseFloat(propertyPrice) || 0;
    const dp = parseFloat(downPayment) || 0;
    const rate = parseFloat(interestRate) || 0;
    const years = parseFloat(tenorYears) || 0;

    const loan = Math.max(0, price - dp);
    setLoanAmount(loan);

    if (loan > 0 && rate > 0 && years > 0) {
      const monthlyRate = rate / 12 / 100;
      const totalMonths = years * 12;
      const monthly = (loan * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      
      setMonthlyPayment(monthly);
      setTotalPayment(monthly * totalMonths);
      setTotalInterest(monthly * totalMonths - loan);
    } else {
      setMonthlyPayment(0);
      setTotalPayment(0);
      setTotalInterest(0);
    }
  }, [propertyPrice, downPayment, interestRate, tenorYears]);

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
            Harga Properti (Rp)
          </label>
          <input
            type="number"
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 500000000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Uang Muka / Down Payment (Rp)
          </label>
          <input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 100000000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Suku Bunga Tahunan (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 7.5"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Jangka Waktu / Tenor (Tahun)
          </label>
          <input
            type="number"
            value={tenorYears}
            onChange={(e) => setTenorYears(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 15"
          />
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Perhitungan KPR</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Jumlah Pinjaman Pokok</span>
            <span className="text-lg font-bold font-mono text-foreground">{formatRupiah(loanAmount)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Angsuran per Bulan</span>
            <span className="text-lg font-bold font-mono text-primary">{formatRupiah(monthlyPayment)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Total Bunga Dibayarkan</span>
            <span className="text-lg font-bold font-mono text-destructive">{formatRupiah(totalInterest)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Total Biaya Pokok + Bunga</span>
            <span className="text-lg font-bold font-mono text-accent">{formatRupiah(totalPayment)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
