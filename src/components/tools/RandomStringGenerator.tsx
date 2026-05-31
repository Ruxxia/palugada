import { useState } from "react";

export function RandomStringGenerator() {
  const [length, setLength] = useState(12);
  const [count, setCount] = useState(5);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSpecial, setUseSpecial] = useState(false);
  const [customChars, setCustomChars] = useState("");
  const [results, setResults] = useState<string[]>([]);

  const generate = () => {
    let charset = customChars;
    if (!charset) {
      if (useUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (useLower) charset += "abcdefghijklmnopqrstuvwxyz";
      if (useNumbers) charset += "0123456789";
      if (useSpecial) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    }

    if (!charset) {
      alert("Pilih setidaknya satu jenis karakter atau isi karakter kustom!");
      return;
    }

    const newResults: string[] = [];
    for (let c = 0; c < count; c++) {
      let str = "";
      for (let l = 0; l < length; l++) {
        const randIndex = Math.floor(Math.random() * charset.length);
        str += charset[randIndex];
      }
      newResults.push(str);
    }
    setResults(newResults);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Panjang Karakter</label>
          <input
            type="number"
            min={1}
            max={500}
            value={length}
            onChange={(e) => setLength(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Jumlah String</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Kumpulan Karakter (Charset)</span>
        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useUpper}
              disabled={!!customChars}
              onChange={(e) => setUseUpper(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-foreground/20"
            />
            <span className="text-sm font-medium">A-Z (Uppercase)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useLower}
              disabled={!!customChars}
              onChange={(e) => setUseLower(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-foreground/20"
            />
            <span className="text-sm font-medium">a-z (Lowercase)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useNumbers}
              disabled={!!customChars}
              onChange={(e) => setUseNumbers(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-foreground/20"
            />
            <span className="text-sm font-medium">0-9 (Numbers)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useSpecial}
              disabled={!!customChars}
              onChange={(e) => setUseSpecial(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-foreground/20"
            />
            <span className="text-sm font-medium">Simbol (!@#...)</span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Karakter Kustom (Opsional)</label>
        <input
          type="text"
          value={customChars}
          onChange={(e) => setCustomChars(e.target.value)}
          placeholder="Contoh: abcde12345"
          className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
        />
        <p className="text-[10px] text-foreground/45 mt-1 font-mono">Jika diisi, karakter ini akan menggantikan kumpulan karakter di atas.</p>
      </div>

      <button
        onClick={generate}
        className="bg-foreground text-background px-5 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
      >
        Generate String
      </button>

      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil String</span>
            <button
              onClick={() => navigator.clipboard.writeText(results.join("\n"))}
              className="text-xs font-mono uppercase tracking-wider text-primary hover:underline"
            >
              Copy Semua
            </button>
          </div>
          <div className="bg-background border border-foreground/15 rounded-lg p-4 font-mono text-sm space-y-2 max-h-60 overflow-auto">
            {results.map((str, i) => (
              <div key={i} className="flex justify-between items-center py-1 hover:bg-foreground/5 px-2 rounded">
                <span className="break-all">{str}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(str)}
                  className="text-[10px] uppercase text-primary hover:underline"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
