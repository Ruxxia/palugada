import { useState, useRef } from "react";

export function ImageCompressor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [origSize, setOrigSize] = useState<number | null>(null);
  const [compSize, setCompSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setOrigSize(file.size);
    setPreviewUrl(URL.createObjectURL(file));
    setCompressedUrl(null);
    setCompSize(null);
  };

  const compress = () => {
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

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCompSize(blob.size);
              setCompressedUrl(URL.createObjectURL(blob));
            }
            setIsProcessing(false);
          },
          "image/jpeg",
          quality / 100
        );
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
          <div className="text-4xl">📸</div>
          <p className="text-sm font-medium">Klik atau drag file gambar ke sini</p>
          <p className="text-xs text-foreground/45">Mendukung JPG, PNG, WebP</p>
        </div>
      </div>

      {selectedFile && previewUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Gambar Asli</h3>
            <div className="border border-foreground/15 rounded-lg overflow-hidden bg-background max-h-80 flex items-center justify-center p-2">
              <img src={previewUrl} alt="Asli" className="max-w-full max-h-72 object-contain" />
            </div>
            <div className="text-sm font-mono">Ukuran: {origSize ? formatSize(origSize) : ""}</div>
          </div>

          <div className="space-y-6 bg-foreground/5 p-6 rounded-xl border border-foreground/10">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Konfigurasi Kompresi</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Kualitas:</span>
                <span className="font-mono font-bold">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <button
              onClick={compress}
              disabled={isProcessing}
              className="w-full bg-foreground text-background py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? "Memproses..." : "Kompres Gambar"}
            </button>

            {compressedUrl && compSize && (
              <div className="space-y-4 pt-4 border-t border-foreground/10">
                <div className="text-sm font-mono space-y-1">
                  <div>Ukuran Terkompresi: <span className="font-bold">{formatSize(compSize)}</span></div>
                  <div>Rasio Hemat: <span className="text-primary font-bold">{origSize ? ((1 - compSize / origSize) * 100).toFixed(0) : 0}%</span></div>
                </div>

                <a
                  href={compressedUrl}
                  download={`compressed_${selectedFile.name}`}
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
