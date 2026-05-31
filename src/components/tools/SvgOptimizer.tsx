import { useState, useEffect } from "react";

export function SvgOptimizer() {
  const [svgInput, setSvgInput] = useState("");
  const [svgOutput, setSvgOutput] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [optimizedSize, setOptimizedSize] = useState(0);
  const [copied, setCopied] = useState(false);

  // Settings
  const [removeComments, setRemoveComments] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [minifyWhitespace, setMinifyWhitespace] = useState(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setSvgInput(text);
        setOriginalSize(text.length);
      };
      reader.readAsText(file);
    }
  };

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setSvgInput(val);
    setOriginalSize(val.length);
  };

  useEffect(() => {
    if (!svgInput) {
      setSvgOutput("");
      setOptimizedSize(0);
      return;
    }

    let optimized = svgInput;

    // 1. Remove comments: <!-- ... -->
    if (removeComments) {
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, "");
    }

    // 2. Remove metadata: <metadata>...</metadata>
    if (removeMetadata) {
      optimized = optimized.replace(/<metadata>[\s\S]*?<\/metadata>/gi, "");
    }

    // 3. Minify whitespace
    if (minifyWhitespace) {
      optimized = optimized
        .replace(/>\s+</g, "><") // Remove space between tags
        .replace(/\s{2,}/g, " ") // Collapse multiple spaces
        .trim();
    }

    setSvgOutput(optimized);
    setOptimizedSize(optimized.length);
  }, [svgInput, removeComments, removeMetadata, minifyWhitespace]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(svgOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([svgOutput], { type: "image/svg+xml" });
    element.href = URL.createObjectURL(file);
    element.download = "optimized.svg";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const savedPercent = originalSize ? Math.round(((originalSize - optimizedSize) / originalSize) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor & Input */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Masukkan SVG</h3>
          <input
            type="file"
            accept=".svg"
            onChange={handleFileUpload}
            className="text-xs text-foreground/50 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-foreground file:text-background cursor-pointer"
          />
        </div>

        <textarea
          value={svgInput}
          onChange={handlePaste}
          placeholder="Tempel kode SVG Anda di sini..."
          rows={8}
          className="w-full p-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-xs font-mono resize-none leading-relaxed"
        />

        {/* Optimizations Config */}
        <div className="space-y-3 pt-4 border-t border-foreground/10">
          <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Aturan Optimasi</h4>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="comments"
              checked={removeComments}
              onChange={(e) => setRemoveComments(e.target.checked)}
              className="w-4 h-4 text-primary border-foreground/15 rounded"
            />
            <label htmlFor="comments" className="text-xs font-mono uppercase tracking-wider text-foreground/70 cursor-pointer">
              Hapus Komentar HTML
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="metadata"
              checked={removeMetadata}
              onChange={(e) => setRemoveMetadata(e.target.checked)}
              className="w-4 h-4 text-primary border-foreground/15 rounded"
            />
            <label htmlFor="metadata" className="text-xs font-mono uppercase tracking-wider text-foreground/70 cursor-pointer">
              Hapus Metadata Tag
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="minify"
              checked={minifyWhitespace}
              onChange={(e) => setMinifyWhitespace(e.target.checked)}
              className="w-4 h-4 text-primary border-foreground/15 rounded"
            />
            <label htmlFor="minify" className="text-xs font-mono uppercase tracking-wider text-foreground/70 cursor-pointer">
              Minify Spasi & Whitespace
            </label>
          </div>
        </div>
      </div>

      {/* Preview & Compare */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Hasil & Perbandingan</h3>

          {!svgOutput ? (
            <div className="bg-foreground/5 border border-foreground/10 text-foreground/60 p-8 rounded-xl text-center flex flex-col items-center justify-center min-h-[250px]">
              <span className="text-3xl mb-2">⚡</span>
              <p className="text-sm">Masukkan SVG untuk memproses optimasi secara langsung.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Size metrics comparison */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-background border border-foreground/10 p-3 rounded-lg">
                  <span className="text-[10px] font-mono text-foreground/40 uppercase block">Ukuran Asli</span>
                  <span className="text-sm font-bold font-mono">{(originalSize / 1024).toFixed(2)} KB</span>
                </div>
                <div className="bg-background border border-foreground/10 p-3 rounded-lg">
                  <span className="text-[10px] font-mono text-foreground/40 uppercase block">Optimasi</span>
                  <span className="text-sm font-bold font-mono">{(optimizedSize / 1024).toFixed(2)} KB</span>
                </div>
                <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg text-primary">
                  <span className="text-[10px] font-mono uppercase block text-primary/60">Hemat</span>
                  <span className="text-sm font-bold font-mono">-{savedPercent}%</span>
                </div>
              </div>

              {/* Visual Render Preview */}
              <div className="bg-background border border-foreground/10 rounded-xl p-6 flex flex-col items-center justify-center min-h-[150px]">
                <div className="max-w-[200px] max-h-[150px] overflow-hidden" dangerouslySetInnerHTML={{ __html: svgOutput }} />
                <span className="text-[10px] text-foreground/40 font-mono mt-3">Render Visual SVG</span>
              </div>
            </div>
          )}
        </div>

        {svgOutput && (
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-foreground/10">
            <button
              onClick={copyToClipboard}
              className="flex-1 h-12 bg-foreground text-background rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
            >
              {copied ? "Copied!" : "Salin Kode SVG"}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 h-12 bg-background border-2 border-foreground text-foreground rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/5 transition-colors"
            >
              Download SVG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
