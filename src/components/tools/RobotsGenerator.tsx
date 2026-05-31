import { useState, useEffect } from "react";

interface Rule {
  userAgent: string;
  type: "Allow" | "Disallow";
  path: string;
}

export function RobotsGenerator() {
  const [sitemap, setSitemap] = useState("https://palugada.sqwerly.com/sitemap.xml");
  const [crawlDelay, setCrawlDelay] = useState("");
  const [rules, setRules] = useState<Rule[]>([
    { userAgent: "*", type: "Disallow", path: "/admin/" },
    { userAgent: "*", type: "Disallow", path: "/tmp/" },
  ]);
  const [robotsTxt, setRobotsTxt] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let output = `# Robots.txt Generated with Palugada\n`;
    
    // Group rules by User-agent
    const uas = Array.from(new Set(rules.map((r) => r.userAgent)));
    
    uas.forEach((ua) => {
      output += `\nUser-agent: ${ua}\n`;
      if (crawlDelay) {
        output += `Crawl-delay: ${crawlDelay}\n`;
      }
      
      const uaRules = rules.filter((r) => r.userAgent === ua);
      uaRules.forEach((r) => {
        output += `${r.type}: ${r.path}\n`;
      });
    });

    // If no rules exist
    if (uas.length === 0) {
      output += `\nUser-agent: *\nAllow: /\n`;
    }

    if (sitemap) {
      output += `\nSitemap: ${sitemap}\n`;
    }

    setRobotsTxt(output);
  }, [sitemap, crawlDelay, rules]);

  const addRule = () => {
    setRules([...rules, { userAgent: "*", type: "Disallow", path: "" }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof Rule, value: string) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    setRules(updated);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(robotsTxt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([robotsTxt], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "robots.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Configuration Panel */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Konfigurasi robots.txt</h3>

        <div className="space-y-4">
          {/* Sitemap */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">URL Sitemap Halaman</label>
            <input
              type="text"
              value={sitemap}
              onChange={(e) => setSitemap(e.target.value)}
              placeholder="e.g. https://domain.com/sitemap.xml"
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            />
          </div>

          {/* Crawl Delay */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Crawl Delay (Detik - Opsional)</label>
            <select
              value={crawlDelay}
              onChange={(e) => setCrawlDelay(e.target.value)}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            >
              <option value="">Tanpa Delay</option>
              <option value="2">2 Detik</option>
              <option value="5">5 Detik</option>
              <option value="10">10 Detik</option>
            </select>
          </div>

          {/* Rules List */}
          <div className="space-y-4 pt-4 border-t border-foreground/10">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50">Daftar Direktori & Crawl Bot</label>
              <button
                onClick={addRule}
                className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold uppercase rounded-lg transition-colors"
              >
                + Tambah Aturan
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex gap-2 items-center p-3 bg-background border border-foreground/10 rounded-xl relative group">
                  <select
                    value={rule.userAgent}
                    onChange={(e) => updateRule(idx, "userAgent", e.target.value)}
                    className="w-28 h-9 px-2 bg-card border border-foreground/15 rounded focus:outline-none text-xs"
                  >
                    <option value="*">Semua Bot (*)</option>
                    <option value="Googlebot">Googlebot</option>
                    <option value="Bingbot">Bingbot</option>
                    <option value="Yandex">YandexBot</option>
                    <option value="Baiduspider">Baiduspider</option>
                  </select>
                  <select
                    value={rule.type}
                    onChange={(e) => updateRule(idx, "type", e.target.value as "Allow" | "Disallow")}
                    className="w-24 h-9 px-2 bg-card border border-foreground/15 rounded focus:outline-none text-xs"
                  >
                    <option value="Disallow">Disallow</option>
                    <option value="Allow">Allow</option>
                  </select>
                  <input
                    type="text"
                    value={rule.path}
                    onChange={(e) => updateRule(idx, "path", e.target.value)}
                    placeholder="e.g. /private/"
                    className="flex-1 h-9 px-3 bg-card border border-foreground/15 rounded focus:outline-none text-xs font-mono"
                  />
                  <button
                    onClick={() => removeRule(idx)}
                    className="text-xs text-destructive px-2 py-1 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Preview robots.txt</h3>

          <div className="relative">
            <pre className="bg-background border border-foreground/15 p-4 rounded-xl font-mono text-xs overflow-auto max-h-[350px] leading-relaxed text-foreground/85">
              {robotsTxt}
            </pre>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-foreground/10">
          <button
            onClick={copyToClipboard}
            className="flex-1 h-12 bg-foreground text-background rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
          >
            {copied ? "Copied!" : "Copy robots.txt"}
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
