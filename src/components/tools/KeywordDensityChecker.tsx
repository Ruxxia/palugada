import { useState, useMemo } from "react";

// Common stop words in Indonesian and English
const STOP_WORDS = new Set([
  // Indonesian
  "yang", "di", "ke", "dari", "pada", "dalam", "untuk", "dengan", "dan", "atau", "adalah", "itu", "ini", "ia", "mereka", "kita", "kami", "kamu", "saya", "dia", "oleh", "juga", "bahwa", "sebagai", "untuk", "ada", "telah", "bisa", "dapat", "akan", "tidak", "belum", "sudah", "tetapi", "namun", "karena", "sehingga", "maka", "jika", "kalau", "ketika", "lalu", "kemudian", "serta",
  // English
  "the", "a", "an", "and", "or", "but", "if", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
]);

export function KeywordDensityChecker() {
  const [text, setText] = useState("");
  const [excludeStopWords, setExcludeStopWords] = useState(true);
  const [minWordLength, setMinWordLength] = useState(3);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [activeTab, setActiveTab] = useState<"1-word" | "2-word" | "3-word">("1-word");

  const cleanedWords = useMemo(() => {
    if (!text.trim()) return [];

    // Replace punctuation with spaces
    let processedText = text;
    if (!caseSensitive) {
      processedText = processedText.toLowerCase();
    }

    const rawWords = processedText
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’[\]\n\r]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 0);

    return rawWords.filter((word) => {
      // Filter by length
      if (word.length < minWordLength) return false;
      // Filter stop words if checked
      if (excludeStopWords && STOP_WORDS.has(word.toLowerCase())) return false;
      // Exclude numbers only
      if (/^\d+$/.test(word)) return false;
      return true;
    });
  }, [text, excludeStopWords, minWordLength, caseSensitive]);

  // Compute Unigrams
  const unigrams = useMemo(() => {
    const counts: Record<string, number> = {};
    cleanedWords.forEach((word) => {
      counts[word] = (counts[word] || 0) + 1;
    });

    const total = cleanedWords.length;
    return Object.entries(counts)
      .map(([word, count]) => ({
        keyword: word,
        count,
        density: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [cleanedWords]);

  // Compute Bigrams (2 words)
  const bigrams = useMemo(() => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < cleanedWords.length - 1; i++) {
      const phrase = `${cleanedWords[i]} ${cleanedWords[i + 1]}`;
      counts[phrase] = (counts[phrase] || 0) + 1;
    }

    const total = Math.max(0, cleanedWords.length - 1);
    return Object.entries(counts)
      .map(([keyword, count]) => ({
        keyword,
        count,
        density: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [cleanedWords]);

  // Compute Trigrams (3 words)
  const trigrams = useMemo(() => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < cleanedWords.length - 2; i++) {
      const phrase = `${cleanedWords[i]} ${cleanedWords[i + 1]} ${cleanedWords[i + 2]}`;
      counts[phrase] = (counts[phrase] || 0) + 1;
    }

    const total = Math.max(0, cleanedWords.length - 2);
    return Object.entries(counts)
      .map(([keyword, count]) => ({
        keyword,
        count,
        density: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [cleanedWords]);

  const activeResults = useMemo(() => {
    if (activeTab === "1-word") return unigrams;
    if (activeTab === "2-word") return bigrams;
    return trigrams;
  }, [activeTab, unigrams, bigrams, trigrams]);

  const totalWords = text.trim() ? text.trim().split(/\s+/).length : 0;
  const filteredWordsCount = cleanedWords.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Editor / Input Panel */}
      <div className="lg:col-span-6 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">
            Masukkan Konten Teks / Artikel
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ketik atau tempel artikel Anda di sini untuk memeriksa kepadatan kata kunci..."
            rows={12}
            className="w-full p-4 bg-background border border-foreground/15 rounded-xl focus:outline-none focus:border-primary text-sm font-sans resize-none leading-relaxed"
          />
          <div className="flex justify-between items-center text-xs font-mono text-foreground/40 px-1">
            <span>Total Kata: {totalWords}</span>
            <span>Kata Terfilter: {filteredWordsCount}</span>
          </div>
        </div>

        {/* Options */}
        <div className="bg-foreground/[0.02] border border-foreground/10 p-5 rounded-xl space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold">Opsi Analisis</h4>
          
          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={excludeStopWords}
                onChange={(e) => setExcludeStopWords(e.target.checked)}
                className="w-4 h-4 rounded border-foreground/30 accent-primary"
              />
              <span>Abaikan Kata Hubung (Stop Words ID/EN)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="w-4 h-4 rounded border-foreground/30 accent-primary"
              />
              <span>Sensitif Huruf Besar/Kecil</span>
            </label>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono uppercase tracking-wider text-foreground/50">Panjang Kata Minimal</span>
              <select
                value={minWordLength}
                onChange={(e) => setMinWordLength(Number(e.target.value))}
                className="bg-background border border-foreground/15 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-primary font-mono"
              >
                <option value={1}>1 Karakter</option>
                <option value={2}>2 Karakter</option>
                <option value={3}>3 Karakter</option>
                <option value={4}>4 Karakter</option>
                <option value={5}>5 Karakter</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-6 space-y-6">
        <div className="flex justify-between items-center border-b border-foreground/10 pb-3">
          <h3 className="font-display text-lg uppercase">Kepadatan Kata Kunci</h3>
          
          {/* Tabs */}
          <div className="flex bg-foreground/5 p-1 rounded-lg">
            {(["1-word", "2-word", "3-word"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
                  activeTab === tab ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {tab.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {activeResults.length === 0 ? (
          <div className="text-center py-20 text-foreground/40 border border-dashed border-foreground/15 rounded-xl">
            <span className="text-3xl block mb-2">📊</span>
            <p className="text-sm font-medium">Belum ada data untuk dianalisis</p>
            <p className="text-xs text-foreground/40 mt-1">Silakan masukkan teks terlebih dahulu di panel kiri.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-[400px] overflow-y-auto pr-1 space-y-3">
              {activeResults.slice(0, 50).map((item, idx) => {
                const isWarning = item.density > 3.0; // SEO Warning
                return (
                  <div
                    key={idx}
                    className="p-3 bg-foreground/[0.02] border border-foreground/10 rounded-lg flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm font-bold text-foreground/80 truncate max-w-[70%]">
                        {item.keyword}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-foreground/5 px-2 py-0.5 rounded text-foreground/50">
                          {item.count}x
                        </span>
                        <span
                          className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                            isWarning
                              ? "bg-destructive/10 text-destructive"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {item.density.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-foreground/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isWarning ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${Math.min(100, item.density * 15)}%` }}
                      />
                    </div>

                    {isWarning && (
                      <span className="text-[10px] text-destructive/80 font-mono">
                        ⚠️ Kepadatan tinggi (Keyword Stuffing). Sebaiknya dikurangi.
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl space-y-2">
              <h5 className="text-xs font-bold text-primary uppercase tracking-wider">💡 Tips SEO Kepadatan Kata Kunci</h5>
              <ul className="text-xs text-foreground/70 space-y-1 list-disc list-inside">
                <li>Pertahankan kepadatan kata kunci utama Anda antara <strong>1% hingga 2.5%</strong>.</li>
                <li>Kepadatan di atas <strong>3%</strong> berisiko dianggap sebagai spam (keyword stuffing) oleh robot perayap Google.</li>
                <li>Gunakan sinonim atau variasi kata kunci (LSI Keywords) agar tulisan terdengar lebih alami dan kaya.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
