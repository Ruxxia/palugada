import { useState, useEffect } from "react";
import QRCode from "qrcode";

export function WhatsappQrGenerator() {
  const [countryCode, setCountryCode] = useState("62");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const generateLink = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith("0")) {
      formattedPhone = formattedPhone.substring(1);
    }
    
    const prefix = countryCode;
    if (formattedPhone.startsWith(prefix)) {
      formattedPhone = formattedPhone.substring(prefix.length);
    }
    
    const finalNumber = prefix + formattedPhone;
    if (!cleanPhone) return "";
    
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${finalNumber}${encodedMessage ? `?text=${encodedMessage}` : ""}`;
  };

  useEffect(() => {
    const generated = generateLink();
    setLink(generated);

    if (generated) {
      QRCode.toDataURL(generated, { width: 512, margin: 2, color: { dark: "#000000", light: "#ffffff" } })
        .then(setQrCodeUrl)
        .catch(() => setQrCodeUrl(""));
    } else {
      setQrCodeUrl("");
    }
  }, [countryCode, phoneNumber, message]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Configuration */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Pengaturan QR Code</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Nomor WhatsApp</label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-24 h-11 px-3 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              >
                <option value="62">+62 (ID)</option>
                <option value="1">+1 (US)</option>
                <option value="44">+44 (UK)</option>
                <option value="65">+65 (SG)</option>
                <option value="60">+60 (MY)</option>
                <option value="81">+81 (JP)</option>
              </select>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="8123456789"
                className="flex-1 min-w-0 h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Pesan Template</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Halo, saya mau tanya..."
              rows={4}
              className="w-full p-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
            />
          </div>
        </div>
      </div>

      {/* QR Output */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between min-h-[300px]">
        <div className="flex flex-col items-center justify-center flex-1">
          {!phoneNumber ? (
            <div className="text-center p-8 text-foreground/50">
              <span className="text-3xl block mb-2">📸</span>
              <p className="text-sm">Masukkan nomor WhatsApp untuk membuat QR Code.</p>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col items-center w-full">
              {qrCodeUrl && (
                <div className="p-4 bg-white border border-foreground/10 rounded-2xl shadow-md">
                  <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-48 h-48" />
                </div>
              )}
              <p className="text-xs text-foreground/50 text-center">Scan QR code ini untuk memulai obrolan WhatsApp secara langsung.</p>
            </div>
          )}
        </div>

        {phoneNumber && qrCodeUrl && (
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-foreground/10">
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center h-12 bg-primary text-white rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-primary/95 transition-colors"
            >
              Test Link
            </a>
            <a
              href={qrCodeUrl}
              download="whatsapp-qr.png"
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
