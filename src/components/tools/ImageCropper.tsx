import { useState, useRef, useEffect } from "react";

export function ImageCropper() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);

  // Crop values in percentage (0-100)
  const [cropX, setCropX] = useState(10);
  const [cropY, setCropY] = useState(10);
  const [cropW, setCropW] = useState(80);
  const [cropH, setCropH] = useState(80);

  const [aspectPreset, setAspectPreset] = useState<"free" | "1:1" | "3:4" | "4:3" | "16:9">("free");
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCroppedUrl(null);
    setAspectPreset("free");
    setCropX(10);
    setCropY(10);
    setCropW(80);
    setCropH(80);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgWidth(img.naturalWidth);
    setImgHeight(img.naturalHeight);
  };

  // Adjust crop dimensions when preset is chosen
  useEffect(() => {
    if (aspectPreset === "free") return;

    let targetRatio = 1;
    if (aspectPreset === "1:1") targetRatio = 1;
    else if (aspectPreset === "3:4") targetRatio = 3 / 4;
    else if (aspectPreset === "4:3") targetRatio = 4 / 3;
    else if (aspectPreset === "16:9") targetRatio = 16 / 9;

    // We keep width at 80% and compute height
    const currentW = 80;
    const currentH = (currentW * (imgWidth / imgHeight)) / targetRatio;

    if (currentH <= 100) {
      setCropW(currentW);
      setCropH(Math.round(currentH));
      setCropX(Math.round((100 - currentW) / 2));
      setCropY(Math.round((100 - currentH) / 2));
    } else {
      const maxH = 80;
      const maxW = (maxH * targetRatio) / (imgWidth / imgHeight);
      setCropH(maxH);
      setCropW(Math.round(maxW));
      setCropX(Math.round((100 - maxW) / 2));
      setCropY(Math.round((100 - maxH) / 2));
    }
  }, [aspectPreset, imgWidth, imgHeight]);

  const crop = () => {
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

        // Calculate actual pixel coordinates
        const x = (cropX / 100) * img.width;
        const y = (cropY / 100) * img.height;
        const w = (cropW / 100) * img.width;
        const h = (cropH / 100) * img.height;

        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

        const dataUrl = canvas.toDataURL(selectedFile.type);
        setCroppedUrl(dataUrl);
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
          <div className="text-4xl">✂️</div>
          <p className="text-sm font-medium">Klik atau drag file gambar ke sini</p>
          <p className="text-xs text-foreground/45">Mendukung Pas Foto dan kustom aspek rasio</p>
        </div>
      </div>

      {selectedFile && previewUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Sesuaikan Area Crop</h3>
            
            {/* Visual Cropping Box Overlay */}
            <div className="border border-foreground/15 rounded-lg overflow-hidden bg-background relative flex items-center justify-center p-0 max-h-96">
              <img
                ref={imageRef}
                src={previewUrl}
                alt="Asli"
                onLoad={handleImageLoad}
                className="max-w-full max-h-96 object-contain select-none pointer-events-none"
              />
              
              {/* Overlay cropping visual indicator */}
              <div
                className="absolute border-2 border-primary bg-primary/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all pointer-events-none"
                style={{
                  left: `${cropX}%`,
                  top: `${cropY}%`,
                  width: `${cropW}%`,
                  height: `${cropH}%`,
                }}
              >
                {/* Visual crop guidelines grid lines */}
                <div className="absolute inset-0 border border-dashed border-white/30 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  <div className="border-r border-b border-dashed border-white/20"></div>
                  <div className="border-r border-b border-dashed border-white/20"></div>
                  <div className="border-b border-dashed border-white/20"></div>
                  <div className="border-r border-b border-dashed border-white/20"></div>
                  <div className="border-r border-b border-dashed border-white/20"></div>
                  <div className="border-b border-dashed border-white/20"></div>
                </div>
              </div>
            </div>
            
            <div className="text-sm font-mono">Ukuran Gambar: {imgWidth} x {imgHeight} px</div>
          </div>

          <div className="space-y-6 bg-foreground/5 p-6 rounded-xl border border-foreground/10">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Pengaturan Crop</h3>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Preset Rasio</span>
              <div className="flex gap-2 flex-wrap">
                {(["free", "1:1", "3:4", "4:3", "16:9"] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAspectPreset(preset)}
                    className={`px-3 py-1.5 border border-foreground/15 rounded-lg font-mono text-xs hover:bg-foreground/5 capitalize ${
                      aspectPreset === preset ? "bg-foreground text-background" : "bg-background text-foreground"
                    }`}
                  >
                    {preset === "3:4" ? "3:4 (Pas Foto)" : preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Range adjustments */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-foreground/70">
                  <span>Posisi X:</span>
                  <span>{cropX}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={100 - cropW}
                  value={cropX}
                  onChange={(e) => setCropX(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-foreground/70">
                  <span>Posisi Y:</span>
                  <span>{cropY}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={100 - cropH}
                  value={cropY}
                  onChange={(e) => setCropY(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-foreground/70">
                  <span>Lebar Area:</span>
                  <span>{cropW}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max={100 - cropX}
                  value={cropW}
                  onChange={(e) => {
                    const nextW = Number(e.target.value);
                    setCropW(nextW);
                    if (aspectPreset !== "free") {
                      // Adjust height based on aspect ratio
                      let ratio = 1;
                      if (aspectPreset === "1:1") ratio = 1;
                      else if (aspectPreset === "3:4") ratio = 3 / 4;
                      else if (aspectPreset === "4:3") ratio = 4 / 3;
                      else if (aspectPreset === "16:9") ratio = 16 / 9;
                      const nextH = (nextW * (imgWidth / imgHeight)) / ratio;
                      if (nextH + cropY <= 100) {
                        setCropH(Math.round(nextH));
                      } else {
                        // Cap width to fit screen height limit
                        const maxH = 100 - cropY;
                        setCropH(maxH);
                        setCropW(Math.round((maxH * ratio) / (imgWidth / imgHeight)));
                      }
                    }
                  }}
                  className="w-full accent-primary"
                />
              </div>

              {aspectPreset === "free" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-foreground/70">
                    <span>Tinggi Area:</span>
                    <span>{cropH}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max={100 - cropY}
                    value={cropH}
                    onChange={(e) => setCropH(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              )}
            </div>

            <button
              onClick={crop}
              disabled={isProcessing}
              className="w-full bg-foreground text-background py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? "Memotong..." : "Potong Gambar"}
            </button>

            {croppedUrl && (
              <div className="space-y-4 pt-4 border-t border-foreground/10">
                <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Crop</h4>
                <div className="border border-foreground/15 rounded-lg overflow-hidden bg-background max-h-60 flex items-center justify-center p-2">
                  <img src={croppedUrl} alt="Hasil" className="max-w-full max-h-48 object-contain" />
                </div>
                <a
                  href={croppedUrl}
                  download={`cropped_${selectedFile.name}`}
                  className="block text-center w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-colors"
                >
                  Download Hasil Crop
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
