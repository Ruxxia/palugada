import { useState, useMemo } from "react";

export function CanonicalUrlGenerator() {
  const [inputUrl, setInputUrl] = useState("https://www.example.com/PRODUK-detail/?utm_source=news&id=99");
  const [trailingSlash, setTrailingSlash] = useState(false);
  const [forceLowercase, setForceLowercase] = useState(true);
  const [removeAllQueries, setRemoveAllQueries] = useState(true);
  const [forceHttps, setForceHttps] = useState(true);
  const [wwwHandling, setWwwHandling] = useState<"none" | "force-www" | "remove-www">("none");

  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedHeader, setCopiedHeader] = useState(false);

  const canonicalUrl = useMemo(() => {
    if (!inputUrl.trim()) return "";

    let urlString = inputUrl.trim();

    // Basic URL check: prepend http if protocol missing
    if (!/^https?:\/\//i.test(urlString)) {
      urlString = "https://" + urlString;
    }

    try {
      const parsed = new URL(urlString);

      // 1. Force HTTPS
      if (forceHttps) {
        parsed.protocol = "https:";
      }

      // 2. Remove queries
      if (removeAllQueries) {
        parsed.search = "";
        parsed.hash = "";
      }

      // 3. WWW subdomain handling
      let host = parsed.hostname;
      if (wwwHandling === "force-www" && !host.startsWith("www.")) {
        host = "www." + host;
      } else if (wwwHandling === "remove-www" && host.startsWith("www.")) {
        host = host.substring(4);
      }
      parsed.hostname = host;

      // 4. Lowercase path
      let pathname = parsed.pathname;
      if (forceLowercase) {
        pathname = pathname.toLowerCase();
      }

      // 5. Trailing slash
      if (pathname === "/") {
        // base path
      } else if (trailingSlash && !pathname.endsWith("/")) {
        pathname = pathname + "/";
      } else if (!trailingSlash && pathname.endsWith("/")) {
        pathname = pathname.substring(0, pathname.length - 1);
      }

      parsed.pathname = pathname;

      return parsed.href;
    } catch {
      return "URL Tidak Valid";
    }
  }, [inputUrl, trailingSlash, forceLowercase, removeAllQueries, forceHttps, wwwHandling]);

  const htmlOutput = canonicalUrl
    ? `<link rel="canonical" href="${canonicalUrl}" />`
    : "";

  const headerOutput = canonicalUrl
    ? `Link: <${canonicalUrl}>; rel="canonical"`
    : "";

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    if (!text || text === "URL Tidak Valid") return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Configuration Panel */}
      <div className="lg:col-span-6 space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 border-b border-foreground/5 pb-2">
          Canonical Link Builder
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">URL Target / Asal</label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Masukkan URL lengkap halaman..."
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg text-sm font-mono focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground/40 block">Pilihan Normalisasi</span>
            
            <label className="flex items-center gap-3 cursor-pointer select-none text-sm">
              <input
                type="checkbox"
                checked={forceHttps}
                onChange={(e) => setForceHttps(e.target.checked)}
                className="w-4 h-4 rounded border-foreground/30 accent-primary"
              />
              <span>Paksa Protokol HTTPS (Direkomendasikan)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none text-sm">
              <input
                type="checkbox"
                checked={removeAllQueries}
                onChange={(e) => setRemoveAllQueries(e.target.checked)}
                className="w-4 h-4 rounded border-foreground/30 accent-primary"
              />
              <span>Hapus Semua Query Parameter (e.g. UTM, ID tracking)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none text-sm">
              <input
                type="checkbox"
                checked={forceLowercase}
                onChange={(e) => setForceLowercase(e.target.checked)}
                className="w-4 h-4 rounded border-foreground/30 accent-primary"
              />
              <span>Ubah Jalur Path ke Huruf Kecil (Lowercase)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none text-sm">
              <input
                type="checkbox"
                checked={trailingSlash}
                onChange={(e) => setTrailingSlash(e.target.checked)}
                className="w-4 h-4 rounded border-foreground/30 accent-primary"
              />
              <span>Tambahkan Trailing Slash di Akhir URL (e.g. /page/)</span>
            </label>

            <div className="flex flex-col gap-1.5 pt-2">
              <span className="text-xs font-mono text-foreground/50">Pengaturan Subdomain WWW</span>
              <select
                value={wwwHandling}
                onChange={(e) => setWwwHandling(e.target.value as any)}
                className="w-full h-10 px-3 bg-background border border-foreground/15 rounded-lg text-xs focus:outline-none"
              >
                <option value="none">Biarkan Seperti Aslinya</option>
                <option value="force-www">Paksa domain ber-WWW (e.g. www.domain.com)</option>
                <option value="remove-www">Hapus subdomain WWW (e.g. domain.com)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          <h3 className="font-display text-lg uppercase border-b border-foreground/10 pb-3">Hasil Tag Kanonikal</h3>

          {/* HTML LINK TAG */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Tag HTML head</span>
            <div className="relative">
              <pre className="bg-background border border-foreground/15 p-4 rounded-xl font-mono text-xs overflow-x-auto text-[#1a0dab] dark:text-[#8ab4f8] leading-relaxed">
                {htmlOutput || "Menunggu URL input..."}
              </pre>
              {htmlOutput && htmlOutput !== "URL Tidak Valid" && (
                <button
                  onClick={() => copyToClipboard(htmlOutput, setCopiedHtml)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-foreground text-background text-[10px] font-bold uppercase rounded hover:opacity-90 transition-opacity"
                >
                  {copiedHtml ? "Copied!" : "Salin"}
                </button>
              )}
            </div>
          </div>

          {/* HTTP HEADER FORMAT */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Format Header HTTP</span>
            <div className="relative">
              <pre className="bg-background border border-foreground/15 p-4 rounded-xl font-mono text-xs overflow-x-auto text-foreground/80 leading-relaxed">
                {headerOutput || "Menunggu URL input..."}
              </pre>
              {headerOutput && headerOutput !== "URL Tidak Valid" && (
                <button
                  onClick={() => copyToClipboard(headerOutput, setCopiedHeader)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-foreground text-background text-[10px] font-bold uppercase rounded hover:opacity-90 transition-opacity"
                >
                  {copiedHeader ? "Copied!" : "Salin"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Why Canonical is Important */}
        <div className="bg-primary/5 border border-primary/10 p-5 rounded-xl space-y-2.5">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider">💡 Mengapa Link Canonical Penting?</h4>
          <ul className="text-xs text-foreground/70 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Mencegah penalti <strong>konten duplikat</strong> dari mesin pencari akibat variasi URL yang sama (e.g. HTTP vs HTTPS, non-WWW vs WWW).</li>
            <li>Memastikan nilai tautan (link equity / PageRank) terpusat pada satu URL resmi utama Anda.</li>
            <li>Membersihkan pelacakan analitik Google Analytics dengan menggabungkan kunjungan dari parameter link (seperti UTM).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
