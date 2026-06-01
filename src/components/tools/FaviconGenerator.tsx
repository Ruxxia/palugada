import { useState, useRef } from "react";

export function FaviconGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(f);
  };

  const getPngBuffer = (img: HTMLImageElement, size: number): Promise<ArrayBuffer> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      // Center crop to square
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;

      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

      canvas.toBlob((blob) => {
        blob!.arrayBuffer().then(resolve);
      }, "image/png");
    });
  };

  const getPngBlob = (img: HTMLImageElement, size: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      // Center crop to square
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;

      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

      canvas.toBlob((blob) => {
        resolve(blob!);
      }, "image/png");
    });
  };

  const generateFaviconPack = async () => {
    if (!imageSrc) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => (img.onload = resolve));

      // 1. Generate ICO file (combines 16x16, 32x32, 48x48)
      const sizes = [16, 32, 48];
      const pngBuffers = await Promise.all(sizes.map((s) => getPngBuffer(img, s)));

      const HEADER_SIZE = 6;
      const DIRECTORY_ENTRY_SIZE = 16;
      const totalImages = pngBuffers.length;
      const totalDirectorySize = totalImages * DIRECTORY_ENTRY_SIZE;
      const totalHeaderSize = HEADER_SIZE + totalDirectorySize;

      const header = new ArrayBuffer(HEADER_SIZE);
      const view = new DataView(header);
      view.setUint16(0, 0, true); // Reserved
      view.setUint16(2, 1, true); // Type (1 = ICO)
      view.setUint16(4, totalImages, true); // Total images

      const directoryEntries: ArrayBuffer[] = [];
      let currentOffset = totalHeaderSize;

      for (let i = 0; i < totalImages; i++) {
        const size = sizes[i];
        const dataSize = pngBuffers[i].byteLength;

        const entry = new ArrayBuffer(DIRECTORY_ENTRY_SIZE);
        const entryView = new DataView(entry);

        entryView.setUint8(0, size); // Width
        entryView.setUint8(1, size); // Height
        entryView.setUint8(2, 0); // Palette
        entryView.setUint8(3, 0); // Reserved
        entryView.setUint16(4, 1, true); // Planes
        entryView.setUint16(6, 32, true); // Bits per pixel
        entryView.setUint32(8, dataSize, true); // Size of data
        entryView.setUint32(12, currentOffset, true); // Offset

        directoryEntries.push(entry);
        currentOffset += dataSize;
      }

      const finalParts = [header, ...directoryEntries, ...pngBuffers];
      const icoBlob = new Blob(finalParts, { type: "image/x-icon" });

      // Trigger ICO download
      const icoLink = document.createElement("a");
      icoLink.href = URL.createObjectURL(icoBlob);
      icoLink.download = "favicon.ico";
      icoLink.click();

      // 2. Generate Apple Touch Icon (180x180 PNG)
      const appleBlob = await getPngBlob(img, 180);
      const appleLink = document.createElement("a");
      appleLink.href = URL.createObjectURL(appleBlob);
      appleLink.download = "apple-touch-icon.png";
      appleLink.click();

      // 3. Generate Android Chrome Icons (192x192 & 512x512 PNG)
      const android192Blob = await getPngBlob(img, 192);
      const android192Link = document.createElement("a");
      android192Link.href = URL.createObjectURL(android192Blob);
      android192Link.download = "android-chrome-192x192.png";
      android192Link.click();

      const android512Blob = await getPngBlob(img, 512);
      const android512Link = document.createElement("a");
      android512Link.href = URL.createObjectURL(android512Blob);
      android512Link.download = "android-chrome-512x512.png";
      android512Link.click();

    } catch (err) {
      console.error(err);
      alert("Gagal memproses pembuatan Favicon.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-10 px-4 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-colors"
          >
            {file ? "Ganti Gambar Logo" : "Pilih Gambar Logo"}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />
        </div>

        {file && imageSrc && (
          <div className="space-y-6 border-t border-foreground/5 pt-6 animate-fadeIn">
            <div className="flex flex-col gap-1 text-xs font-mono text-foreground/50">
              <span>Nama File: <strong className="text-foreground">{file.name}</strong></span>
              <span>Ukuran: <strong className="text-foreground">{(file.size / 1024).toFixed(1)} KB</strong></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-background p-5 rounded-lg border border-foreground/10">
              {/* Logo Preview */}
              <div className="flex flex-col items-center justify-center p-4 border border-foreground/5 rounded-lg bg-card">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/40 mb-3">
                  Logo Asli (Square Cropped Preview)
                </span>
                <div className="w-32 h-32 rounded-lg border border-foreground/10 overflow-hidden bg-white shadow-inner flex items-center justify-center p-2">
                  <img src={imageSrc} alt="Preview" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Sizes List info */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-foreground/5 pb-2">
                  Berkas yang Akan Dihasilkan:
                </h4>
                <ul className="text-xs font-mono space-y-2 text-foreground/75">
                  <li className="flex justify-between items-center bg-card p-2 rounded border border-foreground/5">
                    <span>📄 favicon.ico</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">16x16, 32x32, 48x48px</span>
                  </li>
                  <li className="flex justify-between items-center bg-card p-2 rounded border border-foreground/5">
                    <span>🖼️ apple-touch-icon.png</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">180x180px</span>
                  </li>
                  <li className="flex justify-between items-center bg-card p-2 rounded border border-foreground/5">
                    <span>🖼️ android-chrome-192x192.png</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">192x192px</span>
                  </li>
                  <li className="flex justify-between items-center bg-card p-2 rounded border border-foreground/5">
                    <span>🖼️ android-chrome-512x512.png</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">512x512px</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={generateFaviconPack}
              disabled={processing}
              className="w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              {processing ? "Sedang Membuat Favicon..." : "Hasilkan Favicon Pack & Download"}
            </button>
          </div>
        )}

        {!file && (
          <div className="border-2 border-dashed border-foreground/15 rounded-xl p-10 text-center text-foreground/40">
            <span className="text-4xl block mb-2">🌐</span>
            <p className="text-sm font-medium">Unggah logo Anda untuk membuat favicon multi-resolusi & ikon aplikasi web lengkap secara lokal.</p>
          </div>
        )}
      </div>
    </div>
  );
}
