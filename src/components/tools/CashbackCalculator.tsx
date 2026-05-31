import { useState, useEffect } from "react";

export function CashbackCalculator() {
  const [purchaseAmount, setPurchaseAmount] = useState("200000");
  const [cashbackPercent, setCashbackPercent] = useState("5");
  const [maxCashback, setMaxCashback] = useState("10000");
  const [minPurchase, setMinPurchase] = useState("50000");

  const [receivedCashback, setReceivedCashback] = useState(0);
  const [effectiveDiscount, setEffectiveDiscount] = useState(0);
  const [meetsRequirement, setMeetsRequirement] = useState(true);

  useEffect(() => {
    const amount = parseFloat(purchaseAmount) || 0;
    const cbPercent = parseFloat(cashbackPercent) || 0;
    const maxCb = parseFloat(maxCashback) || 0;
    const minPur = parseFloat(minPurchase) || 0;

    if (amount < minPur) {
      setReceivedCashback(0);
      setEffectiveDiscount(0);
      setMeetsRequirement(false);
      return;
    }

    setMeetsRequirement(true);
    let calculated = (cbPercent / 100) * amount;
    if (maxCb > 0 && calculated > maxCb) {
      calculated = maxCb;
    }

    setReceivedCashback(calculated);
    if (amount > 0) {
      setEffectiveDiscount((calculated / amount) * 100);
    } else {
      setEffectiveDiscount(0);
    }
  }, [purchaseAmount, cashbackPercent, maxCashback, minPurchase]);

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
            Nilai Belanja (Rp)
          </label>
          <input
            type="number"
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 200000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Persentase Cashback (%)
          </label>
          <input
            type="number"
            value={cashbackPercent}
            onChange={(e) => setCashbackPercent(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 5"
            max="100"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Maksimum Cashback (Rp)
          </label>
          <input
            type="number"
            value={maxCashback}
            onChange={(e) => setMaxCashback(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 10000 (0 jika tak terbatas)"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Minimum Pembelian (Rp)
          </label>
          <input
            type="number"
            value={minPurchase}
            onChange={(e) => setMinPurchase(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 50000"
          />
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Perhitungan</h3>
        {!meetsRequirement ? (
          <div className="p-4 bg-destructive/10 border border-destructive/25 rounded-lg text-sm text-destructive font-semibold text-center">
            Nilai belanja tidak memenuhi syarat minimum pembelian ({formatRupiah(parseFloat(minPurchase) || 0)}).
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-background border border-foreground/10 rounded-lg">
              <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Cashback yang Didapatkan</span>
              <span className="text-2xl font-bold font-mono text-primary">{formatRupiah(receivedCashback)}</span>
            </div>
            <div className="p-4 bg-background border border-foreground/10 rounded-lg">
              <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Persentase Diskon Efektif</span>
              <span className="text-2xl font-bold font-mono text-accent">{effectiveDiscount.toFixed(2)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
