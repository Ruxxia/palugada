import { useState } from "react";
import { fetchUrlHtml } from "../../lib/api/seo.functions";


interface LinkItem {
  href: string;
  text: string;
  isExternal: boolean;
  isEmpty: boolean;
  isGeneric: boolean;
  missingRel: boolean;
  status: "success" | "warning" | "error";
  statusText: string;
}

interface LinkAuditResult {
  total: number;
  internalCount: number;
  externalCount: number;
  issueCount: number;
  links: LinkItem[];
}

export function LinkAuditor() {
  const [inputType, setInputType] = useState<"url" | "html">("html");
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LinkAuditResult | null>(null);
  const [filter, setFilter] = useState<"all" | "internal" | "external" | "issues">("all");

  const sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Sampel Halaman Link Audit</title>
</head>
<body>
  <header>
    <a href="/">Beranda</a> <!-- Good Internal -->
    <a href="/tentang-kami">Tentang Kami</a> <!-- Good Internal -->
    <a href="/kontak">Kontak</a> <!-- Good Internal -->
  </header>
  
  <main>
    <h2>Artikel Terbaru</h2>
    <p>Baca panduan kami mengenai <a href="/blog/seo-tips">Tips SEO Terbaik</a>.</p> <!-- Good Internal -->
    
    <p>Untuk info diskon, silakan <a href="#">klik disini</a>.</p> <!-- Generic + Empty Link -->
    <p>Kunjungi juga <a href="https://google.com" target="_blank">Google</a> untuk pencarian lanjutan.</p> <!-- External missing rel -->
    <p>Kami bekerja sama dengan <a href="https://partner-website.com" target="_blank" rel="noopener">Mitra Kami</a>.</p> <!-- Good External -->
    
    <p>Informasi lebih lanjut bisa dibaca di <a href="javascript:void(0)">halaman dokumentasi</a>.</p> <!-- Empty/JS Link -->
  </main>

  <footer>
    <a href="#top">Kembali ke Atas</a> <!-- Anchor Link -->
    <a href="">Link Rusak</a> <!-- Empty Link -->
  </footer>
</body>
</html>`;

  const loadSampleHtml = () => {
    setHtml(sampleHtml);
    setInputType("html");
    setError("");
    setResult(null);
  };

  const loadSampleUrl = () => {
    setUrl("https://react.dev");
    setInputType("url");
    setError("");
    setResult(null);
  };

  const analyzeLinks = (htmlString: string, siteUrl: string = "") => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      const cleanUrl = siteUrl.trim();

      const links: LinkItem[] = [];
      const genericKeywords = ["click here", "klik disini", "klik di sini", "read more", "baca selengkapnya", "detail", "selengkapnya", "link", "tautan", "here", "sini"];
      let internalCount = 0;
      let externalCount = 0;
      let issueCount = 0;

      doc.querySelectorAll("a").forEach((el) => {
        const href = el.getAttribute("href") || "";
        const text = el.textContent?.trim() || "";
        
        const isExternal = /^https?:\/\//i.test(href) && (cleanUrl ? !href.includes(new URL(cleanUrl).hostname) : true);
        const isEmpty = href === "#" || href === "" || href.startsWith("javascript:");
        const isGeneric = genericKeywords.some((keyword) => text.toLowerCase().includes(keyword));
        const target = el.getAttribute("target") || "";
        const rel = el.getAttribute("rel") || "";
        const missingRel = isExternal && target === "_blank" && !rel.includes("noopener") && !rel.includes("noreferrer");

        let status: "success" | "warning" | "error" = "success";
        let statusText = "Link Baik";

        if (isEmpty) {
          status = "error";
          statusText = "Link Kosong atau Rusak";
          issueCount++;
        } else if (isGeneric && missingRel) {
          status = "warning";
          statusText = "Anchor Teks Generik & Keamanan Tab Rendah";
          issueCount++;
        } else if (isGeneric) {
          status = "warning";
          statusText = "Anchor Teks Generik";
          issueCount++;
        } else if (missingRel) {
          status = "warning";
          statusText = "Keamanan Tab Rendah (Missing rel='noopener')";
          issueCount++;
        }

        if (isExternal) {
          externalCount++;
        } else {
          internalCount++;
        }

        links.push({
          href,
          text,
          isExternal,
          isEmpty,
          isGeneric,
          missingRel,
          status,
          statusText,
        });
      });

      setResult({
        total: links.length,
        internalCount,
        externalCount,
        issueCount,
        links,
      });
      setError("");
    } catch (e: any) {
      setError("Gagal menganalisis tautan: " + e.message);
    }
  };

  const fetchAndAnalyzeUrl = async () => {
    if (!url.trim()) {
      setError("Silakan masukkan URL website terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    let fetchedHtml = "";
    let success = false;

    // 1. Try server-side fetching (CORS bypass)
    try {
      const serverRes = await fetchUrlHtml({ data: { url: targetUrl } });
      if (serverRes.success && serverRes.html) {
        fetchedHtml = serverRes.html;
        success = true;
      } else if (serverRes.error) {
        console.warn("Server-side fetch failed:", serverRes.error);
      }
    } catch (err: any) {
      console.warn("Server-side fetch exception:", err);
    }

    // 2. Fallback to client-side CORS Proxies
    if (!success) {
      const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
      ];

      for (const proxy of proxies) {
        try {
          const response = await fetch(proxy);
          if (response.ok) {
            if (proxy.includes("allorigins")) {
              const data = await response.json();
              if (data.contents) {
                fetchedHtml = data.contents;
                success = true;
                break;
              }
            } else {
              fetchedHtml = await response.text();
              if (fetchedHtml && fetchedHtml.trim().length > 100) {
                success = true;
                break;
              }
            }
          }
        } catch (e) {}
      }
    }

    if (success && fetchedHtml) {
      analyzeLinks(fetchedHtml, targetUrl);
    } else {
      setError("Gagal mengambil data dari URL. Silakan salin & tempel kode HTML target Anda ke kolom yang disediakan.");
    }
    setLoading(false);
  };

  const filteredLinks = result
    ? result.links.filter((l) => {
        if (filter === "internal") return !l.isExternal;
        if (filter === "external") return l.isExternal;
        if (filter === "issues") return l.status !== "success";
        return true;
      })
    : [];

  return (
    <div className="space-y-8">
      {/* Search Input Box */}
      <div className="bg-card border-2 border-foreground p-6 rounded-2xl shadow-tactile space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-foreground/10 pb-4 gap-4">
          <div>
            <h3 className="font-display text-xl uppercase tracking-tight">Link Auditor</h3>
            <p className="text-xs text-foreground/50 mt-1">Audit kualitas anchor text, periksa tautan eksternal yang aman, dan temukan link rusak/kosong.</p>
          </div>
          
          <div className="flex bg-foreground/5 p-1 rounded-lg border border-foreground/10 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setInputType("html")}
              className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all cursor-pointer ${
                inputType === "html" ? "bg-foreground text-background shadow-sm" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Paste HTML Source
            </button>
            <button
              onClick={() => setInputType("url")}
              className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all cursor-pointer ${
                inputType === "url" ? "bg-foreground text-background shadow-sm" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Fetch dari URL
            </button>
          </div>
        </div>

        {inputType === "url" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">URL Target</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. https://www.domain.com/artikel"
                  className="flex-1 h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
                />
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={fetchAndAnalyzeUrl}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-6 h-11 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Menganalisis..." : "Audit Link"}
                  </button>
                  <button
                    onClick={loadSampleUrl}
                    className="px-4 h-11 border border-foreground/20 rounded-lg text-xs font-bold uppercase hover:bg-foreground/5 transition-all cursor-pointer"
                  >
                    Contoh
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Kode HTML Source</label>
                <button
                  onClick={loadSampleHtml}
                  className="text-xs font-mono font-bold text-primary hover:underline"
                >
                  Muat Contoh Kode HTML
                </button>
              </div>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Tempel seluruh HTML halaman Anda disini untuk menganalisis link..."
                rows={8}
                className="w-full p-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-mono resize-none leading-relaxed"
              />
            </div>
            <button
              onClick={() => analyzeLinks(html)}
              className="w-full h-11 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-all cursor-pointer"
            >
              Mulai Audit Link Lokal
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg leading-relaxed">
            {error}
          </div>
        )}
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-card border-2 border-foreground p-5 rounded-xl shadow-tactile-sm text-center">
              <span className="text-3xl font-display uppercase tracking-tight text-foreground/80">{result.total}</span>
              <span className="text-[10px] font-mono uppercase text-foreground/40 block mt-1">Total Tautan</span>
            </div>
            <div className="bg-card border-2 border-foreground p-5 rounded-xl shadow-tactile-sm text-center">
              <span className="text-3xl font-display uppercase tracking-tight text-primary">{result.internalCount}</span>
              <span className="text-[10px] font-mono uppercase text-foreground/40 block mt-1">Link Internal</span>
            </div>
            <div className="bg-card border-2 border-foreground p-5 rounded-xl shadow-tactile-sm text-center">
              <span className="text-3xl font-display uppercase tracking-tight text-foreground/80">{result.externalCount}</span>
              <span className="text-[10px] font-mono uppercase text-foreground/40 block mt-1">Link Eksternal</span>
            </div>
            <div className="bg-card border-2 border-foreground p-5 rounded-xl shadow-tactile-sm text-center bg-destructive/[0.02]">
              <span className={`text-3xl font-display uppercase tracking-tight ${result.issueCount > 0 ? "text-destructive" : "text-[#25D366]"}`}>{result.issueCount}</span>
              <span className="text-[10px] font-mono uppercase text-foreground/40 block mt-1">Tautan Bermasalah</span>
            </div>
          </div>

          {/* Filter & Main Link List */}
          <div className="bg-card border-2 border-foreground p-6 rounded-2xl shadow-tactile space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-foreground/10 pb-4">
              <h4 className="font-display text-sm uppercase tracking-wider text-foreground/75">Daftar Audit Link Temuan</h4>
              
              <div className="flex bg-foreground/5 p-1 rounded-lg border border-foreground/10 self-start sm:self-auto overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: "Semua" },
                  { id: "internal", label: "Internal" },
                  { id: "external", label: "Eksternal" },
                  { id: "issues", label: `Isu (${result.issueCount})` },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilter(item.id as any)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all cursor-pointer whitespace-nowrap ${
                      filter === item.id ? "bg-foreground text-background shadow-sm" : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredLinks.length === 0 ? (
              <p className="text-center text-xs text-foreground/40 py-8 font-mono">Tidak ada tautan yang sesuai dengan filter ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-foreground/15 text-foreground/50 font-mono uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Teks Jangkar (Anchor)</th>
                      <th className="py-2.5 px-3">URL Tujuan</th>
                      <th className="py-2.5 px-3">Tipe</th>
                      <th className="py-2.5 px-3 text-right">Status Kepatuhan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/5 font-mono">
                    {filteredLinks.map((link, idx) => (
                      <tr key={idx} className="hover:bg-foreground/[0.02] transition-colors">
                        <td className="py-3 px-3 font-semibold text-foreground/90 max-w-[200px] truncate" title={link.text}>
                          {link.text || <span className="italic text-foreground/30">(Teks Kosong)</span>}
                        </td>
                        <td className="py-3 px-3 max-w-[300px] truncate text-foreground/70 select-all" title={link.href}>
                          {link.href}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${link.isExternal ? "bg-blue-500/10 text-blue-500" : "bg-primary/10 text-primary"}`}>
                            {link.isExternal ? "Eksternal" : "Internal"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            link.status === "success" ? "bg-[#25D366]/10 text-[#25D366]" : link.status === "warning" ? "bg-amber-500/10 text-amber-500" : "bg-destructive/10 text-destructive"
                          }`}>
                            {link.statusText}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Educational Guidelines */}
          <div className="bg-foreground/5 border border-foreground/15 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h5 className="font-bold text-sm uppercase tracking-wide">💡 Mengapa Anchor Text Penting?</h5>
              <p className="text-xs text-foreground/75 leading-relaxed">
                Mesin pencari menggunakan kata di dalam link (anchor text) untuk memahami konteks dan relevansi halaman tujuan. Menggunakan teks generik seperti "klik disini" tidak memberikan nilai kontekstual apa pun dan merugikan SEO.
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-bold text-sm uppercase tracking-wide">🛡️ Keamanan Tautan Eksternal</h5>
              <p className="text-xs text-foreground/75 leading-relaxed">
                Saat menautkan link eksternal dengan <code className="bg-foreground/10 px-1 py-0.5 rounded">target="_blank"</code>, selalu sertakan atribut <code className="bg-foreground/10 px-1 py-0.5 rounded">rel="noopener"</code> atau <code className="bg-foreground/10 px-1 py-0.5 rounded">rel="noreferrer"</code>. Hal ini melindungi pengguna dari eksploitasi tabnabbing di mana situs berbahaya dapat mengontrol tab asli.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
