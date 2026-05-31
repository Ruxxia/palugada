import { useState, useRef } from "react";

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

const loadPdfJs = async (): Promise<any> => {
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.onload = () => {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
      resolve((window as any).pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

interface PageRotation {
  pageNum: number;
  rotation: number; // 0, 90, 180, 270
  thumbUrl: string;
}

export function PdfRotate() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageRotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    setPages([]);

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const items: PageRotation[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 }); // Thumbnail size
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        await page.render({ canvasContext: ctx, viewport }).promise;

        items.push({
          pageNum: i,
          rotation: 0,
          thumbUrl: canvas.toDataURL("image/png"),
        });
      }
      setPages(items);
    } catch (error) {
      console.error(error);
      alert("Gagal membaca dokumen PDF.");
    } finally {
      setLoading(false);
    }
  };

  const rotatePage = (pageNum: number) => {
    setPages((prev) =>
      prev.map((p) => (p.pageNum === pageNum ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const rotateAll = (deg: number) => {
    setPages((prev) => prev.map((p) => ({ ...p, rotation: (p.rotation + deg) % 360 })));
  };

  const savePdf = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const PDFLib = await loadPdfLib();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const pdfPages = pdfDoc.getPages();

      pages.forEach((p) => {
        if (p.rotation !== 0) {
          const page = pdfPages[p.pageNum - 1];
          const currentRotation = page.getRotation().angle;
          page.setRotation(PDFLib.degrees(currentRotation + p.rotation));
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${file.name.replace(".pdf", "")}_rotated.pdf`;
      link.click();
    } catch (error) {
      console.error(error);
      alert("Gagal memproses rotasi PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-10 px-4 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-colors"
            >
              {file ? "Ganti Berkas PDF" : "Pilih Berkas PDF"}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="application/pdf"
              className="hidden"
            />
          </div>

          {pages.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => rotateAll(90)}
                className="h-9 px-3 border border-foreground/10 text-xs font-bold rounded-lg hover:bg-foreground/5"
              >
                Putar Semua +90°
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="py-12 text-center text-foreground/50 text-sm font-mono animate-pulse">
            Sedang membaca dokumen PDF...
          </div>
        )}

        {pages.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {pages.map((p) => (
                <div key={p.pageNum} className="relative bg-background border border-foreground/10 p-3 rounded-lg flex flex-col items-center">
                  <div
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                    className="relative aspect-[3/4] w-full bg-foreground/5 rounded mb-3 flex items-center justify-center overflow-hidden border border-foreground/5 transition-transform duration-200"
                  >
                    <img src={p.thumbUrl} alt={`Halaman ${p.pageNum}`} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-mono text-foreground/40 block mb-2">Hal {p.pageNum} ({p.rotation}°)</span>
                  <button
                    onClick={() => rotatePage(p.pageNum)}
                    className="w-full h-8 border border-foreground/10 text-[10px] font-bold uppercase rounded hover:bg-foreground/5 transition-colors"
                  >
                    Putar 90° ↻
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={savePdf}
              disabled={processing}
              className="w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              {processing ? "Sedang Menyimpan..." : "Simpan & Unduh PDF Baru"}
            </button>
          </div>
        )}

        {!loading && pages.length === 0 && (
          <div className="border-2 border-dashed border-foreground/15 rounded-xl p-10 text-center text-foreground/40">
            <span className="text-4xl block mb-2">🔄</span>
            <p className="text-sm font-medium">Unggah berkas PDF Anda untuk memutar arah orientasi setiap halaman secara individual.</p>
          </div>
        )}
      </div>
    </div>
  );
}
