import { useState, useEffect } from "react";

export function OpenGraphGenerator() {
  const [title, setTitle] = useState("Palugada — Free Developer & Productivity Tools");
  const [description, setDescription] = useState("Kumpulan tools online gratis terlengkap mulai dari JSON Formatter, Barcode, WiFi QR, hingga kalkulator finansial.");
  const [url, setUrl] = useState("https://palugada.sqwerly.com");
  const [siteName, setSiteName] = useState("Palugada");
  const [imageUrl, setImageUrl] = useState("https://palugada.sqwerly.com/og-image.png");
  const [type, setType] = useState("website");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [copied, setCopied] = useState(false);

  const [domain, setDomain] = useState("palugada.sqwerly.com");

  useEffect(() => {
    try {
      const parsed = new URL(url);
      setDomain(parsed.hostname);
    } catch {
      setDomain("");
    }
  }, [url]);

  const tags = `<!-- HTML Meta Tags -->
<title>${title}</title>
<meta name="description" content="${description}">

<!-- Facebook Meta Tags -->
<meta property="og:url" content="${url}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${imageUrl}">
${siteName ? `<meta property="og:site_name" content="${siteName}">` : ""}

<!-- Twitter Meta Tags -->
<meta name="twitter:card" content="${twitterCard}">
${domain ? `<meta property="twitter:domain" content="${domain}">` : ""}
<meta property="twitter:url" content="${url}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${imageUrl}">`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Settings Form */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Pengaturan Meta Tags</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Judul Halaman (og:title)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Deskripsi Halaman (og:description)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">URL Halaman (og:url)</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Nama Situs (og:site_name)</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Tipe (og:type)</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              >
                <option value="website">Website</option>
                <option value="article">Article</option>
                <option value="book">Book</option>
                <option value="profile">Profile</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">URL Gambar Preview (og:image)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Tipe Twitter Card</label>
            <select
              value={twitterCard}
              onChange={(e) => setTwitterCard(e.target.value)}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            >
              <option value="summary_large_image">Summary with Large Image (Besar)</option>
              <option value="summary">Summary Card (Kecil)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preview & Code Panel */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Preview & HTML Output</h3>

          {/* Social Share Card Mockup */}
          <div className="bg-background border border-foreground/10 rounded-xl overflow-hidden mb-6">
            <div className="bg-foreground/5 px-4 py-2 border-b border-foreground/5 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
              <span className="text-[10px] text-foreground/40 font-mono ml-2">Preview Bagian Halaman</span>
            </div>
            
            {imageUrl && (
              <div className="aspect-[1.91/1] w-full bg-foreground/5 overflow-hidden flex items-center justify-center border-b border-foreground/5">
                <img
                  src={imageUrl}
                  alt="OG Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback visual
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="p-4 bg-card">
              <span className="text-[10px] font-mono text-foreground/40 uppercase block tracking-wider truncate">
                {domain || "domain.com"}
              </span>
              <h4 className="font-display text-lg uppercase mt-1 mb-1.5 text-foreground line-clamp-1">
                {title || "Judul Halaman Anda"}
              </h4>
              <p className="text-xs text-foreground/60 line-clamp-2 leading-relaxed">
                {description || "Deskripsi halaman Anda akan dimuat di sini untuk memberikan ringkasan konten kepada audiens."}
              </p>
            </div>
          </div>

          {/* HTML Meta View */}
          <div className="relative">
            <pre className="bg-background border border-foreground/15 p-4 rounded-xl font-mono text-xs overflow-auto max-h-[250px] leading-relaxed text-foreground/80">
              {tags}
            </pre>
          </div>
        </div>

        <div className="pt-6 border-t border-foreground/10">
          <button
            onClick={copyToClipboard}
            className="w-full h-12 bg-foreground text-background rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
          >
            {copied ? "Copied!" : "Copy HTML Meta Tags"}
          </button>
        </div>
      </div>
    </div>
  );
}
