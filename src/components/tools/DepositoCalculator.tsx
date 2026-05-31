import { useState, useEffect } from "react";

export function DepositoCalculator() {
  const [principal, setPrincipal] = useState("10000000");
  const [interestRate, setInterestRate] = useState("5.5");
  const [termMonths, setTermMonths] = useState("12");
  const [taxPercent, setTaxPercent] = useState("20"); // 20% standard tax for interest in ID

  const [grossInterest, setGrossInterest] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [netInterest, setNetInterest] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const p = parseFloat(principal) || 0;
    const rate = parseFloat(interestRate) || 0;
    const months = parseFloat(termMonths) || 0;
    const tax = parseFloat(taxPercent) || 0;

    const gross = p * (rate / 100) * (months / 12);
    const taxAmt = gross * (tax / 100);
    const net = gross - taxAmt;

    setGrossInterest(gross);
    setTaxAmount(taxAmt);
    setNetInterest(net);
    setTotalValue(p + net);
  }, [principal, interestRate, termMonths, taxPercent]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Pokok Deposito (Rp)
          </label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 10000000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Suku Bunga Deposito (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 5.5"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Jangka Waktu (Bulan)
          </label>
          <input
            type="number"
            value={termMonths}
            onChange={(e) => setTermMonths(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 12"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Pajak Bunga (%)
          </label>
          <input
            type="number"
            value={taxPercent}
            onChange={(e) => setTaxPercent(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 20"
          />
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Perhitungan Deposito</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Bunga Kotor (Gross)</span>
            <span className="text-lg font-bold font-mono text-foreground">{formatRupiah(grossInterest)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Pajak Atas Bunga</span>
            <span className="text-lg font-bold font-mono text-destructive">{formatRupiah(taxAmount)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Bunga Bersih (Net)</span>
            <span className="text-lg font-bold font-mono text-accent">{formatRupiah(netInterest)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Total Dana Saat Jatuh Tempo</span>
            <span className="text-lg font-bold font-mono text-primary">{formatRupiah(totalValue)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
