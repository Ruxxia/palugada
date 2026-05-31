import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrGenerator() {
  const [text, setText] = useState("https://palugada.sqwerly.com");
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!text) {
      setDataUrl("");
      return;
    }
    QRCode.toDataURL(text, { width: 512, margin: 2, color: { dark: "#1a1a1a", light: "#fdfcfb" } })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [text]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2 block">URL atau Teks</label>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-4 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary"
        />
      </div>
      {dataUrl && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="p-4 bg-card border-2 border-foreground rounded-xl shadow-tactile">
            <img src={dataUrl} alt="QR Code" className="w-64 h-64" />
          </div>
          <a
            href={dataUrl}
            download="qrcode.png"
            className="bg-foreground text-background px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider"
          >
            Download PNG
          </a>
        </div>
      )}
    </div>
  );
}
