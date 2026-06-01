import { useState, useRef, useEffect } from "react";

interface MemeTemplate {
  id: string;
  name: string;
  description: string;
  fields: { name: string; label: string; default: string; type?: "text" | "select"; options?: string[] }[];
}

const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: "yura",
    name: "Nggak Bisa Yura 💔",
    description: "Trend curhat 'Nggak bisa Yura...' kepada penyanyi Yura Yunita.",
    fields: [
      { name: "yuraText", label: "Alasan Kegagalan / Curhat", default: "dia maunya sama yang seagama, tapi agamanya dia uang" }
    ]
  },
  {
    id: "akreditasi",
    name: "Sertifikat Akreditasi 📜",
    description: "Sertifikat Akreditasi BAN-PT Plesetan (e.g. Beban Keluarga).",
    fields: [
      { name: "nama", label: "Nama Penerima", default: "Budi Setiawan" },
      { name: "predikat", label: "Peringkat / Nilai", default: "BEBAN KELUARGA" },
      { name: "kategori", label: "Nilai Akreditasi", default: "UNGGUL (A+)" },
      { name: "penandatangan", label: "Penandatangan", default: "Ketua Dewan Kegabutan Nasional" }
    ]
  },
  {
    id: "ktp",
    name: "KTP Plesetan 🪪",
    description: "KTP Republik Gabut dengan jabatan & status kustom.",
    fields: [
      { name: "nik", label: "NIK (Nomor Induk)", default: "3171010000260007" },
      { name: "nama", label: "Nama", default: "Agus Kopling" },
      { name: "pekerjaan", label: "Pekerjaan", default: "Pencari Wifi Gratisan" },
      { name: "status", label: "Status Kawin", default: "Belum Ditembak" },
      { name: "berlaku", label: "Berlaku Hingga", default: "Kiamat Kurang 3 Hari" }
    ]
  },
  {
    id: "classic",
    name: "Classic Top/Bottom Meme 🖼️",
    description: "Upload gambar kustom dengan teks atas dan bawah ala meme 2012-an.",
    fields: [
      { name: "topText", label: "Teks Atas", default: "BILA JALAN MULUS" },
      { name: "bottomText", label: "Teks Bawah", default: "ITU ADALAH JALAN TOL" }
    ]
  }
];

export function IndonesianMemeGenerator() {
  const [activeTemplate, setActiveTemplate] = useState("yura");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [deepFry, setDeepFry] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templateObj = MEME_TEMPLATES.find((t) => t.id === activeTemplate)!;

  // Initialize defaults when template changes
  useEffect(() => {
    const defaults: Record<string, string> = {};
    templateObj.fields.forEach((f) => {
      defaults[f.name] = f.default;
    });
    setFieldValues(defaults);
  }, [activeTemplate]);

  // Handle value change
  const handleValChange = (fieldName: string, val: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldName]: val }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Draw Meme
  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset canvas dimensions to standard square/card
    let width = 600;
    let height = 600;

    if (activeTemplate === "ktp") {
      width = 850;
      height = 540; // Credit card size ratio
    }

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    if (activeTemplate === "yura") {
      // Background Black
      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(0, 0, width, height);

      // Draw uploaded photo or a default heart placeholder
      if (uploadedImage) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(300, 200, 100, 0, Math.PI * 2);
        ctx.clip();
        const scale = Math.max(200 / uploadedImage.width, 200 / uploadedImage.height);
        const x = 300 - (uploadedImage.width * scale) / 2;
        const y = 200 - (uploadedImage.height * scale) / 2;
        ctx.drawImage(uploadedImage, x, y, uploadedImage.width * scale, uploadedImage.height * scale);
        ctx.restore();
      } else {
        // Draw heart emoji/placeholder
        ctx.font = "80px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("💔", 300, 200);
      }

      // Title
      ctx.font = "italic bold 32px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("Nggak bisa Yura...", 300, 360);

      // Paragraph / Curhat Text
      const curhat = fieldValues["yuraText"] || "";
      ctx.font = "24px sans-serif";
      ctx.fillStyle = "#a3a3a3";
      
      // Wrap paragraph text
      wrapText(ctx, curhat, 300, 420, 500, 34);

    } else if (activeTemplate === "akreditasi") {
      // Gradient background (gold border feel)
      ctx.fillStyle = "#fcf9f2";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#c5a880";
      ctx.lineWidth = 15;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      ctx.strokeStyle = "#806843";
      ctx.lineWidth = 2;
      ctx.strokeRect(32, 32, width - 64, height - 64);

      // Certificate Header
      ctx.font = "bold 26px serif";
      ctx.fillStyle = "#806843";
      ctx.textAlign = "center";
      ctx.fillText("SERTIFIKAT AKREDITASI", 300, 90);

      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#5c5c5c";
      ctx.fillText("Badan Akreditasi Kegabutan Nasional (BAKN) menyatakan bahwa:", 300, 130);

      // Recipient Name
      ctx.font = "italic bold 28px serif";
      ctx.fillStyle = "#000000";
      ctx.fillText(fieldValues["nama"] || "", 300, 190);

      ctx.beginPath();
      ctx.moveTo(150, 205);
      ctx.lineTo(450, 205);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#5c5c5c";
      ctx.fillText("Ditetapkan dan dinilai layak menyandang peringkat:", 300, 240);

      // Rating Label
      ctx.font = "bold 32px sans-serif";
      ctx.fillStyle = "#b45309"; // brown-amber
      ctx.fillText(fieldValues["predikat"] || "", 300, 290);

      // Sub-Akreditasi
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = "#1e293b";
      ctx.fillText(`Dengan Akreditasi: ${fieldValues["kategori"] || ""}`, 300, 345);

      // Footer
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText("Keputusan ini berlaku selamanya selama masih gabut.", 300, 390);

      // Signature
      ctx.font = "italic 16px serif";
      ctx.fillStyle = "#000000";
      ctx.fillText(fieldValues["penandatangan"] || "", 300, 480);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#5c5c5c";
      ctx.fillText("Ketua Umum", 300, 500);

    } else if (activeTemplate === "ktp") {
      // Blue Card Background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#a5f3fc");
      grad.addColorStop(0.5, "#38bdf8");
      grad.addColorStop(1, "#0284c7");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Header Text
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PROVINSI REPUBLIK GABUT INDONESIA", width / 2, 45);

      ctx.font = "bold 16px sans-serif";
      ctx.fillText("KARTU TANDA PENDUDUK GABUT", width / 2, 70);

      // NIK
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`NIK : ${fieldValues["nik"] || ""}`, 40, 125);

      // Form Fields
      const details = [
        { label: "Nama", value: fieldValues["nama"] },
        { label: "Pekerjaan", value: fieldValues["pekerjaan"] },
        { label: "Status Kawin", value: fieldValues["status"] },
        { label: "Gol. Darah", value: "O (Ogah Pusing)" },
        { label: "Kewarganegaraan", value: "WNI (Warga Netizen Indo)" },
        { label: "Berlaku Hingga", value: fieldValues["berlaku"] }
      ];

      ctx.font = "bold 16px sans-serif";
      let startY = 175;
      details.forEach((item) => {
        ctx.fillStyle = "#0f172a";
        ctx.fillText(item.label, 40, startY);
        ctx.fillText(":", 220, startY);
        ctx.fillStyle = "#1e293b";
        ctx.fillText(item.value || "", 240, startY);
        startY += 42;
      });

      // Photo Frame on Right
      const photoX = 600;
      const photoY = 130;
      const photoW = 200;
      const photoH = 260;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(photoX, photoY, photoW, photoH);
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 4;
      ctx.strokeRect(photoX, photoY, photoW, photoH);

      if (uploadedImage) {
        const scale = Math.max(photoW / uploadedImage.width, photoH / uploadedImage.height);
        const x = photoX + (photoW - uploadedImage.width * scale) / 2;
        const y = photoY + (photoH - uploadedImage.height * scale) / 2;
        ctx.save();
        ctx.rect(photoX + 2, photoY + 2, photoW - 4, photoH - 4);
        ctx.clip();
        ctx.drawImage(uploadedImage, x, y, uploadedImage.width * scale, uploadedImage.height * scale);
        ctx.restore();
      } else {
        // Red background with silhouette placeholder
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(photoX + 4, photoY + 4, photoW - 8, photoH - 8);
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Upload Foto Anda", photoX + 100, photoY + 130);
      }

      // Stamp/Tanda tangan
      ctx.fillStyle = "#1e293b";
      ctx.font = "italic 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Ttd Kepala Seksi Gabut", photoX + 100, 440);
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("Jakarta, INDONESIA", photoX + 100, 460);

    } else if (activeTemplate === "classic") {
      // Classic layout
      if (uploadedImage) {
        const scale = Math.max(width / uploadedImage.width, height / uploadedImage.height);
        const x = (width - uploadedImage.width * scale) / 2;
        const y = (height - uploadedImage.height * scale) / 2;
        ctx.drawImage(uploadedImage, x, y, uploadedImage.width * scale, uploadedImage.height * scale);
      } else {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Silahkan Upload Gambar Anda", 300, 300);
      }

      // Meme Font configurations
      ctx.font = "bold 52px Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 6;

      const top = fieldValues["topText"] || "";
      const bottom = fieldValues["bottomText"] || "";

      if (top) {
        ctx.strokeText(top.toUpperCase(), 300, 70);
        ctx.fillText(top.toUpperCase(), 300, 70);
      }

      if (bottom) {
        ctx.strokeText(bottom.toUpperCase(), 300, 540);
        ctx.fillText(bottom.toUpperCase(), 300, 540);
      }
    }

    // Apply Deep Fry filter if enabled
    if (deepFry) {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Boost contrast and saturation drastically
        let r = data[i];
        let g = data[i+1];
        let b = data[i+2];

        // Deep fry contrast math
        r = r > 128 ? Math.min(255, r * 1.5) : r * 0.7;
        g = g > 128 ? Math.min(255, g * 1.5) : g * 0.7;
        b = b > 128 ? Math.min(255, b * 1.5) : b * 0.7;

        // Add some noise
        const noise = (Math.random() - 0.5) * 30;
        data[i] = Math.min(255, Math.max(0, r + noise));
        data[i+1] = Math.min(255, Math.max(0, g + noise));
        data[i+2] = Math.min(255, Math.max(0, b + noise));
      }
      ctx.putImageData(imgData, 0, 0);
    }

    ctx.restore();
    setDownloadUrl(canvas.toDataURL("image/png"));
  };

  // Wrap text function for Yura layout
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  useEffect(() => {
    drawMeme();
  }, [activeTemplate, fieldValues, uploadedImage, deepFry]);

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Settings / Controls */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block mb-2">Pilih Template Meme</label>
          <div className="grid grid-cols-2 gap-2">
            {MEME_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTemplate(t.id);
                  setUploadedImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeTemplate === t.id
                    ? "border-primary bg-primary/5 text-primary font-bold"
                    : "border-foreground/10 hover:border-foreground/20 text-foreground"
                }`}
              >
                <span className="block text-sm">{t.name}</span>
                <span className="text-[10px] text-foreground/50 block mt-1 font-normal leading-normal">{t.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Fields */}
        <div className="space-y-4 pt-4 border-t border-foreground/10">
          <h4 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Edit Tulisan Meme</h4>
          {templateObj.fields.map((field) => (
            <div key={field.name} className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/60">{field.label}</label>
              <input
                type="text"
                value={fieldValues[field.name] || ""}
                onChange={(e) => handleValChange(field.name, e.target.value)}
                className="w-full h-10 px-3 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-medium"
              />
            </div>
          ))}
        </div>

        {/* Upload Custom Image */}
        <div className="space-y-2 pt-4 border-t border-foreground/10">
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Tambahkan Gambar Kustom / Foto Anda</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              onClick={triggerUpload}
              className="flex-1 h-10 bg-foreground text-background rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              {uploadedImage ? "Ganti Gambar" : "Upload Gambar"}
            </button>
            {uploadedImage && (
              <button
                onClick={() => setUploadedImage(null)}
                className="px-4 h-10 border border-red-500/20 text-red-500 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-red-500/5 transition-colors"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 pt-4 border-t border-foreground/10">
          <input
            type="checkbox"
            id="deep-fry"
            checked={deepFry}
            onChange={(e) => setDeepFry(e.target.checked)}
            className="w-4 h-4 accent-primary rounded cursor-pointer"
          />
          <label htmlFor="deep-fry" className="text-xs font-mono uppercase tracking-wider text-foreground/75 cursor-pointer flex items-center gap-1">
            🔥 Filter Deep Fry (Trend Meme Rusak/Gore)
          </label>
        </div>
      </div>

      {/* Preview & Canvas */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between min-h-[450px]">
        <div className="flex flex-col items-center justify-center flex-1">
          {/* Main Drawing Canvas (hidden / scaled) */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />

          {/* Interactive display canvas placeholder */}
          <div className={`relative border border-foreground/10 rounded-xl shadow-lg overflow-hidden flex items-center justify-center bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] [background-size:16px_16px] ${
            activeTemplate === "ktp" ? "w-full max-w-[420px] aspect-[85/54]" : "w-64 h-64"
          }`}>
            {downloadUrl ? (
              <img
                src={downloadUrl}
                alt="Meme Preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-4 text-foreground/40">
                <span className="text-3xl block mb-2">🖼️</span>
                <p className="text-xs">Preview meme akan tampil di sini.</p>
              </div>
            )}
          </div>
        </div>

        {downloadUrl && (
          <div className="pt-6 border-t border-foreground/10">
            <a
              href={downloadUrl}
              download={`meme-netizen-${activeTemplate}.png`}
              className="w-full flex items-center justify-center h-12 bg-primary text-white rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-primary/95 transition-colors"
            >
              Unduh Gambar Meme (PNG)
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
