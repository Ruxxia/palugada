import { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export function BarcodeGenerator() {
  const [text, setText] = useState("123456789012");
  const [format, setFormat] = useState("CODE128");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [margin, setMargin] = useState(10);
  const [displayValue, setDisplayValue] = useState(true);
  const [background, setBackground] = useState("#ffffff");
  const [lineColor, setLineColor] = useState("#000000");
  const [error, setError] = useState("");

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setError("");
    if (!text) {
      return;
    }
    try {
      if (svgRef.current) {
        JsBarcode(svgRef.current, text, {
          format: format,
          width: width,
          height: height,
          margin: margin,
          displayValue: displayValue,
          background: background,
          lineColor: lineColor,
          valid: (valid) => {
            if (!valid) {
              setError(`Input tidak valid untuk format ${format}`);
            }
          },
        });
      }
    } catch (err: any) {
      setError(err?.message || "Gagal membuat barcode. Pastikan format input sesuai.");
    }
  }, [text, format, width, height, margin, displayValue, background, lineColor]);

  const downloadSvg = () => {
    if (!svgRef.current || error) return;
    const svgString = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `barcode-${format}-${text}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    if (!svgRef.current || error) return;
    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const DOMURL = window.URL || window.webkitURL || window;
    const url = DOMURL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const bbox = svgElement.getBoundingClientRect();
      // Increase resolution for crisper png
      const scale = 2;
      canvas.width = (bbox.width || 300) * scale;
      canvas.height = (bbox.height || 150) * scale;

      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = background;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.scale(scale, scale);
        context.drawImage(image, 0, 0);
        
        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `barcode-${format}-${text}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      DOMURL.revokeObjectURL(url);
    };
    image.src = url;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings Panel */}
      <div className="lg:col-span-1 space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Pengaturan Barcode</h3>

        <div className="space-y-4">
          {/* Format */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Format Barcode</label>
            <select
              value={format}
              onChange={(e) => {
                setFormat(e.target.value);
                // Adjust default text based on format
                if (e.target.value === "EAN13") setText("1234567890128");
                else if (e.target.value === "EAN8") setText("12345670");
                else if (e.target.value === "UPC") setText("123456789012");
                else setText("123456789012");
              }}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            >
              <option value="CODE128">CODE 128 (Alfanumerik - Standard)</option>
              <option value="CODE39">CODE 39 (Alfanumerik)</option>
              <option value="EAN13">EAN-13 (13 Angka Produk)</option>
              <option value="EAN8">EAN-8 (8 Angka Produk)</option>
              <option value="UPC">UPC-A (12 Angka Retail)</option>
              <option value="ITF14">ITF-14 (14 Angka Box/Karton)</option>
              <option value="MSI">MSI (Hanya Angka)</option>
              <option value="pharmacode">Pharmacode (Farmasi)</option>
            </select>
          </div>

          {/* Value */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Nilai / Kode</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Masukkan kode..."
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
            />
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Lebar Garis ({width}px)</label>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-foreground/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Tinggi ({height}px)</label>
              <input
                type="range"
                min="50"
                max="200"
                step="10"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-foreground/10"
              />
            </div>
          </div>

          {/* Margin & Show Text */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Margin ({margin}px)</label>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-foreground/10"
              />
            </div>
            <div className="flex items-center pt-6 gap-2">
              <input
                type="checkbox"
                id="displayValue"
                checked={displayValue}
                onChange={(e) => setDisplayValue(e.target.checked)}
                className="w-4 h-4 text-primary border-foreground/15 rounded focus:ring-0 cursor-pointer"
              />
              <label htmlFor="displayValue" className="text-xs font-mono uppercase tracking-wider text-foreground/70 cursor-pointer">
                Tampilkan Teks
              </label>
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Warna Garis</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={lineColor}
                  onChange={(e) => setLineColor(e.target.value)}
                  className="w-8 h-8 rounded border border-foreground/10 cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono uppercase">{lineColor}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Warna Latar</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-8 h-8 rounded border border-foreground/10 cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono uppercase">{background}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview & Output Panel */}
      <div className="lg:col-span-2 space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Preview Barcode</h3>

          {error ? (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-sm font-mono">
              {error}
            </div>
          ) : (
            <div className="bg-white border border-foreground/10 rounded-xl p-8 flex items-center justify-center min-h-[250px] overflow-auto">
              <svg ref={svgRef}></svg>
            </div>
          )}
        </div>

        {!error && text && (
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-foreground/10">
            <button
              onClick={downloadPng}
              className="flex-1 h-12 bg-foreground text-background rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
            >
              Download PNG
            </button>
            <button
              onClick={downloadSvg}
              className="flex-1 h-12 bg-background border-2 border-foreground text-foreground rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/5 transition-colors"
            >
              Download SVG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
