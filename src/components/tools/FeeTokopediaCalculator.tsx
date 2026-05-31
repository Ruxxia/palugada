import { useState, useEffect } from "react";

export function FeeTokopediaCalculator() {
  const [sellingPrice, setSellingPrice] = useState("100000");
  const [sellerStatus, setSellerStatus] = useState<"pm" | "pm-pro" | "os">("pm");
  const [groupCategory, setGroupCategory] = useState<"A" | "B" | "C" | "D" | "E">("A");
  const [freeShippingRate, setFreeShippingRate] = useState(true); // Bebas Ongkir (usually 4% capped at 10,000)

  const [adminFee, setAdminFee] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [totalDeduction, setTotalDeduction] = useState(0);
  const [finalEarnings, setFinalEarnings] = useState(0);

  useEffect(() => {
    const price = parseFloat(sellingPrice) || 0;

    // Tokopedia Admin rates approx:
    // Power Merchant: A=6.5%, B=5.5%, C=4.5%, D=3.5%, E=2.0%
    // PM Pro: A=6.5%, B=5.5%, C=4.5%, D=3.5%, E=2.0% (mostly same admin fee but PM Pro gets other benefits or slightly lower cap on features)
    // Official Store: A=8.0%, B=7.0%, C=6.0%, D=5.0%, E=3.0%
    let adminRate = 0.045;
    if (sellerStatus === "pm" || sellerStatus === "pm-pro") {
      const rates = { A: 0.065, B: 0.055, C: 0.045, D: 0.035, E: 0.02 };
      adminRate = rates[groupCategory];
    } else {
      // Official Store
      const rates = { A: 0.08, B: 0.07, C: 0.06, D: 0.05, E: 0.03 };
      adminRate = rates[groupCategory];
    }

    const calculatedAdmin = adminRate * price;

    // Bebas Ongkir Tokopedia: 4% of product price, capped at 10,000 for regular PM/PM Pro.
    let calculatedShipping = 0;
    if (freeShippingRate) {
      calculatedShipping = Math.min(0.04 * price, 10000);
    }

    const total = calculatedAdmin + calculatedShipping;
    setAdminFee(calculatedAdmin);
    setShippingFee(calculatedShipping);
    setTotalDeduction(total);
    setFinalEarnings(price - total);
  }, [sellingPrice, sellerStatus, groupCategory, freeShippingRate]);

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
            Status Keanggotaan Seller
          </label>
          <select
            value={sellerStatus}
            onChange={(e: any) => setSellerStatus(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary"
          >
            <option value="pm">Power Merchant</option>
            <option value="pm-pro">Power Merchant PRO</option>
            <option value="os">Official Store</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Kategori Grup Tokopedia
          </label>
          <select
            value={groupCategory}
            onChange={(e: any) => setGroupCategory(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary"
          >
            <option value="A">Kategori A (Buku, Dapur, Fashion, dll)</option>
            <option value="B">Kategori B (Elektronik, Hobi, Olahraga, dll)</option>
            <option value="C">Kategori C (Kecantikan, Kesehatan, dll)</option>
            <option value="D">Kategori D (Komputer, Kamera, dll)</option>
            <option value="E">Kategori E (Logam Mulia, Handphone, dll)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 p-3 border border-foreground/10 rounded-lg bg-card mt-6">
          <input
            type="checkbox"
            id="freeShippingRate"
            checked={freeShippingRate}
            onChange={(e) => setFreeShippingRate(e.target.checked)}
            className="h-4 w-4 text-primary rounded border-foreground/15"
          />
          <label htmlFor="freeShippingRate" className="text-xs font-bold uppercase tracking-wider cursor-pointer">
            Ikut Program Bebas Ongkir (4%)
          </label>
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Estimasi Rincian Fee Tokopedia</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Biaya Layanan Tokopedia</span>
            <span className="text-lg font-bold font-mono text-foreground">{formatRupiah(adminFee)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Biaya Bebas Ongkir</span>
            <span className="text-lg font-bold font-mono text-foreground">{formatRupiah(shippingFee)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Total Biaya Admin & Bebas Ongkir</span>
            <span className="text-lg font-bold font-mono text-destructive">{formatRupiah(totalDeduction)}</span>
          </div>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/25 rounded-lg text-center">
          <span className="block text-xs text-primary/75 font-mono uppercase mb-1">Estimasi Saldo Masuk ke Dompet</span>
          <span className="text-2xl font-bold font-mono text-primary">{formatRupiah(finalEarnings)}</span>
        </div>
      </div>
    </div>
  );
}
