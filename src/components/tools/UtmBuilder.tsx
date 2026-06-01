import { useState, useMemo } from "react";

interface UtmHistoryItem {
  url: string;
  timestamp: string;
}

const PRESETS = [
  {
    name: "Google Ads PPC",
    source: "google",
    medium: "cpc",
    campaign: "search_ads",
  },
  {
    name: "Facebook Social Post",
    source: "facebook",
    medium: "social",
    campaign: "organic_post",
  },
  {
    name: "Email Newsletter",
    source: "newsletter",
    medium: "email",
    campaign: "weekly_update",
  },
  {
    name: "LinkedIn Job Ad",
    source: "linkedin",
    medium: "job_board",
    campaign: "recruitment_2026",
  },
];

export function UtmBuilder() {
  const [websiteUrl, setWebsiteUrl] = useState("https://palugada.sqwerly.com");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");

  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<UtmHistoryItem[]>([]);

  const generatedUrl = useMemo(() => {
    if (!websiteUrl.trim()) return "";

    let cleanUrl = websiteUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = "https://" + cleanUrl;
    }

    try {
      const parsed = new URL(cleanUrl);

      if (utmSource.trim()) {
        parsed.searchParams.set("utm_source", utmSource.trim());
      }
      if (utmMedium.trim()) {
        parsed.searchParams.set("utm_medium", utmMedium.trim());
      }
      if (utmCampaign.trim()) {
        parsed.searchParams.set("utm_campaign", utmCampaign.trim());
      }
      if (utmTerm.trim()) {
        parsed.searchParams.set("utm_term", utmTerm.trim());
      }
      if (utmContent.trim()) {
        parsed.searchParams.set("utm_content", utmContent.trim());
      }

      return parsed.href;
    } catch {
      return "URL Tidak Valid";
    }
  }, [websiteUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent]);

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setUtmSource(preset.source);
    setUtmMedium(preset.medium);
    setUtmCampaign(preset.campaign);
  };

  const copyToClipboard = () => {
    if (!generatedUrl || generatedUrl === "URL Tidak Valid") return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);

    // Save to history if not duplicate of the last one
    if (history.length === 0 || history[0].url !== generatedUrl) {
      setHistory((prev) => [
        {
          url: generatedUrl,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        },
        ...prev.slice(0, 4), // Limit history to last 5 items
      ]);
    }

    setTimeout(() => setCopied(false), 2000);
  };

  const clearForm = () => {
    setUtmSource("");
    setUtmMedium("");
    setUtmCampaign("");
    setUtmTerm("");
    setUtmContent("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Editor Panel */}
      <div className="lg:col-span-7 space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <div className="flex justify-between items-center border-b border-foreground/10 pb-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">UTM Builder Form</h3>
          <button
            onClick={clearForm}
            className="text-xs text-destructive font-semibold uppercase hover:underline"
          >
            Clear Form
          </button>
        </div>

        {/* Presets Row */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-foreground/40 block">Pilih Preset Cepat</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 bg-background border border-foreground/10 hover:border-primary text-[10px] font-bold uppercase rounded-lg transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">
              Website URL <span className="text-primary font-bold">*</span>
            </label>
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="e.g. https://www.website.com/page"
              className="w-full h-10 px-3 bg-background border border-foreground/15 rounded-lg text-sm font-mono focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">
              Campaign Source <span className="text-primary font-bold">*</span>
            </label>
            <input
              type="text"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              placeholder="e.g. google, facebook, newsletter"
              className="w-full h-10 px-3 bg-background border border-foreground/15 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">
              Campaign Medium <span className="text-primary font-bold">*</span>
            </label>
            <input
              type="text"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              placeholder="e.g. cpc, email, banner, organic"
              className="w-full h-10 px-3 bg-background border border-foreground/15 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">
              Campaign Name <span className="text-primary font-bold">*</span>
            </label>
            <input
              type="text"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              placeholder="e.g. summer_promo, brand_awareness"
              className="w-full h-10 px-3 bg-background border border-foreground/15 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">
              Campaign Term (Optional)
            </label>
            <input
              type="text"
              value={utmTerm}
              onChange={(e) => setUtmTerm(e.target.value)}
              placeholder="e.g. target_keywords"
              className="w-full h-10 px-3 bg-background border border-foreground/15 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">
              Campaign Content (Optional)
            </label>
            <input
              type="text"
              value={utmContent}
              onChange={(e) => setUtmContent(e.target.value)}
              placeholder="e.g. blue_banner_ad, sidebar_link"
              className="w-full h-10 px-3 bg-background border border-foreground/15 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="font-display text-lg uppercase border-b border-foreground/10 pb-3">UTM Campaign URL</h3>

          {/* Generated URL Box */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Generated Link</span>
            <div className="relative">
              <pre className="bg-background border border-foreground/15 p-4 rounded-xl font-mono text-xs overflow-y-auto max-h-[140px] text-foreground/80 leading-relaxed break-all whitespace-pre-wrap">
                {generatedUrl || "Menunggu input URL target..."}
              </pre>
            </div>
            <button
              onClick={copyToClipboard}
              disabled={!generatedUrl || generatedUrl === "URL Tidak Valid" || !utmSource || !utmMedium || !utmCampaign}
              className="w-full h-12 bg-primary text-white rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-primary/95 transition-colors disabled:opacity-50"
            >
              {copied ? "Copied Link!" : "Copy Campaign Link"}
            </button>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-foreground/5">
              <span className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Riwayat Link Sesi Ini</span>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-foreground/[0.02] border border-foreground/10 rounded-lg flex justify-between items-center text-[10px] font-mono"
                  >
                    <span className="truncate max-w-[80%] text-foreground/70">{item.url}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(item.url)}
                      className="text-primary font-bold uppercase hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Explain Parameters */}
        <div className="bg-foreground/[0.02] border border-foreground/10 p-5 rounded-xl space-y-2.5">
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold">Penjelasan Parameter</h4>
          <div className="space-y-1.5 text-[11px] leading-relaxed text-foreground/75">
            <p><strong>utm_source:</strong> Platform tempat traffic berasal (e.g. google, newsletter).</p>
            <p><strong>utm_medium:</strong> Tipe media promosi kampanye (e.g. cpc, email, banner).</p>
            <p><strong>utm_campaign:</strong> Nama khusus program promo/iklan (e.g. summer_promo).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
