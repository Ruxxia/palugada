import { useState, useRef, useEffect } from "react";

type Position = "top-left" | "top-right" | "center" | "bottom-left" | "bottom-right";

export function ImageWatermark() {
  const [image, setImage] = useState<string | null>(null);
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  
  // Text Watermark Options
  const [text, setText] = useState("Palugada");
  const [color, setColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(36);
  const [opacity, setOpacity] = useState(0.5);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [rotation, setRotation] = useState(0);

  // Logo Watermark Options
  const [logo, setLogo] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(0.2); // 20% of original image width

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw the watermark on Canvas
  useEffect(() => {
    if (!image) return;

    const mainImg = new Image();
    mainImg.src = image;
    mainImg.onload = () => {
      setOriginalDimensions({ width: mainImg.width, height: mainImg.height });
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = mainImg.width;
      canvas.height = mainImg.height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw base image
      ctx.drawImage(mainImg, 0, 0);

      // Save state
      ctx.save();

      // Set opacity
      ctx.globalAlpha = opacity;

      // Position logic
      let x = 0;
      let y = 0;
      const margin = 30;

      if (watermarkType === "text") {
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = color;
        const textWidth = ctx.measureText(text).width;

        switch (position) {
          case "top-left":
            x = margin;
            y = margin + fontSize;
            break;
          case "top-right":
            x = canvas.width - textWidth - margin;
            y = margin + fontSize;
            break;
          case "center":
            x = canvas.width / 2 - textWidth / 2;
            y = canvas.height / 2 + fontSize / 2;
            break;
          case "bottom-left":
            x = margin;
            y = canvas.height - margin;
            break;
          case "bottom-right":
            x = canvas.width - textWidth - margin;
            y = canvas.height - margin;
            break;
        }

        // Apply rotation
        if (rotation !== 0) {
          ctx.translate(x + textWidth / 2, y - fontSize / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.fillText(text, -textWidth / 2, fontSize / 2);
        } else {
          ctx.fillText(text, x, y);
        }
      } else if (watermarkType === "image" && logo) {
        const logoImg = new Image();
        logoImg.src = logo;
        logoImg.onload = () => {
          const lWidth = canvas.width * logoScale;
          const lHeight = (logoImg.height / logoImg.width) * lWidth;

          switch (position) {
            case "top-left":
              x = margin;
              y = margin;
              break;
            case "top-right":
              x = canvas.width - lWidth - margin;
              y = margin;
              break;
            case "center":
              x = canvas.width / 2 - lWidth / 2;
              y = canvas.height / 2 - lHeight / 2;
              break;
            case "bottom-left":
              x = margin;
              y = canvas.height - lHeight - margin;
              break;
            case "bottom-right":
              x = canvas.width - lWidth - margin;
              y = canvas.height - lHeight - margin;
              break;
          }

          ctx.drawImage(logoImg, x, y, lWidth, lHeight);
          ctx.restore();
        };
        return; // Don't call restore here as logo load is async
      }

      ctx.restore();
    };
  }, [image, watermarkType, text, color, fontSize, opacity, position, rotation, logo, logoScale]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "watermarked-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings */}
      <div className="lg:col-span-1 space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Pengaturan Watermark</h3>

        {/* Base Image Upload */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Upload Gambar Utama</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full text-xs text-foreground/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-foreground file:text-background hover:file:opacity-90 cursor-pointer"
          />
        </div>

        {image && (
          <div className="space-y-4 pt-4 border-t border-foreground/10">
            {/* Watermark Type */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Tipe Watermark</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setWatermarkType("text")}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg border transition-colors ${
                    watermarkType === "text" ? "bg-foreground text-background" : "bg-background border-foreground/15 text-foreground/75"
                  }`}
                >
                  Teks
                </button>
                <button
                  onClick={() => setWatermarkType("image")}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg border transition-colors ${
                    watermarkType === "image" ? "bg-foreground text-background" : "bg-background border-foreground/15 text-foreground/75"
                  }`}
                >
                  Logo / Gambar
                </button>
              </div>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Posisi</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as Position)}
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              >
                <option value="top-left">Kiri Atas</option>
                <option value="top-right">Kanan Atas</option>
                <option value="center">Tengah</option>
                <option value="bottom-left">Kiri Bawah</option>
                <option value="bottom-right">Kanan Bawah</option>
              </select>
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50">
                <span>Transparansi</span>
                <span>{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-primary bg-foreground/10 h-1 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Conditional Type Config */}
            {watermarkType === "text" ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Teks Watermark</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Ukuran Font</label>
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                      className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Warna Teks</label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-11 p-1 bg-background border border-foreground/15 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50">
                    <span>Rotasi</span>
                    <span>{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full accent-primary bg-foreground/10 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Upload Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full text-xs text-foreground/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-foreground file:text-background hover:file:opacity-90 cursor-pointer"
                  />
                </div>
                {logo && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/50">
                      <span>Ukuran Logo</span>
                      <span>{Math.round(logoScale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.8"
                      step="0.01"
                      value={logoScale}
                      onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                      className="w-full accent-primary bg-foreground/10 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-2 space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Preview Watermark</h3>
          {!image ? (
            <div className="bg-foreground/5 border border-foreground/10 text-foreground/60 p-8 rounded-xl text-center flex flex-col items-center justify-center min-h-[300px]">
              <span className="text-3xl mb-2">🖼️</span>
              <p className="text-sm">Upload gambar utama terlebih dahulu untuk menerapkan watermark.</p>
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 border border-foreground/10 bg-background rounded-xl overflow-auto max-h-[500px]">
              <canvas ref={canvasRef} className="max-w-full h-auto object-contain shadow-md rounded" />
            </div>
          )}
        </div>

        {image && (
          <div className="pt-6 border-t border-foreground/10 flex justify-between items-center">
            <span className="text-xs font-mono text-foreground/50">
              Dimensi Asli: {originalDimensions.width} x {originalDimensions.height} px
            </span>
            <button
              onClick={handleDownload}
              className="px-6 h-12 bg-foreground text-background rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
            >
              Unduh Gambar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
