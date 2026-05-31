import { useState, useEffect } from "react";

export function WhatsappBulkLinkGenerator() {
  const [numbersText, setNumbersText] = useState("");
  const [countryCode, setCountryCode] = useState("62");
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<{ number: string; link: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    // Process numbers from lines
    const lines = numbersText.split(/\n/);
    const list: { number: string; link: string }[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Extract only digits
      const digitsOnly = trimmed.replace(/\D/g, "");
      if (!digitsOnly) return;

      let formatted = digitsOnly;
      if (formatted.startsWith("0")) {
        formatted = formatted.substring(1);
      }

      const prefix = countryCode;
      if (formatted.startsWith(prefix)) {
        formatted = formatted.substring(prefix.length);
      }

      const finalNumber = prefix + formatted;
      const encodedMsg = encodeURIComponent(message);
      const link = `https://wa.me/${finalNumber}${encodedMsg ? `?text=${encodedMsg}` : ""}`;

      list.push({
        number: trimmed,
        link,
      });
    });

    setResults(list);
  }, [numbersText, countryCode, message]);

  const copyLink = (link: string, idx: number) => {
    navigator.clipboard.writeText(link);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllLinks = () => {
    if (results.length === 0) return;
    const linksOnly = results.map((r) => r.link).join("\n");
    navigator.clipboard.writeText(linksOnly);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Configuration */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Pengaturan Massal</h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block mb-1">Negara Default</label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full h-11 px-3 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            >
              <option value="62">+62 (Indonesia)</option>
              <option value="1">+1 (US)</option>
              <option value="44">+44 (UK)</option>
              <option value="65">+65 (Singapore)</option>
              <option value="60">+60 (Malaysia)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block mb-1">
              Daftar Nomor HP (Satu per baris)
            </label>
            <textarea
              value={numbersText}
              onChange={(e) => setNumbersText(e.target.value)}
              placeholder="e.g.&#10;081234567890&#10;089987654321&#10;085711223344"
              rows={6}
              className="w-full p-3 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block mb-1">
              Pesan Kustom
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Halo, selamat pagi..."
              rows={3}
              className="w-full p-3 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
            />
          </div>
        </div>
      </div>

      {/* Results Output */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col min-h-[300px]">
        <div className="flex justify-between items-center border-b border-foreground/10 pb-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Daftar Link Hasil ({results.length})</h3>
          {results.length > 0 && (
            <button
              onClick={copyAllLinks}
              className="px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-lg hover:bg-foreground/90 transition-colors"
            >
              {copiedAll ? "All Copied! ✓" : "Copy Semua Link"}
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-foreground/40 text-sm py-16">
            <span>📋</span>
            <p className="mt-2 text-center">Hasil link wa.me massal akan muncul di sini setelah Anda memasukkan nomor.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto max-h-[350px] space-y-3 pr-1">
            {results.map((item, idx) => (
              <div key={idx} className="bg-background border border-foreground/10 rounded-lg p-3 flex justify-between items-center gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-foreground/45 block">{item.number}</span>
                  <p className="text-xs font-mono truncate text-primary font-bold">{item.link}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => copyLink(item.link, idx)}
                    className="px-2 py-1 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-[10px] font-bold uppercase rounded transition-colors"
                  >
                    {copiedIndex === idx ? "Copied ✓" : "Copy"}
                  </button>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-[10px] font-bold uppercase rounded transition-colors"
                  >
                    Test
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
