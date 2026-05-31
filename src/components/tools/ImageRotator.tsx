import { useState, useRef } from "react";

export function ImageRotator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rotatedUrl, setRotatedUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRotatedUrl(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const rotate = (angle: number) => {
    const nextRot = (rotation + angle + 360) % 360;
    setRotation(nextRot);
    setRotatedUrl(null);
  };

  const processImage = () => {
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

        // Determine canvas dimensions based on rotation
        const isOrtho = rotation === 90 || rotation === 270;
        canvas.width = isOrtho ? img.height : img.width;
        canvas.height = isOrtho ? img.width : img.height;

        // Move rotation point to center of canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Rotate
        ctx.rotate((rotation * Math.PI) / 180);

        // Scale for flips
        const scaleX = flipH ? -1 : 1;
        const scaleY = flipV ? -1 : 1;
        ctx.scale(scaleX, scaleY);

        // Draw image offset to top-left
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const dataUrl = canvas.toDataURL(selectedFile.type);
        setRotatedUrl(dataUrl);
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
          <div className="text-4xl">🔄</div>
          <p className="text-sm font-medium">Klik atau drag file gambar ke sini</p>
          <p className="text-xs text-foreground/45">Putar atau balikkan arah gambar secara offline</p>
        </div>
      </div>

      {selectedFile && previewUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Gambar Asli</h3>
            
            {/* Live Rotated Preview via CSS */}
            <div className="border border-foreground/15 rounded-lg overflow-hidden bg-background max-h-80 flex items-center justify-center p-6">
              <img
                src={previewUrl}
                alt="Asli"
                style={{
                  transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                  transition: "transform 0.3s ease",
                }}
                className="max-w-full max-h-64 object-contain"
              />
            </div>
            <div className="text-sm font-mono text-center">
              Rotasi: {rotation}° {flipH ? "| Flip Horizontal" : ""} {flipV ? "| Flip Vertical" : ""}
            </div>
          </div>

          <div className="space-y-6 bg-foreground/5 p-6 rounded-xl border border-foreground/10">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Opsi Rotasi & Flip</h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => rotate(-90)}
                className="bg-background border border-foreground/15 py-2.5 rounded-lg font-bold text-xs uppercase hover:bg-foreground/5"
              >
                Putar -90° (Kiri)
              </button>
              <button
                onClick={() => rotate(90)}
                className="bg-background border border-foreground/15 py-2.5 rounded-lg font-bold text-xs uppercase hover:bg-foreground/5"
              >
                Putar +90° (Kanan)
              </button>
              <button
                onClick={() => setFlipH(!flipH)}
                className={`py-2.5 rounded-lg font-bold text-xs uppercase border transition-colors ${
                  flipH ? "bg-foreground text-background border-foreground" : "bg-background border-foreground/15 hover:bg-foreground/5"
                }`}
              >
                Balik Horizontal
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={`py-2.5 rounded-lg font-bold text-xs uppercase border transition-colors ${
                  flipV ? "bg-foreground text-background border-foreground" : "bg-background border-foreground/15 hover:bg-foreground/5"
                }`}
              >
                Balik Vertical
              </button>
            </div>

            <button
              onClick={processImage}
              disabled={isProcessing}
              className="w-full bg-foreground text-background py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? "Memproses..." : "Terapkan Perubahan"}
            </button>

            {rotatedUrl && (
              <div className="space-y-4 pt-4 border-t border-foreground/10">
                <a
                  href={rotatedUrl}
                  download={`rotated_${selectedFile.name}`}
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
