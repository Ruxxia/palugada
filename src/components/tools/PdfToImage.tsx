import { useState, useRef } from "react";

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

interface PdfPageImage {
  pageNum: number;
  url: string;
}

export function PdfToImage() {
  const [pages, setPages] = useState<PdfPageImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setPages([]);

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const renderedPages: PdfPageImage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // Good resolution scale
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        await page.render({ canvasContext: ctx, viewport }).promise;

        renderedPages.push({
          pageNum: i,
          url: canvas.toDataURL("image/png"),
        });
      }

      setPages(renderedPages);
    } catch (error) {
      console.error(error);
      alert("Gagal membaca atau mengonversi berkas PDF.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (url: string, num: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName.replace(".pdf", "")}_page_${num}.png`;
    link.click();
  };

  const downloadAll = () => {
    pages.forEach((page) => {
      downloadImage(page.url, page.pageNum);
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-10 px-4 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-colors"
            >
              Pilih Berkas PDF
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePdfUpload}
              accept="application/pdf"
              className="hidden"
            />
          </div>

          {pages.length > 0 && (
            <button
              onClick={downloadAll}
              className="h-10 px-4 border border-foreground text-foreground rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-foreground/5 transition-colors"
            >
              Unduh Semua Halaman (PNG)
            </button>
          )}
        </div>

        {loading && (
          <div className="py-12 text-center text-foreground/50 text-sm font-mono">
            Sedang membaca & mengekstrak halaman PDF...
          </div>
        )}

        {pages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {pages.map((p) => (
              <div key={p.pageNum} className="relative bg-background border border-foreground/10 p-3 rounded-lg flex flex-col justify-between">
                <div className="relative aspect-[3/4] bg-foreground/5 rounded mb-3 flex items-center justify-center overflow-hidden border border-foreground/5">
                  <img src={p.url} alt={`Halaman ${p.pageNum}`} className="w-full h-full object-contain" />
                  <span className="absolute top-2 left-2 bg-foreground/80 text-background px-2 py-0.5 rounded text-[9px] font-mono">
                    Hal {p.pageNum}
                  </span>
                </div>
                <button
                  onClick={() => downloadImage(p.url, p.pageNum)}
                  className="w-full h-8 border border-foreground/10 hover:border-primary/30 text-[10px] font-bold uppercase tracking-wider rounded transition-colors bg-card hover:bg-primary/5"
                >
                  Unduh PNG
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && pages.length === 0 && (
          <div className="border-2 border-dashed border-foreground/15 rounded-xl p-10 text-center text-foreground/40">
            <span className="text-4xl block mb-2">📄</span>
            <p className="text-sm font-medium">Unggah berkas PDF Anda untuk dikonversi menjadi gambar per halaman.</p>
          </div>
        )}
      </div>
    </div>
  );
}
