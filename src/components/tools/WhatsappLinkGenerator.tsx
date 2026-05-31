import { useState, useEffect } from "react";
import QRCode from "qrcode";

export function WhatsappLinkGenerator() {
  const [countryCode, setCountryCode] = useState("62");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate WhatsApp links
  const generateLink = () => {
    // Strip non-numbers from the telephone input
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    
    // Remove leading '0' or country code if already prefixed
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

  const copyToClipboard = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings Panel */}
      <div className="lg:col-span-1 space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Pengaturan Pesan</h3>

        <div className="space-y-4">
          {/* Country Code & Phone Number */}
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
                <option value="61">+61 (AU)</option>
                <option value="81">+81 (JP)</option>
              </select>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="8123456789"
                className="flex-1 h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              />
            </div>
          </div>

          {/* Pre-filled message */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Pesan Template (Opsional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Halo, saya tertarik dengan produk Anda..."
              rows={4}
              className="w-full p-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
            />
          </div>
        </div>
      </div>

      {/* Preview & Output Panel */}
      <div className="lg:col-span-2 space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Hasil Link & QR Code</h3>

          {!phoneNumber ? (
            <div className="bg-foreground/5 border border-foreground/10 text-foreground/60 p-8 rounded-xl text-center flex flex-col items-center justify-center min-h-[250px]">
              <span className="text-2xl mb-2">💬</span>
              <p className="text-sm">Masukkan nomor HP WhatsApp di samping untuk meng-generate link & QR Code.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Generated Link Box */}
              <div className="bg-background border border-foreground/10 rounded-lg p-4 flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-foreground/50 block">LINK WHATSAPP</span>
                  <p className="text-sm font-mono truncate text-primary font-bold">{link}</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-foreground text-background rounded-lg font-bold text-xs uppercase tracking-wider whitespace-nowrap hover:bg-foreground/90 transition-colors"
                >
                  {copiedLink ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* QR Code Container */}
              <div className="bg-white border border-foreground/10 rounded-xl p-6 flex flex-col items-center justify-center">
                {qrCodeUrl && (
                  <div className="p-3 bg-white border border-foreground/5 rounded-lg shadow-sm">
                    <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-40 h-40" />
                  </div>
                )}
                <p className="text-xs text-foreground/50 mt-3 text-center">Scan QR code ini untuk membuka obrolan langsung di HP.</p>
              </div>
            </div>
          )}
        </div>

        {phoneNumber && link && (
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-foreground/10">
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center h-12 bg-primary text-white rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-primary/95 transition-colors"
            >
              Test Kirim Pesan
            </a>
            {qrCodeUrl && (
              <a
                href={qrCodeUrl}
                download="whatsapp-qr.png"
                className="flex-1 flex items-center justify-center h-12 bg-background border-2 border-foreground text-foreground rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/5 transition-colors"
              >
                Download QR Code
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
