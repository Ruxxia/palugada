import { useState } from "react";
import { fetchUrlHtml } from "../../lib/api/seo.functions";


interface PerfMetric {
  name: string;
  value: string;
  status: "pass" | "warning" | "error";
  desc: string;
  advice: string;
}

interface PerformanceResult {
  score: number;
  metrics: PerfMetric[];
  htmlSizeKb: number;
  scriptCount: { total: number; inline: number; external: number };
  styleCount: { total: number; inline: number; external: number };
  domNodeCount: number;
}

export function SeoPerformanceChecker() {
  const [inputType, setInputType] = useState<"url" | "html">("html");
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PerformanceResult | null>(null);

  const sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Halaman Berat Lambat</title>
  <!-- Inline Style Sangat Panjang (Bloat) -->
  <style>
    body { font-family: sans-serif; background: #fff; color: #333; margin: 0; padding: 0; }
    header { background: #333; color: #fff; padding: 20px; text-align: center; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .card-list { display: flex; flex-wrap: wrap; gap: 20px; }
    .card { flex: 1 1 300px; border: 1px solid #ccc; padding: 15px; border-radius: 5px; }
    .btn { display: inline-block; padding: 10px 20px; background: orange; color: white; text-decoration: none; border-radius: 4px; }
    /* Menambahkan 100 baris style dummy untuk mensimulasikan bloat */
    .dummy-1 { margin-top: 10px; } .dummy-2 { margin-top: 10px; } .dummy-3 { margin-top: 10px; }
    .dummy-4 { margin-top: 10px; } .dummy-5 { margin-top: 10px; } .dummy-6 { margin-top: 10px; }
    .dummy-7 { margin-top: 10px; } .dummy-8 { margin-top: 10px; } .dummy-9 { margin-top: 10px; }
  </style>
  <!-- Missing Viewport! -->
</head>
<body>
  <header>
    <h1>Selamat Datang di Portal Berita</h1>
  </header>
  
  <div className="container">
    <h2>Berita Utama Hari Ini</h2>
    <div className="card-list">
      <div className="card">
        <h3>SEO Naik Daun</h3>
        <p>Belajar cara meningkatkan skor SEO dan Core Web Vitals secara manual.</p>
        <a href="#" className="btn">Baca Selengkapnya</a>
      </div>
    </div>
  </div>

  <!-- Inline Scripts yang panjang -->
  <script>
    console.log("Memuat analitik...");
    function loadAnalytics() {
      // Dummy Script
      for(let i=0; i<10000; i++) {
        const x = i * 2;
      }
    }
    window.onload = loadAnalytics;
  </script>
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

  const analyzePerformance = (htmlString: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");

      const htmlSizeKb = parseFloat((htmlString.length / 1024).toFixed(2));
      const domNodeCount = doc.getElementsByTagName("*").length;

      // Script count
      const scripts = doc.querySelectorAll("script");
      let inlineScripts = 0;
      let externalScripts = 0;
      scripts.forEach((s) => {
        if (s.hasAttribute("src")) externalScripts++;
        else inlineScripts++;
      });

      // Style/CSS count
      const styles = doc.querySelectorAll("style");
      const linkCss = doc.querySelectorAll('link[rel="stylesheet"]');
      const inlineStyles = styles.length;
      const externalStyles = linkCss.length;

      // Viewport check
      const viewport = doc.querySelector('meta[name="viewport"]');

      const metrics: PerfMetric[] = [];
      let totalEarned = 100;

      // 1. Page Size Check
      let sizeStatus: "pass" | "warning" | "error" = "pass";
      let sizeAdvice = "Sangat bagus, ukuran file HTML awal Anda di bawah batas aman 100 KB.";
      if (htmlSizeKb > 200) {
        sizeStatus = "error";
        sizeAdvice = "Kritis! Ukuran file HTML terlalu besar. Ini memperlambat Time to First Byte (TTFB).";
        totalEarned -= 30;
      } else if (htmlSizeKb > 100) {
        sizeStatus = "warning";
        sizeAdvice = "Ukuran file agak besar. Cobalah untuk melakukan minifikasi dan kompresi.";
        totalEarned -= 15;
      }
      metrics.push({
        name: "Ukuran Dokumen HTML",
        value: `${htmlSizeKb} KB`,
        status: sizeStatus,
        desc: "Total berat byte file HTML halaman awal yang didownload oleh peramban.",
        advice: sizeAdvice,
      });

      // 2. DOM Complexity
      let domStatus: "pass" | "warning" | "error" = "pass";
      let domAdvice = "Struktur DOM optimal, mempermudah browser memproses render pohon dokumen.";
      if (domNodeCount > 1500) {
        domStatus = "error";
        domAdvice = "DOM terlalu kompleks (> 1500 node). Hal ini dapat menurunkan responsivitas interaksi halaman (INP).";
        totalEarned -= 25;
      } else if (domNodeCount > 800) {
        domStatus = "warning";
        domAdvice = "DOM cukup padat. Hindari pembungkusan div (divitis) yang tidak diperlukan.";
        totalEarned -= 10;
      }
      metrics.push({
        name: "Kompleksitas DOM (Node Count)",
        value: `${domNodeCount} Element`,
        status: domStatus,
        desc: "Total seluruh elemen HTML yang berada dalam struktur dokumen halaman Anda.",
        advice: domAdvice,
      });

      // 3. Inline Style Blocks
      let inlineCssStatus: "pass" | "warning" | "error" = "pass";
      let inlineCssAdvice = "Bagus, Anda meminimalkan penggunaan tag style inline untuk performa caching.";
      if (inlineStyles > 3) {
        inlineCssStatus = "error";
        inlineCssAdvice = "Terlalu banyak tag <style> inline. Pindahkan CSS ke file eksternal agar bisa disimpan di cache peramban.";
        totalEarned -= 20;
      } else if (inlineStyles > 1) {
        inlineCssStatus = "warning";
        inlineCssAdvice = "Gunakan file CSS eksternal terpisah daripada menulis tag <style> secara berulang di dalam dokumen.";
        totalEarned -= 10;
      }
      metrics.push({
        name: "Tag Style Inline (CSS)",
        value: `${inlineStyles} Tag`,
        status: inlineCssStatus,
        desc: "Jumlah blok CSS internal (<style>) yang disisipkan langsung di dalam dokumen HTML.",
        advice: inlineCssAdvice,
      });

      // 4. Inline Javascript Blocks
      let inlineJsStatus: "pass" | "warning" | "error" = "pass";
      let inlineJsAdvice = "Mantap, file skrip diatur di file eksternal atau minimal di dalam dokumen.";
      if (inlineScripts > 4) {
        inlineJsStatus = "error";
        inlineJsAdvice = "Terlalu banyak script Javascript inline. Blok skrip inline memperlambat pemrosesan parser HTML (parser-blocking).";
        totalEarned -= 15;
      } else if (inlineScripts > 2) {
        inlineJsStatus = "warning";
        inlineJsAdvice = "Pertimbangkan memindahkan kode Javascript ke file eksternal dengan tag defer/async.";
        totalEarned -= 5;
      }
      metrics.push({
        name: "Tag Script Inline (JS)",
        value: `${inlineScripts} Tag`,
        status: inlineJsStatus,
        desc: "Jumlah blok skrip JavaScript internal (<script>) yang disisipkan langsung di dokumen HTML.",
        advice: inlineJsAdvice,
      });

      // 5. Mobile Rendering (Viewport)
      let viewStatus: "pass" | "warning" | "error" = "pass";
      let viewAdvice = "Viewport aman. Peramban mobile dapat memuat halaman dengan skala yang pas dan responsif.";
      if (!viewport) {
        viewStatus = "error";
        viewAdvice = "Viewport hilang! Peramban mobile akan merender web seperti layar desktop lebar, menurunkan skor kepuasan mobile.";
        totalEarned -= 20;
      }
      metrics.push({
        name: "Responsivitas Mobile (Viewport)",
        value: viewport ? "Tersedia" : "Tidak Ditemukan",
        status: viewStatus,
        desc: "Keberadaan tag meta viewport yang menentukan skala rendering visual perangkat mobile.",
        advice: viewAdvice,
      });

      // Normalize score to stay between 0 and 100
      const finalScore = Math.max(0, Math.min(100, totalEarned));

      setResult({
        score: finalScore,
        metrics,
        htmlSizeKb,
        scriptCount: { total: scripts.length, inline: inlineScripts, external: externalScripts },
        styleCount: { total: inlineStyles + externalStyles, inline: inlineStyles, external: externalStyles },
        domNodeCount,
      });
      setError("");
    } catch (e: any) {
      setError("Gagal melakukan analisis performa: " + e.message);
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

    // 1. Try fetching via our server-side function (CORS bypass)
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
      analyzePerformance(fetchedHtml);
    } else {
      setError("Gagal mengambil data dari URL. Silakan salin & tempel kode HTML target Anda ke kolom yang disediakan.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Input Form Header */}
      <div className="bg-card border-2 border-foreground p-6 rounded-2xl shadow-tactile space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-foreground/10 pb-4 gap-4">
          <div>
            <h3 className="font-display text-xl uppercase tracking-tight">SEO Performance Checker</h3>
            <p className="text-xs text-foreground/50 mt-1">Evaluasi kecepatan render awal dokumen berdasarkan ukuran HTML, penulisan script/style, dan struktur DOM.</p>
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
                  placeholder="e.g. https://www.domain.com/landing"
                  className="flex-1 h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
                />
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={fetchAndAnalyzeUrl}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-6 h-11 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Memproses..." : "Cek Performa"}
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
                  Muat Contoh HTML Berat
                </button>
              </div>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Tempel seluruh HTML halaman web Anda disini..."
                rows={8}
                className="w-full p-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-mono resize-none leading-relaxed"
              />
            </div>
            <button
              onClick={() => analyzePerformance(html)}
              className="w-full h-11 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-all cursor-pointer"
            >
              Cek Performa Kode HTML
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg leading-relaxed">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Score Wheel */}
            <div className="bg-card border-2 border-foreground p-6 rounded-2xl shadow-tactile flex flex-col items-center justify-center text-center space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Skor Kinerja Render</h4>
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="50" strokeWidth="10" stroke="var(--color-border)" className="opacity-10" fill="transparent" />
                  <circle
                    cx="64"
                    cy="64"
                    r="50"
                    strokeWidth="10"
                    stroke={result.score >= 90 ? "oklch(0.728 0.187 152)" : result.score >= 50 ? "#f59e0b" : "oklch(0.6 0.22 27)"}
                    strokeDasharray={314}
                    strokeDashoffset={314 - (314 * result.score) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-display uppercase tracking-tight">{result.score}</span>
                  <span className="text-xs font-mono text-foreground/50 block">dari 100</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Statistics */}
            <div className="md:col-span-2 bg-card border-2 border-foreground p-6 rounded-2xl shadow-tactile flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Statistik Kode Dokumen</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center font-mono">
                  <div className="p-3 bg-foreground/5 border border-foreground/10 rounded-xl">
                    <span className="text-[10px] text-foreground/40 block">Ukuran File</span>
                    <span className="text-sm font-bold text-foreground">{result.htmlSizeKb} KB</span>
                  </div>
                  <div className="p-3 bg-foreground/5 border border-foreground/10 rounded-xl">
                    <span className="text-[10px] text-foreground/40 block">Tag Script (Inline/Ext)</span>
                    <span className="text-sm font-bold text-foreground">{result.scriptCount.inline} / {result.scriptCount.external}</span>
                  </div>
                  <div className="p-3 bg-foreground/5 border border-foreground/10 rounded-xl">
                    <span className="text-[10px] text-foreground/40 block">Tag CSS (Inline/Ext)</span>
                    <span className="text-sm font-bold text-foreground">{result.styleCount.inline} / {result.styleCount.external}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-foreground/60 leading-relaxed border-t border-foreground/5 pt-4 mt-4">
                <strong>Catatan Audit:</strong> Skor kinerja didasarkan pada audit optimasi awal. Untuk memantau waktu load riil (FCP, LCP, CLS), gunakan juga integrasi Google PageSpeed Insights resmi.
              </div>
            </div>
          </div>

          {/* Detailed Metric Checkboxes */}
          <div className="space-y-4">
            <h4 className="font-display text-sm uppercase tracking-wider text-foreground/75 border-b border-foreground/10 pb-2">Rincian Hasil Pengecekan</h4>
            
            {result.metrics.map((metric, idx) => {
              let badgeText = "Bagus";
              let badgeColor = "bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20";
              if (metric.status === "warning") {
                badgeText = "Peringatan";
                badgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
              } else if (metric.status === "error") {
                badgeText = "Buruk";
                badgeColor = "bg-destructive/10 text-destructive border-destructive/20";
              }

              return (
                <div key={idx} className="bg-card border-2 border-foreground p-5 rounded-2xl shadow-tactile-sm space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {metric.status === "pass" ? "🟢" : metric.status === "warning" ? "🟡" : "🔴"}
                      </span>
                      <h5 className="font-bold text-sm uppercase tracking-tight">{metric.name}</h5>
                    </div>
                    
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <span className="font-mono text-xs font-bold text-foreground/80 px-2 py-0.5 bg-foreground/5 rounded border border-foreground/10">
                        {metric.value}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeColor}`}>
                        {badgeText}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-foreground/60 font-sans leading-normal">{metric.desc}</p>
                  
                  <div className="p-3.5 bg-foreground/[0.02] border border-foreground/5 rounded-xl text-xs">
                    <span className="font-bold text-primary block uppercase tracking-wider text-[9px] mb-1">Rekomendasi Tindakan</span>
                    <span className="text-foreground/80 leading-relaxed font-sans">{metric.advice}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
