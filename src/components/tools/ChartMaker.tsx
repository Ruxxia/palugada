import { useState, useMemo, useRef } from "react";
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { Download, Copy, Check, Upload, RefreshCw, AlertCircle, FileText, FileCode } from "lucide-react";

// ==========================================
// Theme Palettes
// ==========================================
interface ThemePalette {
  name: string;
  colors: string[];
}

const THEMES: Record<string, ThemePalette> = {
  pastel: {
    name: "Modern Pastel",
    colors: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00c49f", "#a4de6c", "#d0ed57"]
  },
  neon: {
    name: "Vibrant Neon",
    colors: ["#ff007f", "#00f0ff", "#39ff14", "#ffb000", "#8f00ff", "#ff4500", "#dfff00", "#00ffcc"]
  },
  brutalist: {
    name: "Brutalist Monochrome",
    colors: ["#000000", "#333333", "#666666", "#999999", "#cccccc", "#e6e6e6", "#f2f2f2", "#7f7f7f"]
  },
  ocean: {
    name: "Ocean Blue",
    colors: ["#0077b6", "#0096c7", "#03045e", "#00b4d8", "#90e0ef", "#00c49f", "#002855", "#023e8a"]
  }
};

// ==========================================
// Sample Data
// ==========================================
const SAMPLE_JSON = JSON.stringify([
  { "Bulan": "Januari", "Penjualan": 4000, "Pengunjung": 2400 },
  { "Bulan": "Februari", "Penjualan": 3000, "Pengunjung": 1398 },
  { "Bulan": "Maret", "Penjualan": 2000, "Pengunjung": 9800 },
  { "Bulan": "April", "Penjualan": 2780, "Pengunjung": 3908 },
  { "Bulan": "Mei", "Penjualan": 1890, "Pengunjung": 4800 },
  { "Bulan": "Juni", "Penjualan": 2390, "Pengunjung": 3800 },
  { "Bulan": "Juli", "Penjualan": 3490, "Pengunjung": 4300 }
], null, 2);

const SAMPLE_CSV = `Bulan,Penjualan,Pengunjung
Januari,4000,2400
Februari,3000,1398
Maret,2000,9800
April,2780,3908
Mei,1890,4800
Juni,2390,3800
Juli,3490,4300`;

// ==========================================
// Helpers
// ==========================================
function cleanNumber(val: any): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  // Strip currency symbols, commas, percent signs, and spaces
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseCSV(text: string): Record<string, any>[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  // Auto-detect delimiter
  const firstLine = lines[0];
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;
  const tabs = (firstLine.match(/\t/g) || []).length;

  let delimiter = ",";
  if (semicolons > commas && semicolons > tabs) delimiter = ";";
  if (tabs > commas && tabs > semicolons) delimiter = "\t";

  const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ""));
  const data: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ""));
    const row: Record<string, any> = {};
    headers.forEach((header, index) => {
      const rawVal = values[index] !== undefined ? values[index] : "";
      // If looks like a number, cast it
      const cleanedNum = cleanNumber(rawVal);
      row[header] = isNaN(Number(rawVal)) || rawVal === "" ? rawVal : cleanedNum;
    });
    data.push(row);
  }

  return data;
}

export function ChartMaker() {
  const [format, setFormat] = useState<"csv" | "json">("json");
  const [inputText, setInputText] = useState(SAMPLE_JSON);
  
  // Chart Config
  const [chartType, setChartType] = useState<"bar" | "line" | "area" | "pie">("bar");
  const [chartTitle, setChartTitle] = useState("Grafik Penjualan Bulanan");
  const [xAxisKey, setXAxisKey] = useState<string>("Bulan");
  const [yAxisKey, setYAxisKey] = useState<string>("Penjualan");
  const [theme, setTheme] = useState<string>("pastel");
  const [showGrid, setShowGrid] = useState(true);

  // States
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Load sample data
  const handleLoadSample = () => {
    if (format === "json") {
      setInputText(SAMPLE_JSON);
    } else {
      setInputText(SAMPLE_CSV);
    }
    setError("");
  };

  // Parse Text to Data Array
  const parsedDataResult = useMemo(() => {
    if (!inputText.trim()) {
      return { data: [], keys: [] };
    }

    try {
      if (format === "json") {
        const parsed = JSON.parse(inputText);
        if (!Array.isArray(parsed)) {
          throw new Error("JSON harus berupa array dari object, contoh: [{ 'label': 'A', 'value': 10 }]");
        }
        if (parsed.length > 0 && typeof parsed[0] !== "object") {
          throw new Error("Elemen array pertama bukan merupakan object.");
        }
        setError("");
        const keys = parsed.length > 0 ? Object.keys(parsed[0]) : [];
        return { data: parsed, keys };
      } else {
        const parsed = parseCSV(inputText);
        if (parsed.length === 0) {
          throw new Error("Gagal mengurai CSV. Periksa format baris header dan data Anda.");
        }
        setError("");
        const keys = Object.keys(parsed[0]);
        return { data: parsed, keys };
      }
    } catch (e) {
      setError((e as Error).message);
      return { data: [], keys: [] };
    }
  }, [inputText, format]);

  const chartData = parsedDataResult.data;
  const availableKeys = parsedDataResult.keys;

  // Auto-correct axis keys if they are not in the newly parsed keys
  useMemo(() => {
    if (availableKeys.length > 0) {
      if (!availableKeys.includes(xAxisKey)) {
        setXAxisKey(availableKeys[0]);
      }
      if (!availableKeys.includes(yAxisKey)) {
        // Try to find a numeric candidate key for Y-Axis
        const firstRow = chartData[0];
        const numericCandidate = availableKeys.find(k => typeof cleanNumber(firstRow[k]) === "number" && k !== availableKeys[0]);
        setYAxisKey(numericCandidate || availableKeys[1] || availableKeys[0]);
      }
    }
  }, [availableKeys, chartData]);

  // Color Mapping
  const activeColors = THEMES[theme]?.colors || THEMES.pastel.colors;

  // Export to PNG Function
  const handleExportPNG = () => {
    if (!chartRef.current) return;

    try {
      const svgElement = chartRef.current.querySelector("svg");
      if (!svgElement) {
        alert("Elemen SVG grafik tidak ditemukan.");
        return;
      }

      // Clone SVG node to avoid altering the active view
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      
      // Inline styling to ensure typography and shapes render correctly
      clonedSvg.setAttribute("style", "background-color: transparent; font-family: monospace;");
      
      // Get SVG dimensions
      const width = svgElement.clientWidth || 800;
      const height = svgElement.clientHeight || 400;
      clonedSvg.setAttribute("width", String(width));
      clonedSvg.setAttribute("height", String(height));

      // Serialize SVG XML
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width * 2; // scale for higher resolution
        canvas.height = height * 2;
        
        const context = canvas.getContext("2d");
        if (context) {
          context.scale(2, 2);
          
          // Draw plain white background
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, width, height);
          
          // Draw Title Text on Canvas
          context.fillStyle = "#000000";
          context.font = "bold 16px monospace";
          context.textAlign = "center";
          context.fillText(chartTitle, width / 2, 30);

          // Draw the SVG graphic below the title
          // Offset y-axis rendering to make room for canvas-drawn title
          context.drawImage(image, 0, 10);

          // Trigger Canvas Download
          const pngURL = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngURL;
          downloadLink.download = `${chartTitle.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        URL.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    } catch (e) {
      console.error(e);
      alert("Gagal mengekspor grafik menjadi gambar PNG.");
    }
  };

  const handleCopyCleanJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(chartData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Brutalist Header Info */}
      <div className="border border-foreground/15 rounded-lg bg-card p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div>
          <h2 className="font-bold text-sm uppercase tracking-wide">💡 Panduan Cepat</h2>
          <p className="text-xs text-foreground/75 mt-1">
            Ubah data terstruktur CSV atau JSON Anda menjadi grafik interaktif. Pilih pemetaan sumbu X/Y, ubah tema warna, lalu ekspor hasilnya. Seluruh pemrosesan dilakukan di komputer Anda.
          </p>
        </div>
        <button
          onClick={handleLoadSample}
          className="bg-foreground text-background px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-foreground/90 transition-colors flex items-center gap-1.5 cursor-pointer self-stretch md:self-auto text-center justify-center"
        >
          <RefreshCw size={12} />
          Load Contoh Data
        </button>
      </div>

      {/* Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Panel: Configuration & Input (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Section 1: Data Input */}
          <div className="border border-foreground/15 rounded-lg bg-background p-4 space-y-3">
            <div className="flex justify-between items-center select-none">
              <span className="font-bold text-xs uppercase tracking-wider">Langkah 1: Tempel Data</span>
              
              <div className="flex bg-card border border-foreground/15 rounded-md p-0.5 font-mono text-[10px]">
                <button
                  onClick={() => { setFormat("json"); setInputText(SAMPLE_JSON); setError(""); }}
                  className={`px-2 py-1 rounded font-bold uppercase cursor-pointer flex items-center gap-1 transition-colors ${
                    format === "json" ? "bg-foreground text-background" : "hover:bg-foreground/5 text-foreground/75"
                  }`}
                >
                  <FileCode size={10} />
                  JSON
                </button>
                <button
                  onClick={() => { setFormat("csv"); setInputText(SAMPLE_CSV); setError(""); }}
                  className={`px-2 py-1 rounded font-bold uppercase cursor-pointer flex items-center gap-1 transition-colors ${
                    format === "csv" ? "bg-foreground text-background" : "hover:bg-foreground/5 text-foreground/75"
                  }`}
                >
                  <FileText size={10} />
                  CSV
                </button>
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              className="w-full font-mono text-xs p-3 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary resize-y"
              placeholder={format === "json" ? "Paste array JSON di sini..." : "Paste baris CSV di sini..."}
              aria-label="Chart data input"
            />

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-xs font-mono flex items-start gap-2 animate-shake">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block font-bold">Gagal Mengurai Data:</strong>
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Mapping & Customization */}
          <div className="border border-foreground/15 rounded-lg bg-background p-4 space-y-4">
            <span className="font-bold text-xs uppercase tracking-wider block select-none">Langkah 2: Konfigurasi Grafik</span>

            <div className="space-y-3">
              {/* Chart Title */}
              <div>
                <label htmlFor="title-input" className="block text-xs font-bold text-foreground/70 mb-1 select-none">Judul Grafik</label>
                <input
                  id="title-input"
                  type="text"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-foreground text-xs focus:outline-none focus:border-primary font-mono"
                  placeholder="Masukkan judul grafik..."
                />
              </div>

              {/* X-Axis mapping */}
              <div>
                <label htmlFor="xaxis-select" className="block text-xs font-bold text-foreground/70 mb-1 select-none">Sumbu X (Label Kategori)</label>
                <select
                  id="xaxis-select"
                  value={xAxisKey}
                  onChange={(e) => setXAxisKey(e.target.value)}
                  disabled={availableKeys.length === 0}
                  className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-foreground text-xs focus:outline-none focus:border-primary font-mono cursor-pointer"
                >
                  {availableKeys.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                  {availableKeys.length === 0 && <option value="">(Menunggu input data valid)</option>}
                </select>
              </div>

              {/* Y-Axis mapping */}
              <div>
                <label htmlFor="yaxis-select" className="block text-xs font-bold text-foreground/70 mb-1 select-none">Sumbu Y (Nilai Angka)</label>
                <select
                  id="yaxis-select"
                  value={yAxisKey}
                  onChange={(e) => setYAxisKey(e.target.value)}
                  disabled={availableKeys.length === 0}
                  className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-foreground text-xs focus:outline-none focus:border-primary font-mono cursor-pointer"
                >
                  {availableKeys.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                  {availableKeys.length === 0 && <option value="">(Menunggu input data valid)</option>}
                </select>
              </div>

              {/* Chart Type & Styling Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="charttype-select" className="block text-xs font-bold text-foreground/70 mb-1 select-none">Tipe Grafik</label>
                  <select
                    id="charttype-select"
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as any)}
                    className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-foreground text-xs focus:outline-none focus:border-primary font-mono cursor-pointer"
                  >
                    <option value="bar">Bar (Batang)</option>
                    <option value="line">Line (Garis)</option>
                    <option value="area">Area (Wilayah)</option>
                    <option value="pie">Pie (Lingkaran)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="theme-select" className="block text-xs font-bold text-foreground/70 mb-1 select-none">Tema Warna</label>
                  <select
                    id="theme-select"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full p-2 border border-foreground/15 rounded-lg bg-background text-foreground text-xs focus:outline-none focus:border-primary font-mono cursor-pointer"
                  >
                    {Object.keys(THEMES).map(t => (
                      <option key={t} value={t}>{THEMES[t].name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggle Grid lines */}
              <div className="flex items-center gap-2 pt-1 select-none">
                <input
                  id="showgrid-checkbox"
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-4 h-4 accent-foreground cursor-pointer rounded border-foreground/15"
                />
                <label htmlFor="showgrid-checkbox" className="text-xs font-medium text-foreground/80 cursor-pointer">
                  Tampilkan garis kisi (Grid Lines)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Chart Preview & Output Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="border border-foreground/15 rounded-lg bg-background overflow-hidden flex flex-col">
            
            {/* Header Title bar */}
            <div className="bg-card px-4 py-3 border-b border-foreground/10 flex justify-between items-center text-xs select-none">
              <span className="text-foreground/50 uppercase tracking-wider font-bold">Langkah 3: Live Preview</span>
              {chartData.length > 0 && (
                <span className="text-[10px] bg-foreground/5 px-2 py-0.5 rounded text-foreground/70 font-mono">
                  {chartData.length} baris terdeteksi
                </span>
              )}
            </div>

            {/* Canvas / SVG Render Panel */}
            <div className="p-4 bg-white dark:bg-white flex flex-col items-center justify-center min-h-[380px]">
              
              {chartData.length === 0 ? (
                <div className="text-center text-zinc-400 select-none py-10">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-xs font-mono">Data tidak valid atau kosong.</p>
                  <p className="text-[10px] mt-1">Gunakan tombol 'Load Contoh Data' di atas.</p>
                </div>
              ) : (
                <div className="w-full text-center flex flex-col justify-between" style={{ height: "350px" }} ref={chartRef}>
                  
                  {/* Dynamic Title (for screen/web preview, canvas renders it separately in canvas draw) */}
                  <h3 className="text-black font-bold text-sm mb-4 tracking-wide truncate">
                    {chartTitle}
                  </h3>

                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="90%">
                      {chartType === "bar" ? (
                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
                          <XAxis dataKey={xAxisKey} tick={{ fill: "#000000", fontSize: 10 }} stroke="#000000" />
                          <YAxis tick={{ fill: "#000000", fontSize: 10 }} stroke="#000000" />
                          <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#000000", color: "#000000", fontSize: 11, fontFamily: "monospace" }} />
                          <Legend wrapperStyle={{ fontSize: 10, fill: "#000000" }} />
                          <Bar dataKey={yAxisKey} fill={activeColors[0]} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      ) : chartType === "line" ? (
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
                          <XAxis dataKey={xAxisKey} tick={{ fill: "#000000", fontSize: 10 }} stroke="#000000" />
                          <YAxis tick={{ fill: "#000000", fontSize: 10 }} stroke="#000000" />
                          <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#000000", color: "#000000", fontSize: 11, fontFamily: "monospace" }} />
                          <Legend wrapperStyle={{ fontSize: 10, fill: "#000000" }} />
                          <Line type="monotone" dataKey={yAxisKey} stroke={activeColors[0]} strokeWidth={3} activeDot={{ r: 6 }} dot={{ stroke: activeColors[0], strokeWidth: 2, r: 4, fill: "#ffffff" }} />
                        </LineChart>
                      ) : chartType === "area" ? (
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
                          <XAxis dataKey={xAxisKey} tick={{ fill: "#000000", fontSize: 10 }} stroke="#000000" />
                          <YAxis tick={{ fill: "#000000", fontSize: 10 }} stroke="#000000" />
                          <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#000000", color: "#000000", fontSize: 11, fontFamily: "monospace" }} />
                          <Legend wrapperStyle={{ fontSize: 10, fill: "#000000" }} />
                          <Area type="monotone" dataKey={yAxisKey} stroke={activeColors[0]} fill={activeColors[0]} fillOpacity={0.3} strokeWidth={2} />
                        </AreaChart>
                      ) : (
                        <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <Pie
                            data={chartData}
                            dataKey={yAxisKey}
                            nameKey={xAxisKey}
                            cx="50%"
                            cy="50%"
                            outerRadius={85}
                            labelLine={true}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={activeColors[index % activeColors.length]} stroke="#ffffff" strokeWidth={1} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#000000", color: "#000000", fontSize: 11, fontFamily: "monospace" }} />
                          <Legend wrapperStyle={{ fontSize: 10, fill: "#000000" }} />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            {chartData.length > 0 && (
              <div className="bg-card p-3 border-t border-foreground/10 flex gap-2 justify-end select-none">
                <button
                  onClick={handleCopyCleanJSON}
                  className="bg-card border border-foreground/15 text-foreground px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-foreground/5 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  Copy JSON Bersih
                </button>
                
                <button
                  onClick={handleExportPNG}
                  className="bg-foreground text-background px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-foreground/90 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={12} />
                  Unduh PNG
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
