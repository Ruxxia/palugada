import { useState, useRef } from "react";

// Load pdf-lib CDN
const loadPdfLib = async (): Promise<any> => {
  if ((window as any).PDFLib) return (window as any).PDFLib;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";
    script.onload = () => resolve((window as any).PDFLib);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

interface ImageFile {
  id: string;
  name: string;
  url: string;
  file: File;
}

export function ImageToPdf() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [pageSize, setPageSize] = useState<"A4" | "LETTER">("A4");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newImages.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: URL.createObjectURL(file),
        file,
      });
    }
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    setImages(newImages);
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;
    setLoading(true);

    try {
      const PDFLib = await loadPdfLib();
      const pdfDoc = await PDFLib.PDFDocument.create();

      // Page dimensions
      // A4: 595.27 x 841.89 points
      // Letter: 612 x 792 points
      let pageW = pageSize === "A4" ? 595.27 : 612;
      let pageH = pageSize === "A4" ? 841.89 : 792;

      if (orientation === "landscape") {
        const temp = pageW;
        pageW = pageH;
        pageH = temp;
      }

      for (const img of images) {
        const page = pdfDoc.addPage([pageW, pageH]);
        const imageBytes = await img.file.arrayBuffer();

        let embeddedImage;
        if (img.file.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else if (img.file.type === "image/jpeg" || img.file.type === "image/jpg") {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          // Fallback via canvas to Jpeg
          const convertedBytes = await convertToJpegBytes(img.url);
          embeddedImage = await pdfDoc.embedJpg(convertedBytes);
        }

        const { width: imgW, height: imgH } = embeddedImage.scale(1);

        // Fit image inside page dimensions keeping ratio
        const scale = Math.min(pageW / imgW, pageH / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const drawX = (pageW - drawW) / 2;
        const drawY = (pageH - drawH) / 2;

        page.drawImage(embeddedImage, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "converted-images.pdf";
      link.click();
    } catch (error) {
      console.error(error);
      alert("Gagal mengonversi gambar ke PDF.");
    } finally {
      setLoading(false);
    }
  };

  const convertToJpegBytes = async (url: string): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            blob.arrayBuffer().then(resolve).catch(reject);
          } else {
            reject("Gagal mengonversi gambar");
          }
        }, "image/jpeg", 0.9);
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-10 px-4 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-colors"
            >
              Pilih Gambar
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/50 block mb-1">Ukuran Kertas</label>
              <select
                value={pageSize}
                onChange={(e: any) => setPageSize(e.target.value)}
                className="h-9 px-3 bg-background border border-foreground/15 rounded-lg text-xs font-mono"
              >
                <option value="A4">A4</option>
                <option value="LETTER">Letter</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-foreground/50 block mb-1">Orientasi</label>
              <select
                value={orientation}
                onChange={(e: any) => setOrientation(e.target.value)}
                className="h-9 px-3 bg-background border border-foreground/15 rounded-lg text-xs font-mono"
              >
                <option value="portrait">Potrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((img, idx) => (
              <div key={img.id} className="relative bg-background border border-foreground/10 p-2 rounded-lg flex flex-col items-center group">
                <img src={img.url} alt={img.name} className="w-full h-28 object-contain rounded mb-2 bg-foreground/5" />
                <span className="text-[10px] text-foreground/75 truncate w-full text-center mb-2">{img.name}</span>
                <div className="flex gap-1 justify-center w-full">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveImage(idx, "up")}
                    className="p-1 border border-foreground/10 rounded hover:bg-foreground/5 disabled:opacity-30"
                  >
                    ◀
                  </button>
                  <button
                    disabled={idx === images.length - 1}
                    onClick={() => moveImage(idx, "down")}
                    className="p-1 border border-foreground/10 rounded hover:bg-foreground/5 disabled:opacity-30"
                  >
                    ▶
                  </button>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="p-1 border border-red-500/20 text-red-500 rounded hover:bg-red-500/5 ml-auto"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-foreground/15 rounded-xl p-10 text-center text-foreground/40">
            <span className="text-4xl block mb-2">🖼️</span>
            <p className="text-sm font-medium">Seret & lepas atau pilih berkas gambar (PNG, JPG, WebP) Anda di sini.</p>
          </div>
        )}

        {images.length > 0 && (
          <button
            onClick={convertToPdf}
            disabled={loading}
            className="w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {loading ? "Sedang Mengonversi..." : "Konversi & Unduh PDF"}
          </button>
        )}
      </div>
    </div>
  );
}
