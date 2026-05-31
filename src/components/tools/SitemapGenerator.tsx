import { useState, useEffect } from "react";

interface SitemapItem {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

export function SitemapGenerator() {
  const [items, setItems] = useState<SitemapItem[]>([
    { loc: "https://palugada.sqwerly.com/", lastmod: new Date().toISOString().split("T")[0], changefreq: "daily", priority: "1.0" },
    { loc: "https://palugada.sqwerly.com/about", lastmod: new Date().toISOString().split("T")[0], changefreq: "monthly", priority: "0.8" },
  ]);
  const [bulkText, setBulkText] = useState("");
  const [defaultChangeFreq, setDefaultChangeFreq] = useState("weekly");
  const [defaultPriority, setDefaultPriority] = useState("0.8");
  const [xmlOutput, setXmlOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);

  useEffect(() => {
    let output = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    output += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    items.forEach((item) => {
      if (!item.loc) return;
      output += `  <url>\n`;
      output += `    <loc>${item.loc}</loc>\n`;
      if (item.lastmod) {
        output += `    <lastmod>${item.lastmod}</lastmod>\n`;
      }
      if (item.changefreq) {
        output += `    <changefreq>${item.changefreq}</changefreq>\n`;
      }
      if (item.priority) {
        output += `    <priority>${item.priority}</priority>\n`;
      }
      output += `  </url>\n`;
    });

    output += `</urlset>`;
    setXmlOutput(output);
  }, [items]);

  const addItem = () => {
    setItems([...items, { loc: "", lastmod: new Date().toISOString().split("T")[0], changefreq: "weekly", priority: "0.5" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SitemapItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleBulkImport = () => {
    const lines = bulkText.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
    const dateStr = new Date().toISOString().split("T")[0];
    const newItems = lines.map((url) => ({
      loc: url,
      lastmod: dateStr,
      changefreq: defaultChangeFreq,
      priority: defaultPriority,
    }));
    setItems(newItems);
    setIsBulkMode(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(xmlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([xmlOutput], { type: "text/xml" });
    element.href = URL.createObjectURL(file);
    element.download = "sitemap.xml";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor Panel */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Konfigurasi XML Sitemap</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsBulkMode(false)}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-colors ${
                !isBulkMode ? "bg-foreground text-background" : "bg-foreground/10 text-foreground/70"
              }`}
            >
              Manual List
            </button>
            <button
              onClick={() => setIsBulkMode(true)}
              className={`px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition-colors ${
                isBulkMode ? "bg-foreground text-background" : "bg-foreground/10 text-foreground/70"
              }`}
            >
              Bulk Import
            </button>
          </div>
        </div>

        {isBulkMode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Masukkan Daftar URL (Satu per baris)</label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="https://example.com/&#10;https://example.com/page1&#10;https://example.com/page2"
                rows={8}
                className="w-full p-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm resize-none font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Frekuensi Default</label>
                <select
                  value={defaultChangeFreq}
                  onChange={(e) => setDefaultChangeFreq(e.target.value)}
                  className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
                >
                  <option value="always">Always</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Prioritas Default</label>
                <select
                  value={defaultPriority}
                  onChange={(e) => setDefaultPriority(e.target.value)}
                  className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
                >
                  <option value="1.0">1.0 (Tertinggi)</option>
                  <option value="0.8">0.8</option>
                  <option value="0.5">0.5</option>
                  <option value="0.3">0.3</option>
                  <option value="0.1">0.1 (Terendah)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleBulkImport}
              className="w-full h-11 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-colors"
            >
              Generate dari Bulk List
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50">Daftar Link Halaman</label>
              <button
                onClick={addItem}
                className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold uppercase rounded-lg transition-colors"
              >
                + Tambah URL
              </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-background border border-foreground/10 rounded-xl space-y-2 relative group">
                  <button
                    onClick={() => removeItem(idx)}
                    className="absolute top-2 right-2 text-[10px] text-destructive hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Hapus
                  </button>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-foreground/40 block">URL #{idx + 1}</span>
                    <input
                      type="text"
                      value={item.loc}
                      onChange={(e) => updateItem(idx, "loc", e.target.value)}
                      placeholder="e.g. https://domain.com/halaman"
                      className="w-full h-9 px-3 bg-card border border-foreground/15 rounded text-xs focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[8px] font-mono text-foreground/40 uppercase block">Frekuensi</span>
                      <select
                        value={item.changefreq}
                        onChange={(e) => updateItem(idx, "changefreq", e.target.value)}
                        className="w-full h-8 px-1.5 bg-card border border-foreground/15 rounded text-[10px] focus:outline-none"
                      >
                        <option value="always">Always</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono text-foreground/40 uppercase block">Prioritas</span>
                      <select
                        value={item.priority}
                        onChange={(e) => updateItem(idx, "priority", e.target.value)}
                        className="w-full h-8 px-1.5 bg-card border border-foreground/15 rounded text-[10px] focus:outline-none"
                      >
                        <option value="1.0">1.0</option>
                        <option value="0.8">0.8</option>
                        <option value="0.5">0.5</option>
                        <option value="0.3">0.3</option>
                        <option value="0.1">0.1</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono text-foreground/40 uppercase block">Terakhir Modifikasi</span>
                      <input
                        type="date"
                        value={item.lastmod}
                        onChange={(e) => updateItem(idx, "lastmod", e.target.value)}
                        className="w-full h-8 px-1.5 bg-card border border-foreground/15 rounded text-[10px] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Output Panel */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Preview sitemap.xml</h3>

          <div className="relative">
            <pre className="bg-background border border-foreground/15 p-4 rounded-xl font-mono text-xs overflow-auto max-h-[350px] leading-relaxed text-foreground/80">
              {xmlOutput}
            </pre>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-foreground/10">
          <button
            onClick={copyToClipboard}
            className="flex-1 h-12 bg-foreground text-background rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
          >
            {copied ? "Copied!" : "Copy sitemap.xml"}
          </button>
          <button
            onClick={downloadFile}
            className="flex-1 h-12 bg-background border-2 border-foreground text-foreground rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/5 transition-colors"
          >
            Download File
          </button>
        </div>
      </div>
    </div>
  );
}
