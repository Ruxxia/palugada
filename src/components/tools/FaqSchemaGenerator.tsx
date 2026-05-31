import { useState, useEffect } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSchemaGenerator() {
  const [faqs, setFaqs] = useState<FaqItem[]>([
    { question: "Apa itu Palugada?", answer: "Palugada adalah direktori online tools gratis terlengkap untuk membantu pekerjaan harian Anda." },
  ]);
  const [jsonLd, setJsonLd] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((f) => ({
        "@type": "Question",
        "name": f.question || "Pertanyaan",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer || "Jawaban"
        }
      }))
    };
    setJsonLd(JSON.stringify(schema, null, 2));
  }, [faqs]);

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const removeFaq = (index: number) => {
    if (faqs.length === 1) return;
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: keyof FaqItem, value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`<script type="application/ld+json">\n${jsonLd}\n</script>`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* FAQ Items Editor */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Edit Daftar FAQ</h3>
          <button
            onClick={addFaq}
            className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold uppercase rounded-lg transition-colors"
          >
            + Tambah FAQ
          </button>
        </div>

        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
          {faqs.map((faq, index) => (
            <div key={index} className="space-y-3 p-4 bg-background border border-foreground/10 rounded-xl relative group">
              {faqs.length > 1 && (
                <button
                  onClick={() => removeFaq(index)}
                  className="absolute top-3 right-3 text-xs text-destructive hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Hapus
                </button>
              )}
              <span className="text-[10px] font-mono text-foreground/40 block">PERTANYAAN #{index + 1}</span>
              
              {/* Question */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => updateFaq(index, "question", e.target.value)}
                  placeholder="e.g. Berapa lama proses pengiriman?"
                  className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
                />
              </div>

              {/* Answer */}
              <div className="space-y-1">
                <textarea
                  value={faq.answer}
                  onChange={(e) => updateFaq(index, "answer", e.target.value)}
                  placeholder="e.g. Kami memproses pengiriman dalam waktu 1-3 hari kerja..."
                  rows={3}
                  className="w-full p-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* JSON-LD Preview Panel */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Schema JSON-LD</h3>

          <div className="relative">
            <pre className="bg-background border border-foreground/15 p-4 rounded-xl font-mono text-xs overflow-auto max-h-[350px] leading-relaxed text-foreground/80">
              {`<!-- Copy kode berikut ke bagian <head> website Anda -->\n`}
              {`<script type="application/ld+json">\n`}
              {jsonLd}
              {`\n</script>`}
            </pre>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-foreground/10">
          <button
            onClick={copyToClipboard}
            className="flex-1 h-12 bg-foreground text-background rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
          >
            {copied ? "Copied!" : "Copy JSON-LD"}
          </button>
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center h-12 bg-background border-2 border-foreground text-foreground rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/5 transition-colors"
          >
            Tes Rich Results
          </a>
        </div>
      </div>
    </div>
  );
}
