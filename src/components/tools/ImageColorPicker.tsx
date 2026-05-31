import { useState, useRef, useEffect } from "react";

export function ImageColorPicker() {
  const [image, setImage] = useState<string | null>(null);
  const [hexColor, setHexColor] = useState("#000000");
  const [rgbColor, setRgbColor] = useState("rgb(0, 0, 0)");
  const [hslColor, setHslColor] = useState("hsl(0, 0%, 0%)");
  const [copiedText, setCopiedText] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!image) return;
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Limit size for canvas loading to prevent performance lag
      const maxDim = 800;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = (height / width) * maxDim;
          width = maxDim;
        } else {
          width = (width / height) * maxDim;
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, width, height);
    };
  }, [image]);

  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];

      const hex = rgbToHex(r, g, b);
      setHexColor(hex);
      setRgbColor(`rgb(${r}, ${g}, ${b})`);
      setHslColor(rgbToHsl(r, g, b));
    } catch {
      // Ignore cross-origin error if canvas is tainted
    }
  };

  const copyVal = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedText(val);
    setTimeout(() => setCopiedText(""), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Canvas Selector */}
      <div className="lg:col-span-2 space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">Pilih Warna dari Gambar</h3>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="w-full text-xs text-foreground/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-foreground file:text-background hover:file:opacity-90 cursor-pointer"
        />

        {!image ? (
          <div className="bg-foreground/5 border border-foreground/10 text-foreground/60 p-8 rounded-xl text-center flex flex-col items-center justify-center min-h-[300px]">
            <span className="text-3xl mb-2">🎨</span>
            <p className="text-sm">Upload gambar lalu klik/gerakkan kursor di atasnya untuk mendeteksi warna.</p>
          </div>
        ) : (
          <div className="flex items-center justify-center p-4 border border-foreground/10 bg-background rounded-xl max-h-[450px] overflow-auto">
            <canvas
              ref={canvasRef}
              onMouseMove={handleCanvasInteraction}
              onClick={handleCanvasInteraction}
              className="max-w-full h-auto cursor-crosshair shadow rounded"
            />
          </div>
        )}
      </div>

      {/* Colors Info Panel */}
      <div className="lg:col-span-1 space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div className="space-y-6">
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Info Warna Terpilih</h3>

          {/* Color Preview Block */}
          <div
            className="w-full h-24 rounded-xl border border-foreground/10 shadow-inner flex items-center justify-center"
            style={{ backgroundColor: hexColor }}
          >
            <span className="font-mono text-sm px-3 py-1 bg-background/80 text-foreground rounded-lg font-bold shadow-sm uppercase">
              {hexColor}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-foreground/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-foreground/40 uppercase block">HEX</span>
                <span className="text-sm font-bold font-mono uppercase">{hexColor}</span>
              </div>
              <button
                onClick={() => copyVal(hexColor)}
                className="px-3 py-1.5 bg-foreground text-background text-xs rounded font-bold hover:opacity-90 transition-opacity"
              >
                {copiedText === hexColor ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-foreground/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-foreground/40 uppercase block">RGB</span>
                <span className="text-sm font-bold font-mono">{rgbColor}</span>
              </div>
              <button
                onClick={() => copyVal(rgbColor)}
                className="px-3 py-1.5 bg-foreground text-background text-xs rounded font-bold hover:opacity-90 transition-opacity"
              >
                {copiedText === rgbColor ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-foreground/40 uppercase block">HSL</span>
                <span className="text-sm font-bold font-mono">{hslColor}</span>
              </div>
              <button
                onClick={() => copyVal(hslColor)}
                className="px-3 py-1.5 bg-foreground text-background text-xs rounded font-bold hover:opacity-90 transition-opacity"
              >
                {copiedText === hslColor ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] font-mono text-foreground/40 border-t border-foreground/10 pt-4">
          Klik format di atas untuk menyalin ke clipboard.
        </div>
      </div>
    </div>
  );
}
