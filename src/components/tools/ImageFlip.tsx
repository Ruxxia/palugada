import { useState, useRef, useEffect } from "react";

export function ImageFlip() {
  const [image, setImage] = useState<string | null>(null);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setFlipH(false);
        setFlipV(false);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!image) return;
    const img = new Image();
    img.src = image;
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Transform flip
      ctx.translate(flipH ? canvas.width : 0, flipV ? canvas.height : 0);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      ctx.drawImage(img, 0, 0);
      ctx.restore();
    };
  }, [image, flipH, flipV]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "flipped-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings */}
      <div className="lg:col-span-1 space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Pengaturan Flip</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Pilih Gambar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="w-full text-xs text-foreground/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-foreground file:text-background hover:file:opacity-90 cursor-pointer"
            />
          </div>

          {image && (
            <div className="space-y-3 pt-4 border-t border-foreground/10 flex flex-col gap-2">
              <button
                onClick={() => setFlipH(!flipH)}
                className={`w-full py-3 px-4 text-xs font-bold uppercase rounded-lg border transition-colors flex justify-between items-center ${
                  flipH ? "bg-foreground text-background" : "bg-background border-foreground/15 text-foreground"
                }`}
              >
                <span>Balik Horizontal (Kiri - Kanan)</span>
                <span>{flipH ? "AKTIF" : "OFF"}</span>
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={`w-full py-3 px-4 text-xs font-bold uppercase rounded-lg border transition-colors flex justify-between items-center ${
                  flipV ? "bg-foreground text-background" : "bg-background border-foreground/15 text-foreground"
                }`}
              >
                <span>Balik Vertical (Atas - Bawah)</span>
                <span>{flipV ? "AKTIF" : "OFF"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="lg:col-span-2 space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Preview</h3>
          {!image ? (
            <div className="bg-foreground/5 border border-foreground/10 text-foreground/60 p-8 rounded-xl text-center flex flex-col items-center justify-center min-h-[300px]">
              <span className="text-3xl mb-2">🔄</span>
              <p className="text-sm">Upload gambar terlebih dahulu untuk menerapkan flip.</p>
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 border border-foreground/10 bg-background rounded-xl max-h-[500px] overflow-auto">
              <canvas ref={canvasRef} className="max-w-full h-auto object-contain shadow-md rounded" />
            </div>
          )}
        </div>

        {image && (
          <div className="pt-6 border-t border-foreground/10 flex justify-between items-center">
            <span className="text-xs font-mono text-foreground/50">
              Ukuran: {dimensions.width} x {dimensions.height} px
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
