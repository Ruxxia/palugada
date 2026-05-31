import { useState } from "react";

export function MetaTagGenerator() {
  const [title, setTitle] = useState("Palugada — Free Online Tools");
  const [description, setDescription] = useState("Kumpulan tools online gratis terlengkap untuk produktivitas.");
  const [keywords, setKeywords] = useState("tools, gratis, developer, formatter, calculator");
  const [author, setAuthor] = useState("Palugada Team");
  const [robotsIndex, setRobotsIndex] = useState("index");
  const [robotsFollow, setRobotsFollow] = useState("follow");
  const [language, setLanguage] = useState("Indonesian");
  const [revisitAfter, setRevisitAfter] = useState("7 days");
  const [copied, setCopied] = useState(false);

  const tags = `<!-- Meta Tags Generated with Palugada -->
<meta name="title" content="${title}">
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords}">
<meta name="robots" content="${robotsIndex}, ${robotsFollow}">
<meta name="language" content="${language}">
<meta name="revisit-after" content="${revisitAfter}">
<meta name="author" content="${author}">`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtml = () => {
    const element = document.createElement("a");
    const file = new Blob([tags], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "meta-tags.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor Panel */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Konfigurasi SEO Meta Tags</h3>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Judul Halaman (Title)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Deskripsi Halaman (Description)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
            />
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Kata Kunci (Keywords - pisahkan dengan koma)</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. seo, website, tools"
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Pembuat Halaman (Author)</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            />
          </div>

          {/* Robots Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Index Robots</label>
              <select
                value={robotsIndex}
                onChange={(e) => setRobotsIndex(e.target.value)}
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              >
                <option value="index">Index (Izinkan mesin pencari men-index)</option>
                <option value="noindex">Noindex (Larang mesin pencari men-index)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Follow Robots</label>
              <select
                value={robotsFollow}
                onChange={(e) => setRobotsFollow(e.target.value)}
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              >
                <option value="follow">Follow (Ikuti tautan halaman)</option>
                <option value="nofollow">Nofollow (Jangan ikuti tautan halaman)</option>
              </select>
            </div>
          </div>

          {/* Language & Revisit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Bahasa Situs</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Kunjungan Ulang Bot</label>
              <select
                value={revisitAfter}
                onChange={(e) => setRevisitAfter(e.target.value)}
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              >
                <option value="1 days">1 Hari</option>
                <option value="7 days">7 Hari</option>
                <option value="14 days">14 Hari</option>
                <option value="30 days">30 Hari</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Kode Meta Tags</h3>

          <div className="relative">
            <pre className="bg-background border border-foreground/15 p-4 rounded-xl font-mono text-xs overflow-auto max-h-[350px] leading-relaxed text-foreground/80">
              {tags}
            </pre>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-foreground/10">
          <button
            onClick={copyToClipboard}
            className="flex-1 h-12 bg-foreground text-background rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
          >
            {copied ? "Copied!" : "Copy Meta Tags"}
          </button>
          <button
            onClick={downloadHtml}
            className="flex-1 h-12 bg-background border-2 border-foreground text-foreground rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/5 transition-colors"
          >
            Download TXT File
          </button>
        </div>
      </div>
    </div>
  );
}
