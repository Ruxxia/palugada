import { useState } from "react";

export function SerpPreviewTool() {
  const [title, setTitle] = useState("Palugada — Directory Online Tools Gratis Indonesia");
  const [description, setDescription] = useState(
    "Temukan puluhan tool online gratis terlengkap untuk web developer, desainer gambar, perhitungan kalkulator keuangan, zakat, converter satuan, dan utility harian."
  );
  const [url, setUrl] = useState("https://palugada.sqwerly.com/tools/serp-preview");
  const [keyword, setKeyword] = useState("");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  // Highlight keywords by splitting and wrapping in <strong>
  const highlightText = (text: string, search: string) => {
    if (!search.trim() || !text) return text;
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <strong key={i} className="text-foreground font-extrabold bg-foreground/10 px-0.5 rounded">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const getCleanUrlDisplay = () => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname;
      const pathSegments = parsed.pathname.split("/").filter(Boolean);
      return { host, pathSegments };
    } catch {
      return { host: "palugada.sqwerly.com", pathSegments: ["tools", "serp-preview"] };
    }
  };

  const { host, pathSegments } = getCleanUrlDisplay();

  const titleLen = title.length;
  const descLen = description.length;

  const isTitleOptimal = titleLen >= 50 && titleLen <= 60;
  const isDescOptimal = descLen >= 120 && descLen <= 160;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Configuration Input */}
      <div className="lg:col-span-5 space-y-5 bg-card border border-foreground/10 p-5 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 border-b border-foreground/5 pb-2">
          SEO SERP Configurator
        </h3>

        <div className="space-y-4">
          {/* Target URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Target URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://domain.com/halaman"
              className="w-full h-10 px-3 bg-background border border-foreground/15 rounded-lg text-xs font-mono focus:outline-none focus:border-primary"
            />
          </div>

          {/* Page Title */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-mono uppercase tracking-wider text-foreground/50">Page Title</label>
              <span className={`font-mono font-bold ${isTitleOptimal ? "text-primary" : "text-foreground/40"}`}>
                {titleLen} / 60 Chars
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul halaman..."
              className="w-full h-10 px-3 bg-background border border-foreground/15 rounded-lg text-sm focus:outline-none focus:border-primary font-semibold"
            />
            {/* Title Progress Bar */}
            <div className="w-full bg-foreground/5 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  titleLen > 60 ? "bg-amber-500" : titleLen >= 50 ? "bg-primary" : "bg-foreground/20"
                }`}
                style={{ width: `${Math.min(100, (titleLen / 60) * 100)}%` }}
              />
            </div>
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-mono uppercase tracking-wider text-foreground/50">Meta Description</label>
              <span className={`font-mono font-bold ${isDescOptimal ? "text-primary" : "text-foreground/40"}`}>
                {descLen} / 160 Chars
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukkan deskripsi meta..."
              rows={4}
              className="w-full p-3 bg-background border border-foreground/15 rounded-lg text-xs focus:outline-none focus:border-primary resize-none leading-relaxed"
            />
            {/* Desc Progress Bar */}
            <div className="w-full bg-foreground/5 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  descLen > 160 ? "bg-amber-500" : descLen >= 120 ? "bg-primary" : "bg-foreground/20"
                }`}
                style={{ width: `${Math.min(100, (descLen / 160) * 100)}%` }}
              />
            </div>
          </div>

          {/* Keyword Bold Test */}
          <div className="space-y-1.5 pt-2 border-t border-foreground/5">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Bold Keyword (Uji Fokus)</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. tool online gratis"
              className="w-full h-10 px-3 bg-background border border-foreground/15 rounded-lg text-xs focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Live Preview Panel */}
      <div className="lg:col-span-7 space-y-6 flex flex-col">
        <div className="flex justify-between items-center border-b border-foreground/10 pb-3">
          <h3 className="font-display text-lg uppercase">SERP Google Preview</h3>

          {/* View Toggle */}
          <div className="flex bg-foreground/5 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("desktop")}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
                viewMode === "desktop" ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
                viewMode === "mobile" ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Mobile
            </button>
          </div>
        </div>

        {/* MOCK GOOGLE SEARCH RESULT CARD */}
        <div className="flex-1 bg-white dark:bg-[#171717] border border-foreground/10 p-6 rounded-2xl flex items-center justify-center min-h-[220px]">
          {viewMode === "desktop" ? (
            /* DESKTOP GOOGLE PREVIEW */
            <div className="w-full max-w-[600px] font-sans text-left space-y-1.5 select-none">
              {/* URL Breadcrumb */}
              <div className="text-[14px] text-[#202124] dark:text-[#dadce0] flex items-center gap-1 leading-tight">
                <span>{host}</span>
                {pathSegments.map((seg, idx) => (
                  <span key={idx} className="flex items-center">
                    <span className="text-[#70757a] dark:text-[#9aa0a6] mx-0.5">›</span>
                    <span className="text-[#70757a] dark:text-[#9aa0a6]">{seg}</span>
                  </span>
                ))}
              </div>

              {/* Title Link */}
              <h4 className="text-[20px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-normal leading-tight font-sans line-clamp-1">
                {title ? highlightText(title, keyword) : "Silakan masukkan judul..."}
              </h4>

              {/* Description Snippet */}
              <p className="text-[14px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed font-sans line-clamp-2">
                {description
                  ? highlightText(description, keyword)
                  : "Silakan masukkan penjelasan singkat deskripsi meta halaman Anda..."}
              </p>
            </div>
          ) : (
            /* MOBILE GOOGLE PREVIEW */
            <div className="w-full max-w-[375px] bg-[#f8f9fa] dark:bg-[#202124] border border-foreground/10 rounded-xl p-4 font-sans text-left space-y-2.5 shadow-sm">
              {/* Meta Brand Row */}
              <div className="flex items-center gap-2">
                {/* Mock Favicon */}
                <div className="w-6 h-6 rounded-full bg-foreground/10 border border-foreground/5 flex items-center justify-center font-mono text-[10px] font-extrabold text-foreground/60 shrink-0">
                  {host.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-semibold text-[#202124] dark:text-[#dadce0]">{host}</span>
                  <span className="text-[10px] text-[#70757a] dark:text-[#9aa0a6] truncate max-w-[200px]">
                    {url}
                  </span>
                </div>
              </div>

              {/* Title Link */}
              <h4 className="text-[18px] text-[#1a0dab] dark:text-[#8ab4f8] font-normal leading-snug cursor-pointer line-clamp-2">
                {title ? highlightText(title, keyword) : "Silakan masukkan judul..."}
              </h4>

              {/* Description Snippet */}
              <p className="text-[12px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-3">
                {description
                  ? highlightText(description, keyword)
                  : "Silakan masukkan penjelasan singkat deskripsi meta halaman..."}
              </p>
            </div>
          )}
        </div>

        {/* SEO Guidelines Checklist */}
        <div className="bg-foreground/[0.02] border border-foreground/10 p-5 rounded-xl space-y-3.5">
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold">SEO Audit Checklist</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2">
              <span className={isTitleOptimal ? "text-[#25D366]" : "text-amber-500"}>
                {isTitleOptimal ? "✓" : "⚠"}
              </span>
              <div>
                <p className="font-bold">Panjang Judul Halaman</p>
                <p className="text-foreground/60">
                  {isTitleOptimal
                    ? "Sempurna. Pas dengan batas piksel Google."
                    : "Idealnya antara 50-60 karakter agar tidak terpotong."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className={isDescOptimal ? "text-[#25D366]" : "text-amber-500"}>
                {isDescOptimal ? "✓" : "⚠"}
              </span>
              <div>
                <p className="font-bold">Panjang Deskripsi Meta</p>
                <p className="text-foreground/60">
                  {isDescOptimal
                    ? "Sempurna. Cukup menjelaskan isi halaman tanpa terpotong."
                    : "Idealnya antara 120-160 karakter untuk performa CTR optimal."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
