import { useState, useEffect } from "react";

export function FeeTikTokShopCalculator() {
  const [sellingPrice, setSellingPrice] = useState("100000");
  const [category, setCategory] = useState<"A" | "B" | "C" | "D" | "E">("A");
  const [campaignFee, setCampaignFee] = useState(false); // Extra discount program or campaign fee (typically ~3%)

  const [commissionFee, setCommissionFee] = useState(0);
  const [transactionFee, setTransactionFee] = useState(0);
  const [totalDeduction, setTotalDeduction] = useState(0);
  const [finalEarnings, setFinalEarnings] = useState(0);

  useEffect(() => {
    const price = parseFloat(sellingPrice) || 0;

    // Commission fee rates:
    // A=6.0% (Fashion, Accessories), B=5.0% (Beauty, Health), C=4.0% (Home & Living), D=3.0% (Electronics), E=2.0% (FMCG/Groceries)
    const rates = { A: 0.06, B: 0.05, C: 0.04, D: 0.03, E: 0.02 };
    const commissionRate = rates[category];
    const commFee = commissionRate * price;

    // Transaction fee: 2.0% flat standard
    const transFee = 0.02 * price;

    // Campaign fee if applicable: 3%
    const campFee = campaignFee ? 0.03 * price : 0;

    const total = commFee + transFee + campFee;
    setCommissionFee(commFee);
    setTransactionFee(transFee + campFee); // Combine trans + campaign
    setTotalDeduction(total);
    setFinalEarnings(price - total);
  }, [sellingPrice, category, campaignFee]);

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
            Harga Jual Produk (Rp)
          </label>
          <input
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 100000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Kategori Produk TikTok Shop
          </label>
          <select
            value={category}
            onChange={(e: any) => setCategory(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary"
          >
            <option value="A">Fashion, Sepatu, Aksesoris (6.0%)</option>
            <option value="B">Kecantikan & Perawatan Diri (5.0%)</option>
            <option value="C">Peralatan Rumah Tangga, Hobi (4.0%)</option>
            <option value="D">Peralatan Elektronik, HP (3.0%)</option>
            <option value="E">Makanan & Minuman, Kebutuhan Pokok (2.0%)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 border border-foreground/10 rounded-lg bg-card max-w-sm">
        <input
          type="checkbox"
          id="campaignFee"
          checked={campaignFee}
          onChange={(e) => setCampaignFee(e.target.checked)}
          className="h-4 w-4 text-primary rounded border-foreground/15"
        />
        <label htmlFor="campaignFee" className="text-xs font-bold uppercase tracking-wider cursor-pointer">
          Ikut Campaign / Voucher Program (3%)
        </label>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Analisis Fee</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Komisi Penjualan</span>
            <span className="text-lg font-bold font-mono text-foreground">{formatRupiah(commissionFee)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Biaya Transaksi / Pembayaran</span>
            <span className="text-lg font-bold font-mono text-foreground">{formatRupiah(transactionFee)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Total Potongan Admin</span>
            <span className="text-lg font-bold font-mono text-destructive">{formatRupiah(totalDeduction)}</span>
          </div>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/25 rounded-lg text-center">
          <span className="block text-xs text-primary/75 font-mono uppercase mb-1">Pendapatan Bersih yang Diterima</span>
          <span className="text-2xl font-bold font-mono text-primary">{formatRupiah(finalEarnings)}</span>
        </div>
      </div>
    </div>
  );
}
