import { useState, useRef, useEffect } from "react";

export function WhatsappStickerMaker() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(48);
  const [textY, setTextY] = useState(420); // bottom text position
  const [textX, setTextX] = useState(256); // center text position
  const [isCircular, setIsCircular] = useState(false);
  const [exportUrl, setExportUrl] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load uploaded image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Draw sticker on canvas
  const drawSticker = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, 512, 512);

    ctx.save();

    // Circular crop if enabled
    if (isCircular) {
      ctx.beginPath();
      ctx.arc(256, 256, 240, 0, Math.PI * 2);
      ctx.clip();
    }

    // Draw background image
    if (image) {
      // Calculate scaling to cover 512x512
      const scale = Math.max(512 / image.width, 512 / image.height);
      const x = (512 - image.width * scale) / 2;
      const y = (512 - image.height * scale) / 2;
      ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
    } else {
      // Draw placeholder background
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, 512, 512);
      // Draw dashed border
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 10]);
      ctx.strokeRect(20, 20, 472, 472);
    }

    ctx.restore();

    // Draw Text
    if (text) {
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Text Stroke
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = Math.max(4, fontSize / 8);
      ctx.strokeText(text, textX, textY);

      // Text Fill
      ctx.fillStyle = textColor;
      ctx.fillText(text, textX, textY);
    }

    // Generate output URL
    try {
      // WhatsApp stickers are strictly WebP
      const dataUrl = canvas.toDataURL("image/webp", 0.9);
      setExportUrl(dataUrl);
    } catch (err) {
      // Fallback
      setExportUrl(canvas.toDataURL("image/png"));
    }
  };

  useEffect(() => {
    drawSticker();
  }, [image, text, textColor, strokeColor, fontSize, textX, textY, isCircular]);

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const clearSticker = () => {
    setImage(null);
    setText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor Controls */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Desain Sticker</h3>

        {/* Upload Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              onClick={triggerUpload}
              className="flex-1 h-11 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors"
            >
              Upload Gambar
            </button>
            {image && (
              <button
                onClick={clearSticker}
                className="px-4 h-11 border border-red-500/20 text-red-500 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-red-500/5 transition-colors"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* Text Customization */}
        <div className="space-y-4 pt-4 border-t border-foreground/10">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block mb-1">Tulisan Sticker</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Mantap Bos!"
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block mb-1">Warna Teks</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded border border-foreground/10 cursor-pointer p-0"
                />
                <span className="text-xs font-mono">{textColor}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block mb-1">Warna Outline</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-8 h-8 rounded border border-foreground/10 cursor-pointer p-0"
                />
                <span className="text-xs font-mono">{strokeColor}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 flex justify-between mb-1">
              <span>Ukuran Font</span>
              <span>{fontSize}px</span>
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 flex justify-between mb-1">
                <span>Posisi X</span>
                <span>{textX}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="512"
                value={textX}
                onChange={(e) => setTextX(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 flex justify-between mb-1">
                <span>Posisi Y</span>
                <span>{textY}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="512"
                value={textY}
                onChange={(e) => setTextY(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="circular-mask"
              checked={isCircular}
              onChange={(e) => setIsCircular(e.target.checked)}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
            <label htmlFor="circular-mask" className="text-xs font-mono uppercase tracking-wider text-foreground/75 cursor-pointer">
              Potong Bulat (Circle Mask)
            </label>
          </div>
        </div>
      </div>

      {/* Preview & Canvas Panel */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between min-h-[400px]">
        <div className="flex flex-col items-center justify-center flex-1">
          {/* Main Drawing Canvas (hidden / sized) */}
          <canvas
            ref={canvasRef}
            width={512}
            height={512}
            className="hidden"
          />

          {/* Interactive display canvas placeholder */}
          <div className="relative w-64 h-64 bg-background border border-foreground/10 rounded-xl shadow-lg overflow-hidden flex items-center justify-center bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] [background-size:16px_16px]">
            {exportUrl ? (
              <img
                src={exportUrl}
                alt="Sticker Preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-4 text-foreground/40">
                <span className="text-3xl block mb-2">🎨</span>
                <p className="text-xs">Preview sticker Anda akan tampil di sini.</p>
              </div>
            )}
          </div>
        </div>

        {exportUrl && (
          <div className="space-y-4 pt-6 border-t border-foreground/10">
            <a
              href={exportUrl}
              download="whatsapp-sticker.webp"
              className="w-full flex items-center justify-center h-12 bg-foreground text-background rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Unduh Sticker WebP
            </a>

            <div className="p-3 bg-background border border-foreground/10 rounded-lg text-[11px] text-foreground/70 space-y-1">
              <span className="font-bold block text-[10px] font-mono text-primary uppercase">Cara Pakai Sticker di WhatsApp:</span>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Download berkas sticker (.webp) di atas ke HP Anda.</li>
                <li>Gunakan aplikasi sticker maker di Google Play / App Store (seperti "Sticker.ly" atau "Personal Sticker for WhatsApp").</li>
                <li>Import berkas WebP tersebut ke dalam koleksi pack Anda dan tambahkan ke WhatsApp.</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
