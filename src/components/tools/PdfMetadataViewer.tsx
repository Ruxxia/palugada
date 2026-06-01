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

interface PdfMeta {
  fileName: string;
  fileSize: string;
  sha256: string;
  pageCount: number;
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
}

export function PdfMetadataViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<PdfMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to compute SHA256 of ArrayBuffer
  const computeSHA256 = async (buffer: ArrayBuffer): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "-";
    try {
      return date.toLocaleString("id-ID", {
        dateStyle: "long",
        timeStyle: "medium",
      });
    } catch {
      return date.toString();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    setMeta(null);

    try {
      const PDFLib = await loadPdfLib();
      const arrayBuffer = await f.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { updateMetadata: false });
      
      const sha256Hash = await computeSHA256(arrayBuffer);

      setMeta({
        fileName: f.name,
        fileSize: `${(f.size / 1024 / 1024).toFixed(2)} MB (${f.size.toLocaleString("id-ID")} bytes)`,
        sha256: sha256Hash,
        pageCount: pdfDoc.getPageCount(),
        title: pdfDoc.getTitle() || "-",
        author: pdfDoc.getAuthor() || "-",
        subject: pdfDoc.getSubject() || "-",
        keywords: pdfDoc.getKeywords() || "-",
        creator: pdfDoc.getCreator() || "-",
        producer: pdfDoc.getProducer() || "-",
        creationDate: formatDate(pdfDoc.getCreationDate()),
        modificationDate: formatDate(pdfDoc.getModificationDate()),
      });
    } catch (error) {
      console.error(error);
      alert("Gagal membaca metadata dokumen PDF. Kemungkinan file dienkripsi atau rusak.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (text === "-") return;
    navigator.clipboard.writeText(text);
    alert(`${label} berhasil disalin!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
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

        {loading && (
          <div className="py-12 text-center text-foreground/50 text-sm font-mono animate-pulse">
            Menganalisis file & mengekstrak metadata...
          </div>
        )}

        {meta && (
          <div className="space-y-6 animate-fadeIn">
            {/* File Info */}
            <div className="bg-background rounded-lg border border-foreground/10 p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-foreground/5 pb-2">
                Informasi Berkas (File Info)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-foreground/40 block mb-1">Nama File:</span>
                  <span className="text-foreground font-bold select-all">{meta.fileName}</span>
                </div>
                <div>
                  <span className="text-foreground/40 block mb-1">Ukuran File:</span>
                  <span className="text-foreground font-bold">{meta.fileSize}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-foreground/40 block mb-1">SHA-256 Checksum:</span>
                  <span className="text-foreground font-bold text-[10px] break-all select-all block bg-card p-2 rounded border border-foreground/5">
                    {meta.sha256}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Metadata */}
            <div className="bg-background rounded-lg border border-foreground/10 p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-foreground/5 pb-2">
                Metadata Dokumen (PDF Properties)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs font-mono">
                <div className="flex justify-between items-center py-1.5 border-b border-foreground/5 gap-4">
                  <span className="text-foreground/50">Jumlah Halaman:</span>
                  <span className="text-foreground font-bold text-sm font-display">{meta.pageCount}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-foreground/5 gap-4">
                  <span className="text-foreground/50">Judul (Title):</span>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-foreground font-bold truncate max-w-[150px] md:max-w-[220px]" title={meta.title}>
                      {meta.title}
                    </span>
                    {meta.title !== "-" && (
                      <button
                        onClick={() => copyToClipboard(meta.title, "Judul")}
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        Salin
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-foreground/5 gap-4">
                  <span className="text-foreground/50">Penulis (Author):</span>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-foreground font-bold truncate max-w-[150px]" title={meta.author}>
                      {meta.author}
                    </span>
                    {meta.author !== "-" && (
                      <button
                        onClick={() => copyToClipboard(meta.author, "Penulis")}
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        Salin
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-foreground/5 gap-4">
                  <span className="text-foreground/50">Subjek (Subject):</span>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-foreground font-bold truncate max-w-[150px]" title={meta.subject}>
                      {meta.subject}
                    </span>
                    {meta.subject !== "-" && (
                      <button
                        onClick={() => copyToClipboard(meta.subject, "Subjek")}
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        Salin
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-foreground/5 gap-4">
                  <span className="text-foreground/50">Kata Kunci (Keywords):</span>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-foreground font-bold truncate max-w-[150px]" title={meta.keywords}>
                      {meta.keywords}
                    </span>
                    {meta.keywords !== "-" && (
                      <button
                        onClick={() => copyToClipboard(meta.keywords, "Kata Kunci")}
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        Salin
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-foreground/5 gap-4">
                  <span className="text-foreground/50">Pembuat (Creator):</span>
                  <span className="text-foreground font-bold truncate max-w-[150px]" title={meta.creator}>
                    {meta.creator}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-foreground/5 gap-4">
                  <span className="text-foreground/50">Produser (Producer):</span>
                  <span className="text-foreground font-bold truncate max-w-[150px]" title={meta.producer}>
                    {meta.producer}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-foreground/5 gap-4">
                  <span className="text-foreground/50">Dibuat Pada:</span>
                  <span className="text-foreground font-bold text-right text-[11px]">{meta.creationDate}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-foreground/5 gap-4">
                  <span className="text-foreground/50">Terakhir Diubah:</span>
                  <span className="text-foreground font-bold text-right text-[11px]">{meta.modificationDate}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!file && !loading && (
          <div className="border-2 border-dashed border-foreground/15 rounded-xl p-10 text-center text-foreground/40">
            <span className="text-4xl block mb-2">ℹ️</span>
            <p className="text-sm font-medium">Unggah berkas PDF Anda untuk menampilkan seluruh metadata dan properti dokumen.</p>
          </div>
        )}
      </div>
    </div>
  );
}
