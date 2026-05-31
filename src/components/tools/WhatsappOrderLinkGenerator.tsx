import { useState, useEffect } from "react";

export function WhatsappOrderLinkGenerator() {
  const [countryCode, setCountryCode] = useState("62");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState("Transfer Bank");

  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Compile order template
    const formattedPrice = price 
      ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(parseInt(price.replace(/\D/g, "")) || 0)
      : "";

    const template = `FORMAT PEMESANAN
---------------------------
Nama Lengkap : 
Nomor Telepon : 
Alamat Lengkap : 

DETAIL PESANAN
---------------------------
Nama Produk : ${productName}
Harga : ${formattedPrice}
Jumlah : ${qty} pcs
Total : ${price ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format((parseInt(price.replace(/\D/g, "")) || 0) * qty) : ""}
Metode Pembayaran : ${payment}

Mohon bantu proses pesanan saya di atas. Terima kasih!`;

    setMessage(template);

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

    if (cleanPhone) {
      setLink(`https://wa.me/${finalNumber}?text=${encodeURIComponent(template)}`);
    } else {
      setLink("");
    }
  }, [countryCode, phoneNumber, productName, price, qty, payment]);

  const copyToClipboard = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Configure Order */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Detail Form Order</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Nomor WhatsApp Penerima</label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block mb-1">Nama Produk</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Sepatu Sneakers"
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block mb-1">Harga Satuan</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 150000"
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block mb-1">Jumlah (Qty)</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block mb-1">Metode Pembayaran</label>
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="w-full h-11 px-3 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              >
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="COD (Bayar di Tempat)">COD (Bayar di Tempat)</option>
                <option value="E-Wallet (OVO/Dana/Gopay)">E-Wallet (OVO/Dana/Gopay)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Output preview */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between min-h-[300px]">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Preview Format Chat</h3>

          <div className="bg-background border border-foreground/10 rounded-lg p-4 font-mono text-xs whitespace-pre-wrap select-none leading-relaxed text-foreground/75">
            {message}
          </div>
        </div>

        {phoneNumber && link && (
          <div className="space-y-4 pt-4 border-t border-foreground/10">
            <div className="bg-background border border-foreground/10 rounded-lg p-3 flex justify-between items-center gap-3">
              <span className="text-[10px] font-mono text-foreground/45 uppercase truncate flex-1">{link}</span>
              <button
                onClick={copyToClipboard}
                className="px-3.5 py-1.5 bg-foreground text-background text-xs font-bold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                {copiedLink ? "Copied! ✓" : "Copy Link"}
              </button>
            </div>
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center h-12 bg-primary text-white rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-primary/95 transition-colors"
            >
              Test Kirim Order
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
