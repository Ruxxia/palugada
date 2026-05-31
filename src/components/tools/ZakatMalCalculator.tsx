import { useState, useEffect } from "react";

export function ZakatMalCalculator() {
  const [cashSavings, setCashSavings] = useState("50000000");
  const [goldSilver, setGoldSilver] = useState("20000000");
  const [stocksInvestments, setStocksInvestments] = useState("30000000");
  const [businessAssets, setBusinessAssets] = useState("0");
  const [debtsLiabilities, setDebtsLiabilities] = useState("0");
  const [goldPrice, setGoldPrice] = useState("1300000"); // Standard gold price per gram in IDR

  const [totalAssets, setTotalAssets] = useState(0);
  const [netAssets, setNetAssets] = useState(0);
  const [nisabLimit, setNisabLimit] = useState(0);
  const [isObliged, setIsObliged] = useState(false);
  const [zakatDue, setZakatDue] = useState(0);

  useEffect(() => {
    const cash = parseFloat(cashSavings) || 0;
    const gs = parseFloat(goldSilver) || 0;
    const stock = parseFloat(stocksInvestments) || 0;
    const business = parseFloat(businessAssets) || 0;
    const debt = parseFloat(debtsLiabilities) || 0;
    const gold = parseFloat(goldPrice) || 1200000;

    const total = cash + gs + stock + business;
    const net = Math.max(0, total - debt);
    setTotalAssets(total);
    setNetAssets(net);

    // Nisab equivalent: 85 grams of gold
    const nisab = 85 * gold;
    setNisabLimit(nisab);

    if (net >= nisab) {
      setIsObliged(true);
      setZakatDue(net * 0.025);
    } else {
      setIsObliged(false);
      setZakatDue(0);
    }
  }, [cashSavings, goldSilver, stocksInvestments, businessAssets, debtsLiabilities, goldPrice]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Uang Tunai, Tabungan, Deposito (Rp)
          </label>
          <input
            type="number"
            value={cashSavings}
            onChange={(e) => setCashSavings(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 50000000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Nilai Emas & Perak (Rp)
          </label>
          <input
            type="number"
            value={goldSilver}
            onChange={(e) => setGoldSilver(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 20000000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Saham, Reksadana & Investasi (Rp)
          </label>
          <input
            type="number"
            value={stocksInvestments}
            onChange={(e) => setStocksInvestments(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 30000000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Aset Dagang / Usaha Neto (Rp)
          </label>
          <input
            type="number"
            value={businessAssets}
            onChange={(e) => setBusinessAssets(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 0"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Hutang Jatuh Tempo (Rp)
          </label>
          <input
            type="number"
            value={debtsLiabilities}
            onChange={(e) => setDebtsLiabilities(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Hutang yang harus dibayar saat ini"
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
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Perhitungan Zakat Mal</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Aset Bersih (Harta - Hutang)</span>
            <span className="text-lg font-bold font-mono text-foreground">{formatRupiah(netAssets)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Batas Nisab (85 gram Emas)</span>
            <span className="text-lg font-bold font-mono text-foreground">{formatRupiah(nisabLimit)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Status Kewajiban Zakat Mal</span>
            <span className={`text-lg font-bold ${isObliged ? "text-primary" : "text-foreground/50"}`}>
              {isObliged ? "Wajib Membayar Zakat" : "Belum Wajib Membayar Zakat"}
            </span>
          </div>
        </div>

        {isObliged && (
          <div className="p-5 bg-primary/5 border border-primary/25 rounded-lg text-center">
            <span className="block text-xs text-primary/75 font-mono uppercase mb-1">Jumlah Zakat Mal Yang Harus Ditunaikan</span>
            <span className="text-3xl font-bold font-mono text-primary">{formatRupiah(zakatDue)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
