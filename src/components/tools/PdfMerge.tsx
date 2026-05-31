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

interface UploadedPdf {
  id: string;
  name: string;
  size: string;
  file: File;
}

export function PdfMerge() {
  const [files, setFiles] = useState<UploadedPdf[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded) return;

    const newFiles: UploadedPdf[] = [];
    for (let i = 0; i < uploaded.length; i++) {
      const file = uploaded[i];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: `${sizeMb} MB`,
        file,
      });
    }
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    const newFiles = [...files];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newFiles.length) return;

    const temp = newFiles[index];
    newFiles[index] = newFiles[target];
    newFiles[target] = temp;
    setFiles(newFiles);
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
    setLoading(true);

    try {
      const PDFLib = await loadPdfLib();
      const mergedPdf = await PDFLib.PDFDocument.create();

      for (const f of files) {
        const bytes = await f.file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page: any) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "merged-document.pdf";
      link.click();
    } catch (error) {
      console.error(error);
      alert("Gagal menggabungkan berkas PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-10 px-4 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-colors"
          >
            Pilih Berkas PDF
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="application/pdf"
            className="hidden"
          />
        </div>

        {files.length > 0 ? (
          <div className="space-y-2">
            {files.map((file, idx) => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-background border border-foreground/10 rounded-lg">
                <div className="min-w-0 flex-1 pr-4">
                  <span className="font-bold text-sm block truncate">{file.name}</span>
                  <span className="text-[10px] font-mono text-foreground/40">{file.size}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveFile(idx, "up")}
                    className="w-8 h-8 flex items-center justify-center border border-foreground/10 rounded-lg hover:bg-foreground/5 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    disabled={idx === files.length - 1}
                    onClick={() => moveFile(idx, "down")}
                    className="w-8 h-8 flex items-center justify-center border border-foreground/10 rounded-lg hover:bg-foreground/5 disabled:opacity-30"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="w-8 h-8 flex items-center justify-center border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/5"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-foreground/15 rounded-xl p-10 text-center text-foreground/40">
            <span className="text-4xl block mb-2">🔀</span>
            <p className="text-sm font-medium">Unggah dua atau lebih berkas PDF untuk digabungkan menjadi satu berkas.</p>
          </div>
        )}

        {files.length >= 2 && (
          <button
            onClick={mergePdfs}
            disabled={loading}
            className="w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            {loading ? "Sedang Menggabungkan..." : "Gabungkan & Unduh PDF"}
          </button>
        )}
      </div>
    </div>
  );
}
