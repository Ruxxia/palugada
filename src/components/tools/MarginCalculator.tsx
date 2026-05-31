import { useState, useEffect } from "react";

export function MarginCalculator() {
  const [modal, setModal] = useState<number>(10000);
  const [jual, setJual] = useState<number>(15000);
  const [marginPct, setMarginPct] = useState<number>(33.33);
  const [markupPct, setMarkupPct] = useState<number>(50);

  // Calculation mode: 'price' (input modal & jual), 'margin' (input modal & margin %), 'markup' (input modal & markup %)
  const [mode, setMode] = useState<"price" | "margin" | "markup">("price");

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    if (modal <= 0) return;

    if (mode === "price") {
      if (jual <= 0) return;
      const profit = jual - modal;
      const margin = (profit / jual) * 100;
      const markup = (profit / modal) * 100;

      setMarginPct(parseFloat(margin.toFixed(2)));
      setMarkupPct(parseFloat(markup.toFixed(2)));
    } else if (mode === "margin") {
      if (marginPct >= 100) return;
      // Harga Jual = Modal / (1 - Margin/100)
      const calculatedJual = modal / (1 - marginPct / 100);
      const profit = calculatedJual - modal;
      const markup = (profit / modal) * 100;

      setJual(Math.round(calculatedJual));
      setMarkupPct(parseFloat(markup.toFixed(2)));
    } else if (mode === "markup") {
      // Harga Jual = Modal * (1 + Markup/100)
      const calculatedJual = modal * (1 + markupPct / 100);
      const profit = calculatedJual - modal;
      const margin = (profit / calculatedJual) * 100;

      setJual(Math.round(calculatedJual));
      setMarginPct(parseFloat(margin.toFixed(2)));
    }
  }, [modal, jual, marginPct, markupPct, mode]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Input */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <div className="space-y-2">
          <label className="text-sm font-medium block">Metode Perhitungan</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setMode("price")}
              className={`px-4 py-2 border rounded-lg text-xs font-bold transition-colors ${
                mode === "price" ? "bg-foreground text-background border-foreground" : "bg-background border-foreground/15 hover:bg-foreground/5"
              }`}
            >
              Modal & Harga Jual
            </button>
            <button
              onClick={() => setMode("margin")}
              className={`px-4 py-2 border rounded-lg text-xs font-bold transition-colors ${
                mode === "margin" ? "bg-foreground text-background border-foreground" : "bg-background border-foreground/15 hover:bg-foreground/5"
              }`}
            >
              Modal & Target Margin (%)
            </button>
            <button
              onClick={() => setMode("markup")}
              className={`px-4 py-2 border rounded-lg text-xs font-bold transition-colors ${
                mode === "markup" ? "bg-foreground text-background border-foreground" : "bg-background border-foreground/15 hover:bg-foreground/5"
              }`}
            >
              Modal & Target Markup (%)
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-foreground/10">
          <div className="space-y-2">
            <label className="text-sm font-medium">Harga Modal / HPP (Rp)</label>
            <input
              type="number"
              value={modal}
              onChange={(e) => setModal(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
            />
          </div>

          {mode === "price" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Harga Jual (Rp)</label>
              <input
                type="number"
                value={jual}
                onChange={(e) => setJual(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
              />
            </div>
          )}

          {mode === "margin" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Profit Margin (%)</label>
              <input
                type="number"
                step="0.01"
                max="99.9"
                value={marginPct}
                onChange={(e) => setMarginPct(Math.min(99.9, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
              />
            </div>
          )}

          {mode === "markup" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Markup (%)</label>
              <input
                type="number"
                step="0.01"
                value={markupPct}
                onChange={(e) => setMarkupPct(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Output Rincian */}
      <div className="space-y-6">
        <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-xl h-full flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Hasil Kalkulasi Profit</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background border border-foreground/10 p-4 rounded-lg">
                  <span className="text-xs text-foreground/45 block mb-1">Harga Jual</span>
                  <span className="text-xl md:text-2xl font-bold font-mono text-foreground">{formatRupiah(jual)}</span>
                </div>
                <div className="bg-background border border-foreground/10 p-4 rounded-lg">
                  <span className="text-xs text-foreground/45 block mb-1">Keuntungan Bersih (Rp)</span>
                  <span className="text-xl md:text-2xl font-bold font-mono text-primary">{formatRupiah(Math.max(0, jual - modal))}</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-sm pt-4 border-t border-foreground/10">
                <div className="flex justify-between">
                  <span>Gross Profit Margin:</span>
                  <span className="font-bold text-primary">{marginPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Mark-up Persentase:</span>
                  <span className="font-bold text-foreground">{markupPct}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-foreground/10 text-[10px] text-foreground/45 leading-relaxed space-y-1.5">
            <p className="font-bold">Rumus Perhitungan:</p>
            <p>• <strong>Profit Margin:</strong> Dihitung berdasarkan persentase keuntungan dari harga jual produk.<br />
              <code className="font-mono text-[9px]">Margin % = ((Harga Jual - Modal) / Harga Jual) * 100</code>
            </p>
            <p>• <strong>Mark-up:</strong> Dihitung berdasarkan kenaikan harga dari nilai modal/HPP awal.<br />
              <code className="font-mono text-[9px]">Markup % = ((Harga Jual - Modal) / Modal) * 100</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
