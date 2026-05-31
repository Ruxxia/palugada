import { useState, useEffect } from "react";

export function HargaJualCalculator() {
  const [cost, setCost] = useState("50000");
  const [markupPercent, setMarkupPercent] = useState("30");
  const [method, setMethod] = useState<"markup" | "margin">("markup");
  const [sellingPrice, setSellingPrice] = useState(0);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    const c = parseFloat(cost) || 0;
    const p = parseFloat(markupPercent) || 0;

    let price = 0;
    if (method === "markup") {
      price = c * (1 + p / 100);
    } else {
      // margin method
      price = p >= 100 ? 0 : c / (1 - p / 100);
    }

    setSellingPrice(price);
    setProfit(price - c);
  }, [cost, markupPercent, method]);

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
          onClick={() => setMethod("markup")}
          className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
            method === "markup" ? "bg-foreground text-background" : "hover:text-foreground"
          }`}
        >
          Markup
        </button>
        <button
          onClick={() => setMethod("margin")}
          className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
            method === "margin" ? "bg-foreground text-background" : "hover:text-foreground"
          }`}
        >
          Margin Target
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Harga Modal / COGS (Rp)
          </label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 50000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            {method === "markup" ? "Markup (%)" : "Target Margin (%)"}
          </label>
          <input
            type="number"
            value={markupPercent}
            onChange={(e) => setMarkupPercent(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 30"
            max="100"
          />
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Perhitungan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Rekomendasi Harga Jual</span>
            <span className="text-2xl font-bold font-mono text-primary">{formatRupiah(sellingPrice)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Keuntungan per Produk</span>
            <span className="text-2xl font-bold font-mono text-accent">{formatRupiah(profit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
