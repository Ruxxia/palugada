import { useState, useMemo } from "react";

function terbilangHelper(num: bigint): string {
  const bilangan = [
    "", "satu", "dua", "tiga", "empat", "lima",
    "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"
  ];
  
  if (num === 0n) return "";
  
  let temp = "";
  if (num < 12n) {
    temp = " " + bilangan[Number(num)];
  } else if (num < 20n) {
    temp = terbilangHelper(num - 10n) + " belas";
  } else if (num < 100n) {
    temp = terbilangHelper(num / 10n) + " puluh" + terbilangHelper(num % 10n);
  } else if (num < 200n) {
    temp = " seratus" + terbilangHelper(num - 100n);
  } else if (num < 1000n) {
    temp = terbilangHelper(num / 100n) + " ratus" + terbilangHelper(num % 100n);
  } else if (num < 2000n) {
    temp = " seribu" + terbilangHelper(num - 1000n);
  } else if (num < 1000000n) {
    temp = terbilangHelper(num / 1000n) + " ribu" + terbilangHelper(num % 1000n);
  } else if (num < 1000000000n) {
    temp = terbilangHelper(num / 1000000n) + " juta" + terbilangHelper(num % 1000000n);
  } else if (num < 1000000000000n) {
    temp = terbilangHelper(num / 1000000000n) + " miliar" + terbilangHelper(num % 1000000000n);
  } else if (num < 1000000000000000n) {
    temp = terbilangHelper(num / 1000000000000n) + " triliun" + terbilangHelper(num % 1000000000000n);
  } else if (num < 1000000000000000000n) {
    temp = terbilangHelper(num / 1000000000000000n) + " kuadriliun" + terbilangHelper(num % 1000000000000000n);
  } else {
    return "Angka terlalu besar";
  }

  return temp;
}

export function terbilangIndonesian(num: bigint): string {
  if (num === 0n) return "nol";
  const res = terbilangHelper(num);
  if (res === "Angka terlalu besar") return res;
  return res.replace(/\s+/g, " ").trim();
}

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

function toSentenceCase(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function AngkaTerbilang() {
  const [inputValue, setInputValue] = useState("1235000");
  const [currency, setCurrency] = useState<"rupiah" | "none" | "dollar">("rupiah");
  const [useSaja, setUseSaja] = useState(true);
  const [useSenilai, setUseSenilai] = useState(false);
  const [casing, setCasing] = useState<"title" | "upper" | "lower" | "sentence">("title");
  const [copied, setCopied] = useState(false);

  // Parse input
  const parsed = useMemo(() => {
    let cleanInput = inputValue.trim();
    if (!cleanInput) return null;

    // Remove any currency symbol prefix
    cleanInput = cleanInput.replace(/^(rp|usd|idr|\$)\.?\s*/i, "");

    let hasComma = cleanInput.includes(",");
    let hasDot = cleanInput.includes(".");

    let integerStr = "";
    let decimalStr = "";

    if (hasComma && hasDot) {
      const lastCommaIndex = cleanInput.lastIndexOf(",");
      const lastDotIndex = cleanInput.lastIndexOf(".");
      if (lastCommaIndex > lastDotIndex) {
        integerStr = cleanInput.substring(0, lastCommaIndex).replace(/\./g, "");
        decimalStr = cleanInput.substring(lastCommaIndex + 1);
      } else {
        integerStr = cleanInput.substring(0, lastDotIndex).replace(/,/g, "");
        decimalStr = cleanInput.substring(lastDotIndex + 1);
      }
    } else if (hasComma) {
      const parts = cleanInput.split(",");
      if (parts.length === 2 && (parts[1].length === 2 || parts[1].length === 1)) {
        integerStr = parts[0];
        decimalStr = parts[1];
      } else {
        integerStr = cleanInput.replace(/,/g, "");
      }
    } else if (hasDot) {
      const parts = cleanInput.split(".");
      if (parts.length === 2 && (parts[1].length === 2 || parts[1].length === 1)) {
        integerStr = parts[0];
        decimalStr = parts[1];
      } else {
        integerStr = cleanInput.replace(/\./g, "");
      }
    } else {
      integerStr = cleanInput;
    }

    integerStr = integerStr.replace(/[^\d]/g, "");
    decimalStr = decimalStr.replace(/[^\d]/g, "");

    if (!integerStr) return null;

    try {
      const integerPart = BigInt(integerStr);
      const decimalPart = decimalStr ? Number(decimalStr.substring(0, 2)) : 0;
      return { integerPart, decimalPart, rawDecimalStr: decimalStr };
    } catch {
      return null;
    }
  }, [inputValue]);

  // Generate output text
  const resultText = useMemo(() => {
    if (!parsed) return "";

    const intText = terbilangIndonesian(parsed.integerPart);
    if (intText === "Angka terlalu besar") return "Angka terlalu besar (maksimal di bawah 1 kuadriliun)";

    let finalWords = intText;

    // Currency suffix
    if (currency === "rupiah") {
      finalWords += " rupiah";
    } else if (currency === "dollar") {
      finalWords += " dollar";
    }

    // Decimal part spelling (e.g. 50 sen)
    if (parsed.decimalPart > 0) {
      const decWords = terbilangIndonesian(BigInt(parsed.decimalPart));
      if (currency === "rupiah") {
        finalWords += ` dan ${decWords} sen`;
      } else if (currency === "dollar") {
        finalWords += ` dan ${decWords} sen`;
      } else {
        finalWords += ` koma ${decWords}`;
      }
    }

    // Suffix saja
    if (useSaja && (currency === "rupiah" || currency === "dollar")) {
      finalWords += " saja";
    }

    // Prefix senilai
    if (useSenilai) {
      finalWords = "senilai " + finalWords;
    }

    // Casing
    if (casing === "upper") {
      return finalWords.toUpperCase();
    } else if (casing === "lower") {
      return finalWords.toLowerCase();
    } else if (casing === "sentence") {
      return toSentenceCase(finalWords);
    } else {
      return toTitleCase(finalWords);
    }
  }, [parsed, currency, useSaja, useSenilai, casing]);

  // Formatted currency preview
  const formattedPreview = useMemo(() => {
    if (!parsed) return "";
    try {
      const formattedInt = new Intl.NumberFormat("id-ID").format(parsed.integerPart);
      if (currency === "rupiah") {
        return `Rp ${formattedInt}${parsed.rawDecimalStr ? `,${parsed.rawDecimalStr.padEnd(2, "0").slice(0, 2)}` : ",00"}`;
      } else if (currency === "dollar") {
        return `$ ${formattedInt}${parsed.rawDecimalStr ? `.${parsed.rawDecimalStr.padEnd(2, "0").slice(0, 2)}` : ".00"}`;
      }
      return `${formattedInt}${parsed.rawDecimalStr ? `,${parsed.rawDecimalStr}` : ""}`;
    } catch {
      return "";
    }
  }, [parsed, currency]);

  const copyResult = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (val: string) => {
    setInputValue(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Input Panel */}
      <div className="lg:col-span-6 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">
            Masukkan Nominal Angka
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 1.500.000 atau 1250000"
            className="w-full h-14 px-4 bg-background border border-foreground/15 rounded-xl text-lg font-mono focus:outline-none focus:border-primary shadow-inner"
          />
          {formattedPreview && (
            <div className="text-xs font-mono text-foreground/50 px-1">
              Format Uang: <span className="font-bold text-foreground/70">{formattedPreview}</span>
            </div>
          )}
        </div>

        {/* Preset Buttons */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/40 block">Contoh Nominal</span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "50 Ribu", val: "50000" },
              { label: "1.25 Juta", val: "1250000" },
              { label: "10.5 Juta", val: "10500000" },
              { label: "150 Juta", val: "150000000" },
              { label: "2.5 Miliar", val: "2500000000" },
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset.val)}
                className="px-3 py-1.5 bg-foreground/5 border border-foreground/10 hover:border-primary text-xs font-semibold rounded-lg transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="bg-card border border-foreground/10 p-5 rounded-xl space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold">Opsi Kustomisasi</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Currency Choice */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-foreground/50">Mata Uang Suffix</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full h-10 px-3 bg-background border border-foreground/15 rounded-lg text-xs focus:outline-none focus:border-primary"
              >
                <option value="rupiah">Rupiah (IDR)</option>
                <option value="dollar">Dollar (USD)</option>
                <option value="none">Tanpa Suffix</option>
              </select>
            </div>

            {/* Casing Choice */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-foreground/50">Format Huruf</label>
              <select
                value={casing}
                onChange={(e) => setCasing(e.target.value as any)}
                className="w-full h-10 px-3 bg-background border border-foreground/15 rounded-lg text-xs focus:outline-none focus:border-primary"
              >
                <option value="title">Title Case (Huruf Kapital Setiap Kata)</option>
                <option value="upper">UPPERCASE (HURUF KAPITAL SEMUA)</option>
                <option value="lower">lowercase (huruf kecil semua)</option>
                <option value="sentence">Sentence Case (Kapital Di Awal)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-foreground/5 text-sm">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useSaja}
                disabled={currency === "none"}
                onChange={(e) => setUseSaja(e.target.checked)}
                className="w-4 h-4 rounded border-foreground/30 accent-primary"
              />
              <span className={currency === "none" ? "text-foreground/30" : ""}>Tambahkan kata "Saja" di akhir</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useSenilai}
                onChange={(e) => setUseSenilai(e.target.checked)}
                className="w-4 h-4 rounded border-foreground/30 accent-primary"
              />
              <span>Tambahkan kata "Senilai" di awal</span>
            </label>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="font-display text-lg uppercase border-b border-foreground/10 pb-3">Ejaan Terbilang</h3>

          {/* Spell Output Box */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                readOnly
                value={resultText || "Silakan masukkan nominal angka..."}
                rows={5}
                className="w-full p-4 bg-background border border-foreground/15 rounded-xl text-base font-medium leading-relaxed resize-none focus:outline-none"
              />
            </div>
            <button
              onClick={copyResult}
              disabled={!resultText || resultText.includes("terlalu besar")}
              className="w-full h-12 bg-primary text-white rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-primary/95 transition-colors disabled:opacity-50"
            >
              {copied ? "Copied Ejaan!" : "Salin Ejaan Terbilang"}
            </button>
          </div>
        </div>

        {/* Custom Tip */}
        <div className="bg-primary/5 border border-primary/10 p-5 rounded-xl space-y-2 text-xs text-foreground/75 leading-relaxed">
          <h5 className="font-bold text-primary uppercase tracking-wider">💡 Kegunaan Ejaan Terbilang</h5>
          <p>
            Alat ini mempermudah penulisan nominal uang pada kuitansi, faktur, cek bank, slip setoran, maupun dokumen legal agar terhindar dari manipulasi angka dan kesalahan penafsiran jumlah dana.
          </p>
        </div>
      </div>
    </div>
  );
}
