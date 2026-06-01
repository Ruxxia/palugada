import { useState } from "react";
import { fetchUrlHtml } from "../../lib/api/seo.functions";


interface AuditResult {
  title: { content: string; length: number; status: "success" | "warning" | "error"; msg: string };
  description: { content: string; length: number; status: "success" | "warning" | "error"; msg: string };
  canonical: { content: string; present: boolean; status: "success" | "error"; msg: string };
  robots: { content: string; present: boolean; status: "success" | "warning"; msg: string };
  headings: { h1: string[]; h2: string[]; h3: string[]; count: Record<string, number>; status: "success" | "warning" | "error"; msg: string };
  ogTags: { key: string; val: string }[];
  twitterTags: { key: string; val: string }[];
  images: { total: number; missingAlt: number; status: "success" | "warning"; msg: string };
}

export function MetaTagAnalyzer() {
  const [inputType, setInputType] = useState<"url" | "html">("html");
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);

  const analyzeHtmlContent = (htmlString: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");

      // Title Audit
      const titleTag = doc.querySelector("title");
      const titleText = titleTag?.textContent?.trim() || "";
      const titleLen = titleText.length;
      let titleStatus: "success" | "warning" | "error" = "success";
      let titleMsg = "Panjang judul optimal (50-60 karakter).";

      if (titleLen === 0) {
        titleStatus = "error";
        titleMsg = "Judul halaman (Tag Title) tidak ditemukan! Sangat penting untuk SEO.";
      } else if (titleLen < 30) {
        titleStatus = "warning";
        titleMsg = "Judul terlalu pendek. Coba gunakan 50-60 karakter agar lebih optimal.";
      } else if (titleLen > 60) {
        titleStatus = "warning";
        titleMsg = "Judul terlalu panjang. Judul di atas 60 karakter mungkin terpotong di Google SERP.";
      }

      // Description Audit
      const descTag = doc.querySelector('meta[name="description"]');
      const descText = descTag?.getAttribute("content")?.trim() || "";
      const descLen = descText.length;
      let descStatus: "success" | "warning" | "error" = "success";
      let descMsg = "Panjang deskripsi optimal (120-160 karakter).";

      if (descLen === 0) {
        descStatus = "error";
        descMsg = "Meta deskripsi tidak ditemukan! Teks deskripsi sangat penting untuk CTR halaman.";
      } else if (descLen < 80) {
        descStatus = "warning";
        descMsg = "Deskripsi terlalu pendek. Tambahkan detail penjelasan hingga 120-160 karakter.";
      } else if (descLen > 160) {
        descStatus = "warning";
        descMsg = "Deskripsi terlalu panjang. Teks di atas 160 karakter mungkin terpotong di hasil pencarian.";
      }

      // Canonical Link Audit
      const canonicalTag = doc.querySelector('link[rel="canonical"]');
      const canonicalHref = canonicalTag?.getAttribute("href") || "";
      const canonicalPresent = !!canonicalHref;
      const canonicalStatus = canonicalPresent ? "success" : "error";
      const canonicalMsg = canonicalPresent
        ? `Canonical URL terdeteksi: ${canonicalHref}`
        : "Tag Link Canonical tidak ditemukan! Risiko isu konten duplikat.";

      // Robots Tag Audit
      const robotsTag = doc.querySelector('meta[name="robots"]');
      const robotsContent = robotsTag?.getAttribute("content") || "";
      const robotsPresent = !!robotsContent;
      const robotsStatus = robotsPresent ? "success" : "warning";
      const robotsMsg = robotsPresent
        ? `Tag Robots terdeteksi: ${robotsContent}`
        : "Tag meta robots tidak terdeteksi. Secara default robot pencari akan mengindeks & mengikuti link (index, follow).";

      // Headings Audit
      const h1s: string[] = [];
      const h2s: string[] = [];
      const h3s: string[] = [];
      doc.querySelectorAll("h1").forEach((el) => h1s.push(el.textContent?.trim() || ""));
      doc.querySelectorAll("h2").forEach((el) => h2s.push(el.textContent?.trim() || ""));
      doc.querySelectorAll("h3").forEach((el) => h3s.push(el.textContent?.trim() || ""));

      let headingsStatus: "success" | "warning" | "error" = "success";
      let headingsMsg = "Struktur heading baik.";

      if (h1s.length === 0) {
        headingsStatus = "error";
        headingsMsg = "Tag H1 tidak ditemukan pada halaman ini. Halaman harus memiliki satu H1 utama.";
      } else if (h1s.length > 1) {
        headingsStatus = "warning";
        headingsMsg = `Terlalu banyak tag H1 (${h1s.length}). Direkomendasikan hanya menggunakan satu H1 per halaman.`;
      }

      // Social Tag Audit
      const ogTags: { key: string; val: string }[] = [];
      const twitterTags: { key: string; val: string }[] = [];

      doc.querySelectorAll("meta").forEach((meta) => {
        const property = meta.getAttribute("property") || "";
        const name = meta.getAttribute("name") || "";
        const content = meta.getAttribute("content") || "";

        if (property.startsWith("og:") && content) {
          ogTags.push({ key: property, val: content });
        }
        if (name.startsWith("twitter:") && content) {
          twitterTags.push({ key: name, val: content });
        }
      });

      // Images Alt Audit
      const imgs = doc.querySelectorAll("img");
      let totalImgs = imgs.length;
      let missingAltCount = 0;
      imgs.forEach((img) => {
        if (!img.hasAttribute("alt") || !img.getAttribute("alt")?.trim()) {
          missingAltCount++;
        }
      });

      const imagesStatus = missingAltCount === 0 ? "success" : "warning";
      const imagesMsg =
        totalImgs > 0
          ? `${missingAltCount} dari ${totalImgs} gambar kehilangan atribut alt.`
          : "Tidak ada tag gambar (img) ditemukan di halaman.";

      setResult({
        title: { content: titleText, length: titleLen, status: titleStatus, msg: titleMsg },
        description: { content: descText, length: descLen, status: descStatus, msg: descMsg },
        canonical: { content: canonicalHref, present: canonicalPresent, status: canonicalStatus, msg: canonicalMsg },
        robots: { content: robotsContent, present: robotsPresent, status: robotsStatus, msg: robotsMsg },
        headings: {
          h1: h1s,
          h2: h2s,
          h3: h3s,
          count: {
            H1: h1s.length,
            H2: h2s.length,
            H3: h3s.length,
          },
          status: headingsStatus,
          msg: headingsMsg,
        },
        ogTags,
        twitterTags,
        images: { total: totalImgs, missingAlt: missingAltCount, status: imagesStatus, msg: imagesMsg },
      });
      setError("");
    } catch (e: any) {
      setError("Gagal menganalisis kode HTML: " + e.message);
    }
  };

  const fetchUrlAndAnalyze = async () => {
    if (!url.trim()) {
      setError("Silakan masukkan URL terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Clean and validate URL
      let cleanUrl = url.trim();
      if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = "https://" + cleanUrl;
      }

      let fetchedHtml = "";
      let success = false;

      // 1. Try server-side fetching (CORS bypass)
      try {
        const serverRes = await fetchUrlHtml({ data: { url: cleanUrl } });
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
          `https://api.allorigins.win/get?url=${encodeURIComponent(cleanUrl)}`,
          `https://corsproxy.io/?${encodeURIComponent(cleanUrl)}`
        ];

        for (const proxy of proxies) {
          try {
            const res = await fetch(proxy);
            if (res.ok) {
              if (proxy.includes("allorigins")) {
                const data = await res.json();
                if (data.contents) {
                  fetchedHtml = data.contents;
                  success = true;
                  break;
                }
              } else {
                const text = await res.text();
                if (text && text.trim().length > 100) {
                  fetchedHtml = text;
                  success = true;
                  break;
                }
              }
            }
          } catch (e) {}
        }
      }

      if (!success || !fetchedHtml) {
        throw new Error("Gagal mengambil data dari URL via server maupun proxy.");
      }

      analyzeHtmlContent(fetchedHtml);
    } catch (err: any) {
      setError(
        `Gagal menganalisis URL: ${err.message}. Beberapa website memblokir akses proxy. Silakan gunakan opsi 'Salin HTML Source' untuk analisis yang andal.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Selector & Inputs */}
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="flex justify-between items-center border-b border-foreground/10 pb-4">
          <div>
            <h3 className="font-display text-lg uppercase">Meta Tag Analyzer</h3>
            <p className="text-xs text-foreground/50 mt-1">Audit tag meta HTML halaman Anda untuk melihat isu SEO potensial.</p>
          </div>
          
          <div className="flex bg-foreground/5 p-1 rounded-lg">
            <button
              onClick={() => setInputType("html")}
              className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
                inputType === "html" ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Paste HTML Source
            </button>
            <button
              onClick={() => setInputType("url")}
              className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
                inputType === "url" ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Fetch dari URL
            </button>
          </div>
        </div>

        {inputType === "url" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">URL Halaman Website</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. https://www.domain.com/page"
                  className="flex-1 h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
                />
                <button
                  onClick={fetchUrlAndAnalyze}
                  disabled={loading}
                  className="px-6 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-colors shrink-0 disabled:opacity-50"
                >
                  {loading ? "Menganalisis..." : "Mulai Analisis"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Kode Source HTML Halaman</label>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Salin dan tempel tag head HTML atau seluruh source code website Anda di sini..."
                rows={8}
                className="w-full p-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-mono resize-none leading-relaxed"
              />
            </div>
            <button
              onClick={() => analyzeHtmlContent(html)}
              className="w-full h-11 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-colors"
            >
              Analisis HTML Source
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/25 text-destructive text-sm rounded-lg leading-relaxed">
            {error}
          </div>
        )}
      </div>

      {/* Results View */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Audit Summary & Details */}
          <div className="lg:col-span-8 space-y-6">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold border-b border-foreground/10 pb-2">Detail Hasil Audit</h4>
            
            {/* Meta Title */}
            <div className="p-5 bg-card border border-foreground/10 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-bold text-sm uppercase tracking-tight">Tag Title</h5>
                  <span className="text-xs font-mono text-foreground/40">{result.title.length} Karakter</span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    result.title.status === "success"
                      ? "bg-[#25D366]/10 text-[#25D366]"
                      : result.title.status === "warning"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {result.title.status}
                </span>
              </div>
              <blockquote className="p-3 bg-background rounded-lg border border-foreground/5 text-sm font-semibold italic text-foreground/80">
                {result.title.content || "(Kosong)"}
              </blockquote>
              <p className="text-xs text-foreground/60 leading-relaxed">{result.title.msg}</p>
            </div>

            {/* Meta Description */}
            <div className="p-5 bg-card border border-foreground/10 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-bold text-sm uppercase tracking-tight">Meta Description</h5>
                  <span className="text-xs font-mono text-foreground/40">{result.description.length} Karakter</span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    result.description.status === "success"
                      ? "bg-[#25D366]/10 text-[#25D366]"
                      : result.description.status === "warning"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {result.description.status}
                </span>
              </div>
              <blockquote className="p-3 bg-background rounded-lg border border-foreground/5 text-xs italic text-foreground/80 leading-relaxed">
                {result.description.content || "(Kosong)"}
              </blockquote>
              <p className="text-xs text-foreground/60 leading-relaxed">{result.description.msg}</p>
            </div>

            {/* Headings Hierarchy */}
            <div className="p-5 bg-card border border-foreground/10 rounded-xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-bold text-sm uppercase tracking-tight">Struktur Heading</h5>
                  <div className="flex gap-3 text-xs font-mono text-foreground/40 mt-1">
                    <span>H1: {result.headings.count.H1}</span>
                    <span>H2: {result.headings.count.H2}</span>
                    <span>H3: {result.headings.count.H3}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    result.headings.status === "success"
                      ? "bg-[#25D366]/10 text-[#25D366]"
                      : result.headings.status === "warning"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {result.headings.status}
                </span>
              </div>
              
              <p className="text-xs text-foreground/60 leading-relaxed">{result.headings.msg}</p>

              {result.headings.h1.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">Tag H1</span>
                  {result.headings.h1.map((h, i) => (
                    <div key={i} className="p-2.5 bg-background border border-foreground/5 rounded text-xs font-semibold">
                      {h}
                    </div>
                  ))}
                </div>
              )}

              {result.headings.h2.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">Tag H2 (Sampel)</span>
                  {result.headings.h2.slice(0, 5).map((h, i) => (
                    <div key={i} className="p-2 bg-background border border-foreground/5 rounded text-xs text-foreground/80 pl-4 border-l-2 border-l-primary/40">
                      {h}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Images Alt Tag Audit */}
            <div className="p-5 bg-card border border-foreground/10 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <h5 className="font-bold text-sm uppercase tracking-tight">Atribut Alt Gambar</h5>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    result.images.status === "success" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-amber-500/10 text-amber-500"
                  }`}
                >
                  {result.images.status}
                </span>
              </div>
              <p className="text-xs text-foreground/75">{result.images.msg}</p>
            </div>
          </div>

          {/* Social Meta Previews (OG & Twitter) */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold border-b border-foreground/10 pb-2">Technical & Social</h4>

            {/* Canonical & Robots */}
            <div className="p-4 bg-card border border-foreground/10 rounded-xl space-y-3.5">
              <div>
                <span className="text-[9px] font-mono uppercase text-foreground/40 block">URL Canonical</span>
                <span className={`text-xs font-semibold ${result.canonical.present ? "text-foreground/80" : "text-destructive"}`}>
                  {result.canonical.msg}
                </span>
              </div>
              
              <div className="border-t border-foreground/5 pt-3">
                <span className="text-[9px] font-mono uppercase text-foreground/40 block">Robots Tag</span>
                <span className="text-xs text-foreground/80 font-mono">
                  {result.robots.content || "(Tidak dispesifikasikan)"}
                </span>
              </div>
            </div>

            {/* Open Graph (Social Cards Preview) */}
            <div className="p-4 bg-card border border-foreground/10 rounded-xl space-y-4">
              <h5 className="font-bold text-sm uppercase tracking-tight">Open Graph (Facebook / LinkedIn)</h5>
              {result.ogTags.length === 0 ? (
                <p className="text-xs text-foreground/40 italic">Tidak ada tag Open Graph ditemukan.</p>
              ) : (
                <div className="space-y-3">
                  <div className="border border-foreground/10 rounded-lg overflow-hidden bg-background">
                    {result.ogTags.find((t) => t.key === "og:image") && (
                      <img
                        src={result.ogTags.find((t) => t.key === "og:image")?.val}
                        alt="OG Preview"
                        className="w-full h-36 object-cover bg-foreground/5"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <div className="p-3 space-y-1">
                      <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-widest block truncate">
                        {result.ogTags.find((t) => t.key === "og:site_name")?.val || "WEBSITE"}
                      </span>
                      <h6 className="font-bold text-xs truncate">
                        {result.ogTags.find((t) => t.key === "og:title")?.val || result.title.content}
                      </h6>
                      <p className="text-[10px] text-foreground/60 leading-normal line-clamp-2">
                        {result.ogTags.find((t) => t.key === "og:description")?.val || result.description.content}
                      </p>
                    </div>
                  </div>

                  {/* List Raw OG Tags */}
                  <details className="text-[10px] text-foreground/50">
                    <summary className="cursor-pointer hover:underline">Tampilkan semua tag OG ({result.ogTags.length})</summary>
                    <div className="mt-2 space-y-1 bg-background p-2 rounded font-mono text-[9px] border border-foreground/5 overflow-x-auto">
                      {result.ogTags.map((tag, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-primary font-bold">{tag.key}:</span>
                          <span className="truncate text-foreground/80">{tag.val}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>

            {/* Twitter Cards */}
            <div className="p-4 bg-card border border-foreground/10 rounded-xl space-y-3">
              <h5 className="font-bold text-sm uppercase tracking-tight">Twitter Meta Card</h5>
              {result.twitterTags.length === 0 ? (
                <p className="text-xs text-foreground/40 italic">Tidak ada tag Twitter Card ditemukan.</p>
              ) : (
                <div className="space-y-2">
                  <div className="bg-background p-3 border border-foreground/5 rounded-lg font-mono text-[10px] space-y-1">
                    {result.twitterTags.map((tag, idx) => (
                      <div key={idx} className="flex gap-1.5">
                        <span className="text-blue-500 font-bold">{tag.key.replace("twitter:", "")}:</span>
                        <span className="truncate text-foreground/75">{tag.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
