import { useState, useRef, useEffect } from "react";

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

export function PdfWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState("DRAFT");
  const [opacity, setOpacity] = useState(0.3);
  const [fontSize, setFontSize] = useState(50);
  const [rotation, setRotation] = useState(45);
  const [colorHex, setColorHex] = useState("#ff0000"); // Red default
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfPageImage, setPdfPageImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Convert Hex color to RGB values between 0 and 1
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    setPdfPageImage(null);

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1); // Render first page for preview

      const viewport = page.getViewport({ scale: 0.8 }); // standard preview resolution
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;
      const tempCtx = tempCanvas.getContext("2d");
      await page.render({ canvasContext: tempCtx, viewport }).promise;

      setPdfPageImage(tempCanvas.toDataURL("image/png"));
    } catch (error) {
      console.error(error);
      alert("Gagal membaca dokumen PDF.");
    } finally {
      setLoading(false);
    }
  };

  // Real-time canvas drawing preview effect
  useEffect(() => {
    if (!pdfPageImage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = pdfPageImage;
    img.onload = () => {
      // Set canvas dimensions matching the rendered page image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw base PDF page
      ctx.drawImage(img, 0, 0);

      // Draw watermark on top
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      ctx.fillStyle = colorHex;
      ctx.globalAlpha = opacity;
      ctx.font = `bold ${fontSize}px Helvetica, Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(watermarkText, 0, 0);
      ctx.restore();
    };
  }, [pdfPageImage, watermarkText, opacity, fontSize, rotation, colorHex]);

  const applyWatermark = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const PDFLib = await loadPdfLib();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      
      const { r, g, b } = hexToRgb(colorHex);

      pages.forEach((page: any) => {
        const { width, height } = page.getSize();
        
        // Calculate text width and height
        const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = helveticaFont.heightAtSize(fontSize);
        
        // Target drawing in the center of the page
        // With rotation, we need to adjust slightly
        const rad = (rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        
        // Calculate offsets to center rotated text
        const x = width / 2 - (textWidth / 2) * cos + (textHeight / 2) * sin;
        const y = height / 2 - (textWidth / 2) * sin - (textHeight / 2) * cos;

        page.drawText(watermarkText, {
          x: x,
          y: y,
          size: fontSize,
          font: helveticaFont,
          color: PDFLib.rgb(r, g, b),
          opacity: opacity,
          rotate: PDFLib.degrees(rotation),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${file.name.replace(".pdf", "")}_watermarked.pdf`;
      link.click();
    } catch (error) {
      console.error(error);
      alert("Gagal menambahkan watermark pada dokumen PDF.");
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
            Sedang membaca dokumen PDF...
          </div>
        )}

        {file && pdfPageImage && (
          <div className="space-y-6 border-t border-foreground/5 pt-6 animate-fadeIn">
            <div className="flex flex-col gap-1 text-xs font-mono text-foreground/50">
              <span>Nama File: <strong className="text-foreground">{file.name}</strong></span>
              <span>Ukuran: <strong className="text-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</strong></span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Settings Panel */}
              <div className="space-y-4 bg-background p-5 rounded-lg border border-foreground/10">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-foreground/5 pb-2 mb-2">
                  Pengaturan Watermark
                </h3>
                
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                    Teks Watermark
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full h-11 px-4 border border-foreground/10 rounded-lg text-sm bg-card focus:outline-none focus:border-primary transition-colors font-bold tracking-widest"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                    Warna Watermark
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="w-10 h-10 border border-foreground/10 rounded cursor-pointer p-0.5 bg-card"
                    />
                    <span className="font-mono text-sm uppercase text-foreground/70">{colorHex}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                      Transparansi (Opacity)
                    </label>
                    <span className="text-xs font-mono text-primary font-bold">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                      Ukuran Huruf
                    </label>
                    <span className="text-xs font-mono text-primary font-bold">{fontSize} px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    step="5"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                      Kemiringan (Rotasi)
                    </label>
                    <span className="text-xs font-mono text-primary font-bold">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="5"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <button
                  onClick={applyWatermark}
                  disabled={processing || !watermarkText.trim()}
                  className="w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none mt-4"
                >
                  {processing ? "Sedang Menambahkan Watermark..." : "Terapkan Watermark & Download"}
                </button>
              </div>

              {/* Preview Panel */}
              <div className="space-y-4 bg-background p-5 rounded-lg border border-foreground/10 flex flex-col items-center">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-foreground/5 pb-2 mb-2 w-full text-center">
                  Pratinjau Langsung (Halaman 1)
                </h3>
                <div className="border border-foreground/10 rounded-lg overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,0.05)] bg-white max-w-full flex items-center justify-center p-2">
                  <canvas ref={canvasRef} className="max-w-full h-auto object-contain max-h-[350px] shadow-sm border border-foreground/5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {!file && !loading && (
          <div className="border-2 border-dashed border-foreground/15 rounded-xl p-10 text-center text-foreground/40">
            <span className="text-4xl block mb-2">🏷️</span>
            <p className="text-sm font-medium">Unggah berkas PDF Anda untuk menyematkan watermark kustom secara aman.</p>
          </div>
        )}
      </div>
    </div>
  );
}
