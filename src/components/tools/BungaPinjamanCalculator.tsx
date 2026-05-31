import { useState, useEffect } from "react";

export function BungaPinjamanCalculator() {
  const [loanAmount, setLoanAmount] = useState("10000000");
  const [interestRate, setInterestRate] = useState("12");
  const [tenorMonths, setTenorMonths] = useState("12");
  const [interestType, setInterestType] = useState<"flat" | "effective">("flat");

  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  useEffect(() => {
    const loan = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) || 0;
    const months = parseFloat(tenorMonths) || 0;

    if (loan > 0 && rate > 0 && months > 0) {
      if (interestType === "flat") {
        const totalInt = loan * (rate / 100) * (months / 12);
        const total = loan + totalInt;
        setTotalInterest(totalInt);
        setTotalPayment(total);
        setMonthlyPayment(total / months);
      } else {
        // Effective / Annuity
        const monthlyRate = rate / 12 / 100;
        const monthly = (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        setMonthlyPayment(monthly);
        setTotalPayment(monthly * months);
        setTotalInterest(monthly * months - loan);
      }
    } else {
      setMonthlyPayment(0);
      setTotalInterest(0);
      setTotalPayment(0);
    }
  }, [loanAmount, interestRate, tenorMonths, interestType]);

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
      <div className="flex gap-2 p-1 bg-foreground/5 rounded-lg max-w-xs">
        <button
          onClick={() => setInterestType("flat")}
          className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
            interestType === "flat" ? "bg-foreground text-background" : "hover:text-foreground"
          }`}
        >
          Flat (Tetap)
        </button>
        <button
          onClick={() => setInterestType("effective")}
          className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
            interestType === "effective" ? "bg-foreground text-background" : "hover:text-foreground"
          }`}
        >
          Effective (Anuitas)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Jumlah Pinjaman (Rp)
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 10000000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Suku Bunga per Tahun (%)
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 12"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Tenor (Bulan)
          </label>
          <input
            type="number"
            value={tenorMonths}
            onChange={(e) => setTenorMonths(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 12"
          />
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Perhitungan Bunga</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Angsuran Bulanan</span>
            <span className="text-lg font-bold font-mono text-primary">{formatRupiah(monthlyPayment)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Total Bunga Pinjaman</span>
            <span className="text-lg font-bold font-mono text-destructive">{formatRupiah(totalInterest)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Total Pembayaran Pokok + Bunga</span>
            <span className="text-lg font-bold font-mono text-accent">{formatRupiah(totalPayment)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
