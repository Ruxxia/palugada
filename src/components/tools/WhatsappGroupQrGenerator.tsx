import { useState, useEffect } from "react";
import QRCode from "qrcode";

export function WhatsappGroupQrGenerator() {
  const [groupLink, setGroupLink] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Regex validation for WhatsApp group invite links
    const regex = /^(https?:\/\/)?(chat\.whatsapp\.com\/[a-zA-Z0-9]{20,24})$/;
    const valid = regex.test(groupLink.trim());
    setIsValid(valid);

    if (groupLink.trim() && (valid || groupLink.includes("chat.whatsapp.com/"))) {
      QRCode.toDataURL(groupLink.trim(), { width: 512, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
        .then(setQrCodeUrl)
        .catch(() => setQrCodeUrl(""));
    } else {
      setQrCodeUrl("");
    }
  }, [groupLink]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Group */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">WhatsApp Group Link</h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block mb-2">
              Link Undangan Grup WhatsApp
            </label>
            <input
              type="url"
              value={groupLink}
              onChange={(e) => setGroupLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/L1nKUnDaNgAnGrUpWa"
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-mono"
            />
            {groupLink && !isValid && (
              <span className="text-[11px] text-red-500 mt-1 block">
                Format link kurang valid. Pastikan link diawali dengan chat.whatsapp.com/
              </span>
            )}
          </div>

          <div className="p-4 bg-foreground/5 rounded-lg border border-foreground/5">
            <span className="block text-xs font-bold mb-1">Cara mendapatkan Link Grup:</span>
            <ol className="text-xs text-foreground/75 list-decimal pl-4 space-y-1">
              <li>Buka grup WhatsApp Anda di aplikasi HP.</li>
              <li>Ketuk nama grup untuk masuk ke Detail Info Grup.</li>
              <li>Ketuk menu <strong>"Undang via tautan"</strong> (Invite via link).</li>
              <li>Salin tautan tersebut lalu tempel (paste) di kolom input di atas.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between min-h-[300px]">
        <div className="flex flex-col items-center justify-center flex-1">
          {!groupLink ? (
            <div className="text-center p-8 text-foreground/50">
              <span className="text-3xl block mb-2">👥</span>
              <p className="text-sm">Tempel link grup WhatsApp Anda untuk membuat QR Code.</p>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col items-center w-full">
              {qrCodeUrl && (
                <div className="p-4 bg-white border border-foreground/10 rounded-2xl shadow-md">
                  <img src={qrCodeUrl} alt="WhatsApp Group QR Code" className="w-48 h-48" />
                </div>
              )}
              <p className="text-xs text-foreground/50 text-center">
                Scan QR Code ini untuk otomatis bergabung ke dalam grup WhatsApp Anda.
              </p>
            </div>
          )}
        </div>

        {groupLink && qrCodeUrl && (
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-foreground/10">
            <a
              href={groupLink}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center h-12 bg-primary text-white rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-primary/95 transition-colors"
            >
              Gabung Grup
            </a>
            <a
              href={qrCodeUrl}
              download="whatsapp-group-qr.png"
              className="flex-1 flex items-center justify-center h-12 bg-background border-2 border-foreground text-foreground rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/5 transition-colors"
            >
              Download QR PNG
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
