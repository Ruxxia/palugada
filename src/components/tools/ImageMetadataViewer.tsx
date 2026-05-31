import { useState } from "react";

interface Metadata {
  name: string;
  size: string;
  type: string;
  lastModified: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export function ImageMetadataViewer() {
  const [image, setImage] = useState<string | null>(null);
  const [meta, setMeta] = useState<Metadata | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getAspectRatio = (width: number, height: number): string => {
    const gcd = (a: number, b: number): number => {
      return b ? gcd(b, a % b) : a;
    };
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImage(dataUrl);

        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          setMeta({
            name: file.name,
            size: formatBytes(file.size),
            type: file.type || "Unknown",
            lastModified: new Date(file.lastModified).toLocaleString(),
            width: img.width,
            height: img.height,
            aspectRatio: getAspectRatio(img.width, img.height),
          });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* File Upload & Preview */}
      <div className="lg:col-span-2 space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Informasi & Upload Gambar</h3>
        
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="w-full text-xs text-foreground/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-foreground file:text-background hover:file:opacity-90 cursor-pointer"
          />

          {!image ? (
            <div className="bg-foreground/5 border border-foreground/10 text-foreground/60 p-8 rounded-xl text-center flex flex-col items-center justify-center min-h-[300px]">
              <span className="text-3xl mb-2">🔎</span>
              <p className="text-sm">Upload file gambar untuk memeriksa detail metadata berkas.</p>
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 border border-foreground/10 bg-background rounded-xl max-h-[400px] overflow-auto">
              <img src={image} alt="Preview" className="max-w-full h-auto object-contain max-h-[350px] shadow-sm rounded" />
            </div>
          )}
        </div>
      </div>

      {/* Inspector Panel */}
      <div className="lg:col-span-1 space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Inspector Metadata</h3>

        {!meta ? (
          <div className="text-xs text-foreground/40 font-mono">Belum ada file yang dimuat.</div>
        ) : (
          <div className="space-y-4">
            <div className="border-b border-foreground/10 pb-3">
              <span className="text-[10px] font-mono text-foreground/40 uppercase block">Nama File</span>
              <span className="text-sm font-bold truncate block">{meta.name}</span>
            </div>
            <div className="border-b border-foreground/10 pb-3">
              <span className="text-[10px] font-mono text-foreground/40 uppercase block">Ukuran File</span>
              <span className="text-sm font-bold font-mono">{meta.size}</span>
            </div>
            <div className="border-b border-foreground/10 pb-3">
              <span className="text-[10px] font-mono text-foreground/40 uppercase block">Tipe MIME</span>
              <span className="text-sm font-bold font-mono">{meta.type}</span>
            </div>
            <div className="border-b border-foreground/10 pb-3">
              <span className="text-[10px] font-mono text-foreground/40 uppercase block">Dimensi Piksel</span>
              <span className="text-sm font-bold font-mono">{meta.width} x {meta.height} px</span>
            </div>
            <div className="border-b border-foreground/10 pb-3">
              <span className="text-[10px] font-mono text-foreground/40 uppercase block">Aspek Rasio</span>
              <span className="text-sm font-bold font-mono">{meta.aspectRatio}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-foreground/40 uppercase block">Terakhir Diubah</span>
              <span className="text-sm font-bold font-mono">{meta.lastModified}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
