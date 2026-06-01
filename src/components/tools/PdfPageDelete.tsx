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

interface PageItem {
  pageNum: number;
  thumbUrl: string;
  selected: boolean; // Selected for deletion
}

export function PdfPageDelete() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [manualPages, setManualPages] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    setPages([]);
    setManualPages("");

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const items: PageItem[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        await page.render({ canvasContext: ctx, viewport }).promise;

        items.push({
          pageNum: i,
          thumbUrl: canvas.toDataURL("image/png"),
          selected: false,
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

  const togglePageSelection = (pageNum: number) => {
    setPages((prev) =>
      prev.map((p) => (p.pageNum === pageNum ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleManualPagesChange = (val: string) => {
    setManualPages(val);
    // Parse input and select pages
    const pageSet = new Set<number>();
    const parts = val.split(",");
    parts.forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const range = trimmed.split("-");
        const start = parseInt(range[0], 10);
        const end = parseInt(range[1], 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            pageSet.add(i);
          }
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num)) {
          pageSet.add(num);
        }
      }
    });

    setPages((prev) =>
      prev.map((p) => ({ ...p, selected: pageSet.has(p.pageNum) }))
    );
  };

  const deletePages = async () => {
    if (!file) return;
    const pagesToDelete = pages.filter((p) => p.selected).map((p) => p.pageNum);
    
    if (pagesToDelete.length === 0) {
      alert("Pilih minimal satu halaman untuk dihapus.");
      return;
    }

    if (pagesToDelete.length === pages.length) {
      alert("Anda tidak dapat menghapus semua halaman dari dokumen PDF.");
      return;
    }

    setProcessing(true);

    try {
      const PDFLib = await loadPdfLib();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      
      // We must delete indices in descending order to avoid shift errors
      const sortedIndicesToDelete = pagesToDelete
        .map((p) => p - 1)
        .sort((a, b) => b - a);

      sortedIndicesToDelete.forEach((idx) => {
        pdfDoc.removePage(idx);
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${file.name.replace(".pdf", "")}_edited.pdf`;
      link.click();
    } catch (error) {
      console.error(error);
      alert("Gagal memproses penghapusan halaman PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const resetAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
    setManualPages("");
  };

  const selectedCount = pages.filter((p) => p.selected).length;

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
            <button
              onClick={resetAll}
              className="h-9 px-3 border border-foreground/10 text-xs font-bold rounded-lg hover:bg-foreground/5"
            >
              Batal Semua
            </button>
          )}
        </div>

        {file && pages.length > 0 && (
          <div className="space-y-4 border-t border-foreground/5 pt-4">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
              Ketik Nomor Halaman yang Ingin Dihapus
            </label>
            <input
              type="text"
              placeholder="Contoh: 1, 3, 5-7 (Halaman dipisahkan koma atau rentang)"
              value={manualPages}
              onChange={(e) => handleManualPagesChange(e.target.value)}
              className="w-full h-11 px-4 border border-foreground/10 rounded-lg text-sm bg-background focus:outline-none focus:border-primary transition-colors font-mono"
            />
            <p className="text-[10px] text-foreground/40 font-mono">
              Anda juga bisa langsung mengklik gambar halaman di bawah ini untuk memilih/membatalkan halaman yang akan dihapus.
            </p>
          </div>
        )}

        {loading && (
          <div className="py-12 text-center text-foreground/50 text-sm font-mono animate-pulse">
            Sedang membaca dokumen PDF...
          </div>
        )}

        {pages.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {pages.map((p) => (
                <div
                  key={p.pageNum}
                  onClick={() => togglePageSelection(p.pageNum)}
                  className={`relative bg-background border p-3 rounded-lg flex flex-col items-center cursor-pointer select-none transition-all ${
                    p.selected
                      ? "border-destructive/60 bg-destructive/5 ring-2 ring-destructive/20"
                      : "border-foreground/10 hover:border-foreground/30"
                  }`}
                >
                  <div className="relative aspect-[3/4] w-full bg-foreground/5 rounded mb-3 flex items-center justify-center overflow-hidden border border-foreground/5">
                    <img src={p.thumbUrl} alt={`Halaman ${p.pageNum}`} className="w-full h-full object-contain" />
                    {p.selected && (
                      <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-destructive text-white text-[10px] font-bold uppercase px-2 py-1 rounded shadow">
                          Hapus
                        </span>
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-mono block ${p.selected ? "text-destructive font-bold" : "text-foreground/50"}`}>
                    Halaman {p.pageNum}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-foreground/5 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <span className="text-xs font-mono text-foreground/60">
                Akan menghapus <strong className="text-destructive font-bold font-display text-sm">{selectedCount}</strong> dari {pages.length} halaman
              </span>
              <button
                onClick={deletePages}
                disabled={processing || selectedCount === 0}
                className="h-12 px-6 bg-destructive text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-destructive/90 transition-opacity flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
              >
                {processing ? "Sedang Memproses..." : "Hapus Halaman Terpilih & Download"}
              </button>
            </div>
          </div>
        )}

        {!loading && pages.length === 0 && (
          <div className="border-2 border-dashed border-foreground/15 rounded-xl p-10 text-center text-foreground/40">
            <span className="text-4xl block mb-2">🗑️</span>
            <p className="text-sm font-medium">Unggah berkas PDF Anda untuk memilih dan menghapus halaman yang tidak diperlukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
