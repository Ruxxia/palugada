import { useState, useEffect } from "react";

export function FeeShopeeCalculator() {
  const [sellingPrice, setSellingPrice] = useState("100000");
  const [sellerType, setSellerType] = useState<"non-star" | "star" | "mall">("star");
  const [categoryGroup, setCategoryGroup] = useState<"A" | "B" | "C" | "D" | "E">("A");
  const [freeShipping, setFreeShipping] = useState(true);
  const [cashbackExtra, setCashbackExtra] = useState(false);

  const [adminFee, setAdminFee] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [cbExtraFee, setCbExtraFee] = useState(0);
  const [totalDeduction, setTotalDeduction] = useState(0);
  const [finalEarnings, setFinalEarnings] = useState(0);

  useEffect(() => {
    const price = parseFloat(sellingPrice) || 0;

    // Shopee Admin Fee Rates (Est. 2024/2025 rates)
    // Non-Star: A=6.0%, B=5.0%, C=5.0%, D=3.8%, E=3.8%
    // Star/Star+: A=6.5%, B=5.5%, C=5.5%, D=4.3%, E=4.3%
    // Mall: A=8.5%, B=7.5%, C=6.5%, D=5.5%, E=4.5%
    let adminRate = 0.05;
    if (sellerType === "non-star") {
      const rates = { A: 0.06, B: 0.05, C: 0.05, D: 0.038, E: 0.038 };
      adminRate = rates[categoryGroup];
    } else if (sellerType === "star") {
      const rates = { A: 0.065, B: 0.055, C: 0.055, D: 0.043, E: 0.043 };
      adminRate = rates[categoryGroup];
    } else {
      // Mall
      const rates = { A: 0.085, B: 0.075, C: 0.065, D: 0.055, E: 0.045 };
      adminRate = rates[categoryGroup];
    }

    const calculatedAdmin = adminRate * price;

    // Free Shipping (Gratis Ongkir XTRA) fee: approx 4% for Star/Non-Star, capped at 10000
    let calculatedShipping = 0;
    if (freeShipping) {
      calculatedShipping = Math.min(0.04 * price, 10000);
    }

    // Cashback XTRA fee: approx 2% for Star/Non-Star, capped at 10000
    let calculatedCbExtra = 0;
    if (cashbackExtra) {
      calculatedCbExtra = Math.min(0.02 * price, 10000);
    }

    const total = calculatedAdmin + calculatedShipping + calculatedCbExtra;
    setAdminFee(calculatedAdmin);
    setShippingFee(calculatedShipping);
    setCbExtraFee(calculatedCbExtra);
    setTotalDeduction(total);
    setFinalEarnings(price - total);
  }, [sellingPrice, sellerType, categoryGroup, freeShipping, cashbackExtra]);

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
            Tipe Penjual
          </label>
          <select
            value={sellerType}
            onChange={(e: any) => setSellerType(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary"
          >
            <option value="non-star">Non-Star Seller (Regular)</option>
            <option value="star">Star / Star+ Seller</option>
            <option value="mall">Shopee Mall Seller</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Grup Kategori Produk
          </label>
          <select
            value={categoryGroup}
            onChange={(e: any) => setCategoryGroup(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary"
          >
            <option value="A">Kategori A (Fashion, Kecantikan, dll)</option>
            <option value="B">Kategori B (Otomotif, Elektronik, dll)</option>
            <option value="C">Kategori C (Kesehatan, Makanan, dll)</option>
            <option value="D">Kategori D (Perlengkapan Rumah, dll)</option>
            <option value="E">Kategori E (Alat Tulis, Mainan, dll)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 p-3 border border-foreground/10 rounded-lg bg-card mt-6">
          <input
            type="checkbox"
            id="freeShipping"
            checked={freeShipping}
            onChange={(e) => setFreeShipping(e.target.checked)}
            className="h-4 w-4 text-primary rounded border-foreground/15"
          />
          <label htmlFor="freeShipping" className="text-xs font-bold uppercase tracking-wider cursor-pointer">
            Ikut Gratis Ongkir XTRA (4%)
          </label>
        </div>

        <div className="flex items-center gap-2 p-3 border border-foreground/10 rounded-lg bg-card mt-6">
          <input
            type="checkbox"
            id="cashbackExtra"
            checked={cashbackExtra}
            onChange={(e) => setCashbackExtra(e.target.checked)}
            className="h-4 w-4 text-primary rounded border-foreground/15"
          />
          <label htmlFor="cashbackExtra" className="text-xs font-bold uppercase tracking-wider cursor-pointer">
            Ikut Cashback XTRA (2%)
          </label>
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Estimasi Rincian Fee & Potongan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Biaya Administrasi</span>
            <span className="text-lg font-bold font-mono text-foreground">{formatRupiah(adminFee)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Fee Gratis Ongkir XTRA</span>
            <span className="text-lg font-bold font-mono text-foreground">{formatRupiah(shippingFee)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Fee Cashback XTRA</span>
            <span className="text-lg font-bold font-mono text-foreground">{formatRupiah(cbExtraFee)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Total Biaya & Potongan</span>
            <span className="text-lg font-bold font-mono text-destructive">{formatRupiah(totalDeduction)}</span>
          </div>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/25 rounded-lg text-center">
          <span className="block text-xs text-primary/75 font-mono uppercase mb-1">Total Pendapatan Bersih Seller</span>
          <span className="text-2xl font-bold font-mono text-primary">{formatRupiah(finalEarnings)}</span>
        </div>
      </div>
    </div>
  );
}
