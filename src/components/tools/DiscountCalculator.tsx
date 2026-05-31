import { useState, useEffect } from "react";

export function DiscountCalculator() {
  const [originalPrice, setOriginalPrice] = useState("100000");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [additionalDiscount, setAdditionalDiscount] = useState("0");
  const [savedAmount, setSavedAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    const price = parseFloat(originalPrice) || 0;
    const disc1 = parseFloat(discountPercent) || 0;
    const disc2 = parseFloat(additionalDiscount) || 0;

    // Apply first discount
    const priceAfterDisc1 = price - (disc1 / 100) * price;
    // Apply second discount (stacking: X% + Y%)
    const final = priceAfterDisc1 - (disc2 / 100) * priceAfterDisc1;
    const saved = price - final;

    setFinalPrice(final);
    setSavedAmount(saved);
  }, [originalPrice, discountPercent, additionalDiscount]);

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
            Harga Asli (Rp)
          </label>
          <input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 100000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Diskon (%)
          </label>
          <input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 10"
            max="100"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Diskon Tambahan (% + % )
          </label>
          <input
            type="number"
            value={additionalDiscount}
            onChange={(e) => setAdditionalDiscount(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 5"
            max="100"
          />
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Perhitungan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Harga Setelah Diskon</span>
            <span className="text-2xl font-bold font-mono text-primary">{formatRupiah(finalPrice)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Total Hemat</span>
            <span className="text-2xl font-bold font-mono text-accent">{formatRupiah(savedAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
