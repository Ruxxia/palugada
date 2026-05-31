import { useState, useRef, useEffect } from "react";

export function ImageResizer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResizedUrl(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setOrigWidth(img.width);
        setOrigHeight(img.height);
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && origWidth > 0) {
      setHeight(Math.round(val * (origHeight / origWidth)));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && origHeight > 0) {
      setWidth(Math.round(val * (origWidth / origHeight)));
    }
  };

  const applyScale = (percent: number) => {
    if (origWidth > 0 && origHeight > 0) {
      const w = Math.round(origWidth * (percent / 100));
      const h = Math.round(origHeight * (percent / 100));
      setWidth(w);
      setHeight(h);
    }
  };

  const resize = () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(selectedFile.type);
        setResizedUrl(dataUrl);
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-foreground/15 hover:border-foreground/30 rounded-xl p-8 text-center transition-colors relative cursor-pointer bg-foreground/5">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="space-y-2">
          <div className="text-4xl">📐</div>
          <p className="text-sm font-medium">Klik atau drag file gambar ke sini</p>
          <p className="text-xs text-foreground/45">Mendukung JPG, PNG, WebP</p>
        </div>
      </div>

      {selectedFile && previewUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Pratinjau</h3>
            <div className="border border-foreground/15 rounded-lg overflow-hidden bg-background max-h-80 flex items-center justify-center p-2">
              <img src={previewUrl} alt="Asli" className="max-w-full max-h-72 object-contain" />
            </div>
            <div className="text-sm font-mono">Resolusi Asli: {origWidth} x {origHeight} px</div>
          </div>

          <div className="space-y-6 bg-foreground/5 p-6 rounded-xl border border-foreground/10">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Konfigurasi Ukuran</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Lebar (px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2.5 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Tinggi (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2.5 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLockAspect(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-foreground/20"
                />
                <span className="text-sm font-medium">Kunci Rasio Aspek</span>
              </label>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Skala Preset</span>
              <div className="flex gap-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => applyScale(pct)}
                    className="flex-1 bg-background border border-foreground/15 py-1.5 rounded-lg font-mono text-xs hover:bg-foreground/5"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={resize}
              disabled={isProcessing}
              className="w-full bg-foreground text-background py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? "Memproses..." : "Ubah Ukuran Gambar"}
            </button>

            {resizedUrl && (
              <div className="space-y-4 pt-4 border-t border-foreground/10">
                <a
                  href={resizedUrl}
                  download={`resized_${selectedFile.name}`}
                  className="block text-center w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-colors"
                >
                  Download Gambar
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
