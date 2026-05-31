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

interface OutputPdf {
  name: string;
  blobUrl: string;
}

export function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [splitMethod, setSplitMethod] = useState<"range" | "single">("range");
  const [ranges, setRanges] = useState("1-2, 3-4");
  const [outputs, setOutputs] = useState<OutputPdf[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setOutputs([]);
  };

  const parseRanges = (maxPages: number): number[][] => {
    const parts = ranges.split(",");
    const result: number[][] = [];

    for (const part of parts) {
      const clean = part.trim();
      if (!clean) continue;

      if (clean.includes("-")) {
        const [startStr, endStr] = clean.split("-");
        const start = Math.max(1, parseInt(startStr) || 1);
        const end = Math.min(maxPages, parseInt(endStr) || maxPages);
        const list: number[] = [];
        for (let i = start; i <= end; i++) {
          list.push(i - 1); // 0-based index
        }
        if (list.length > 0) result.push(list);
      } else {
        const pageNum = parseInt(clean);
        if (pageNum >= 1 && pageNum <= maxPages) {
          result.push([pageNum - 1]);
        }
      }
    }
    return result;
  };

  const splitPdf = async () => {
    if (!file) return;
    setLoading(true);
    setOutputs([]);

    try {
      const PDFLib = await loadPdfLib();
      const arrayBuffer = await file.arrayBuffer();
      const srcPdf = await PDFLib.PDFDocument.load(arrayBuffer);
      const totalPages = srcPdf.getPageCount();

      const newOutputs: OutputPdf[] = [];

      if (splitMethod === "single") {
        // Split every page
        for (let i = 0; i < totalPages; i++) {
          const newDoc = await PDFLib.PDFDocument.create();
          const [copiedPage] = await newDoc.copyPages(srcPdf, [i]);
          newDoc.addPage(copiedPage);

          const bytes = await newDoc.save();
          const blob = new Blob([bytes], { type: "application/pdf" });
          newOutputs.push({
            name: `${file.name.replace(".pdf", "")}_halaman_${i + 1}.pdf`,
            blobUrl: URL.createObjectURL(blob),
          });
        }
      } else {
        // Split by ranges
        const parsed = parseRanges(totalPages);
        let count = 1;
        for (const indices of parsed) {
          const newDoc = await PDFLib.PDFDocument.create();
          const copiedPages = await newDoc.copyPages(srcPdf, indices);
          copiedPages.forEach((page: any) => newDoc.addPage(page));

          const bytes = await newDoc.save();
          const blob = new Blob([bytes], { type: "application/pdf" });
          newOutputs.push({
            name: `${file.name.replace(".pdf", "")}_bagian_${count}.pdf`,
            blobUrl: URL.createObjectURL(blob),
          });
          count++;
        }
      }

      setOutputs(newOutputs);
    } catch (error) {
      console.error(error);
      alert("Gagal memisahkan berkas PDF.");
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = (out: OutputPdf) => {
    const link = document.createElement("a");
    link.href = out.blobUrl;
    link.download = out.name;
    link.click();
  };

  const downloadAll = () => {
    outputs.forEach(triggerDownload);
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

          {file && (
            <span className="text-xs font-mono text-foreground/50 truncate max-w-xs">{file.name}</span>
          )}
        </div>

        {file && (
          <div className="space-y-4 pt-4 border-t border-foreground/10">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block mb-2">Metode Pisah PDF</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSplitMethod("range")}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase ${
                    splitMethod === "range" ? "bg-primary text-white border-primary" : "bg-background border-foreground/10"
                  }`}
                >
                  Berdasarkan Halaman / Rentang
                </button>
                <button
                  onClick={() => setSplitMethod("single")}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase ${
                    splitMethod === "single" ? "bg-primary text-white border-primary" : "bg-background border-foreground/10"
                  }`}
                >
                  Pisahkan Per Halaman
                </button>
              </div>
            </div>

            {splitMethod === "range" && (
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-foreground/60 block mb-1">
                  Masukkan Rentang Halaman (e.g. 1-2, 3-5, 6)
                </label>
                <input
                  type="text"
                  value={ranges}
                  onChange={(e) => setRanges(e.target.value)}
                  className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-medium"
                />
              </div>
            )}

            <button
              onClick={splitPdf}
              disabled={loading}
              className="w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              {loading ? "Sedang Memisahkan..." : "Proses Pisah PDF"}
            </button>
          </div>
        )}

        {outputs.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-foreground/10">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil File PDF Pisahan</h4>
              <button
                onClick={downloadAll}
                className="text-xs text-primary font-bold hover:underline uppercase"
              >
                Unduh Semua
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {outputs.map((out, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-background border border-foreground/10 rounded-lg">
                  <span className="text-xs font-mono truncate max-w-[200px]">{out.name}</span>
                  <button
                    onClick={() => triggerDownload(out)}
                    className="h-8 px-3 border border-foreground/10 text-[10px] font-bold uppercase rounded hover:bg-foreground/5 transition-colors"
                  >
                    Unduh
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!file && (
          <div className="border-2 border-dashed border-foreground/15 rounded-xl p-10 text-center text-foreground/40">
            <span className="text-4xl block mb-2">✂️</span>
            <p className="text-sm font-medium">Unggah berkas PDF Anda untuk dipotong atau dipisahkan menjadi beberapa berkas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
