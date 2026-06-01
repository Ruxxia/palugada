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
  id: string; // Keep unique id to track order
  originalNum: number;
  thumbUrl: string;
}

export function PdfReorderPages() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [manualOrder, setManualOrder] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    setPages([]);
    setManualOrder("");

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const items: PageItem[] = [];
      const orderList: number[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        await page.render({ canvasContext: ctx, viewport }).promise;

        items.push({
          id: `page-${i}-${Date.now()}`,
          originalNum: i,
          thumbUrl: canvas.toDataURL("image/png"),
        });
        orderList.push(i);
      }
      setPages(items);
      setManualOrder(orderList.join(", "));
    } catch (error) {
      console.error(error);
      alert("Gagal membaca dokumen PDF.");
    } finally {
      setLoading(false);
    }
  };

  const movePage = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pages.length) return;

    const newPages = [...pages];
    const temp = newPages[index];
    newPages[index] = newPages[newIndex];
    newPages[newIndex] = temp;

    setPages(newPages);
    setManualOrder(newPages.map((p) => p.originalNum).join(", "));
  };

  const handleManualOrderChange = (val: string) => {
    setManualOrder(val);

    // Parse list of indices
    const indices = val
      .split(",")
      .map((x) => parseInt(x.trim(), 10))
      .filter((x) => !isNaN(x) && x >= 1 && x <= pages.length);

    // Reorder pages based on indices
    if (indices.length === pages.length) {
      // Avoid duplicate pages in the resulting list
      const seen = new Set<number>();
      const valid = indices.every((idx) => {
        if (seen.has(idx)) return false;
        seen.add(idx);
        return true;
      });

      if (valid) {
        // Build new page list
        const reordered = indices.map((idx) => {
          return pages.find((p) => p.originalNum === idx)!;
        }).filter(Boolean);
        if (reordered.length === pages.length) {
          setPages(reordered);
        }
      }
    }
  };

  const resetOrder = () => {
    if (!pages.length) return;
    const sorted = [...pages].sort((a, b) => a.originalNum - b.originalNum);
    setPages(sorted);
    setManualOrder(sorted.map((p) => p.originalNum).join(", "));
  };

  const savePdf = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const PDFLib = await loadPdfLib();
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const pdfDoc = await PDFLib.PDFDocument.create();

      // Copy pages in the new order
      const pageIndices = pages.map((p) => p.originalNum - 1);
      const copiedPages = await pdfDoc.copyPages(srcDoc, pageIndices);
      
      copiedPages.forEach((page) => {
        pdfDoc.addPage(page);
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${file.name.replace(".pdf", "")}_reordered.pdf`;
      link.click();
    } catch (error) {
      console.error(error);
      alert("Gagal menyusun ulang halaman PDF.");
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
            <button
              onClick={resetOrder}
              className="h-9 px-3 border border-foreground/10 text-xs font-bold rounded-lg hover:bg-foreground/5"
            >
              Urutan Semula
            </button>
          )}
        </div>

        {file && pages.length > 0 && (
          <div className="space-y-4 border-t border-foreground/5 pt-4">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
              Kustomisasi Urutan Halaman (Pisahkan Koma)
            </label>
            <input
              type="text"
              value={manualOrder}
              onChange={(e) => handleManualOrderChange(e.target.value)}
              className="w-full h-11 px-4 border border-foreground/10 rounded-lg text-sm bg-background focus:outline-none focus:border-primary transition-colors font-mono"
            />
            <p className="text-[10px] text-foreground/40 font-mono">
              Anda juga bisa menggunakan tombol tombol navigasi ◀ dan ▶ di bawah kartu halaman untuk memindahkannya satu persatu.
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
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  className="relative bg-background border border-foreground/10 p-3 rounded-lg flex flex-col items-center group/card"
                >
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary text-white font-mono text-xs font-bold flex items-center justify-center shadow">
                    {idx + 1}
                  </div>
                  
                  <div className="relative aspect-[3/4] w-full bg-foreground/5 rounded mb-3 flex items-center justify-center overflow-hidden border border-foreground/5">
                    <img src={p.thumbUrl} alt={`Halaman Asli ${p.originalNum}`} className="w-full h-full object-contain" />
                  </div>

                  <span className="text-[10px] font-mono text-foreground/40 block mb-3">
                    Asal: Halaman {p.originalNum}
                  </span>

                  <div className="flex w-full gap-1.5">
                    <button
                      disabled={idx === 0}
                      onClick={() => movePage(idx, "left")}
                      className="flex-1 h-8 border border-foreground/10 text-xs font-bold rounded hover:bg-foreground/5 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                      title="Geser ke Kiri"
                    >
                      ◀
                    </button>
                    <button
                      disabled={idx === pages.length - 1}
                      onClick={() => movePage(idx, "right")}
                      className="flex-1 h-8 border border-foreground/10 text-xs font-bold rounded hover:bg-foreground/5 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                      title="Geser ke Kanan"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={savePdf}
              disabled={processing}
              className="w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              {processing ? "Sedang Memproses..." : "Terapkan Susunan Baru & Download"}
            </button>
          </div>
        )}

        {!loading && pages.length === 0 && (
          <div className="border-2 border-dashed border-foreground/15 rounded-xl p-10 text-center text-foreground/40">
            <span className="text-4xl block mb-2">📋</span>
            <p className="text-sm font-medium">Unggah berkas PDF Anda untuk menyusun ulang letak urutan halamannya.</p>
          </div>
        )}
      </div>
    </div>
  );
}
