import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function WifiQrGenerator() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [dataUrl, setDataUrl] = useState("");

  const generateWifiString = () => {
    // Escape SSID and Password characters: \, ;, , and : with a backslash
    const escapeVal = (val: string) => {
      return val.replace(/\\/g, "\\\\")
                .replace(/;/g, "\\;")
                .replace(/:/g, "\\:")
                .replace(/,/g, "\\,");
    };

    const escapedSsid = escapeVal(ssid);
    const escapedPassword = escapeVal(password);

    // WIFI:S:SSID;T:WPA;P:PASSWORD;H:true;;
    let wifiStr = `WIFI:S:${escapedSsid};`;
    if (encryption !== "nopass") {
      wifiStr += `T:${encryption};P:${escapedPassword};`;
    } else {
      wifiStr += `T:nopass;;`;
    }
    if (hidden) {
      wifiStr += `H:true;`;
    }
    wifiStr += ";";
    return wifiStr;
  };

  useEffect(() => {
    if (!ssid) {
      setDataUrl("");
      return;
    }
    const wifiString = generateWifiString();
    QRCode.toDataURL(wifiString, {
      width: 512,
      margin: 2,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [ssid, password, encryption, hidden, darkColor, lightColor]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings Panel */}
      <div className="lg:col-span-1 space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Pengaturan WiFi</h3>

        <div className="space-y-4">
          {/* SSID */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Nama WiFi (SSID)</label>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="e.g. My Home WiFi"
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            />
          </div>

          {/* Encryption Type */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Keamanan</label>
            <select
              value={encryption}
              onChange={(e) => setEncryption(e.target.value)}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            >
              <option value="WPA">WPA / WPA2 / WPA3</option>
              <option value="WEP">WEP</option>
              <option value="nopass">Tanpa Password (Terbuka)</option>
            </select>
          </div>

          {/* Password */}
          {encryption !== "nopass" && (
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password WiFi"
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
              />
            </div>
          )}

          {/* Hidden SSID */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="hiddenSsid"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
              className="w-4 h-4 text-primary border-foreground/15 rounded focus:ring-0 cursor-pointer"
            />
            <label htmlFor="hiddenSsid" className="text-xs font-mono uppercase tracking-wider text-foreground/70 cursor-pointer">
              SSID Tersembunyi (Hidden)
            </label>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-foreground/10">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Warna QR</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="w-8 h-8 rounded border border-foreground/10 cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono uppercase">{darkColor}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Warna Latar</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="w-8 h-8 rounded border border-foreground/10 cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono uppercase">{lightColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview & Output Panel */}
      <div className="lg:col-span-2 space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Preview QR Code WiFi</h3>

          {!ssid ? (
            <div className="bg-foreground/5 border border-foreground/10 text-foreground/60 p-8 rounded-xl text-center flex flex-col items-center justify-center min-h-[250px]">
              <span className="text-2xl mb-2">📡</span>
              <p className="text-sm">Masukkan Nama WiFi (SSID) untuk membuat QR Code secara instan.</p>
            </div>
          ) : (
            <div className="bg-white border border-foreground/10 rounded-xl p-8 flex flex-col items-center justify-center min-h-[250px]">
              {dataUrl && (
                <div className="p-4 bg-white border border-foreground/10 rounded-xl">
                  <img src={dataUrl} alt="WiFi QR Code" className="w-48 h-48" />
                </div>
              )}
              <div className="mt-4 text-center">
                <p className="font-mono text-sm font-bold text-black">{ssid}</p>
                <p className="text-xs text-foreground/50 mt-1">Scan QR code ini dengan kamera HP untuk otomatis connect.</p>
              </div>
            </div>
          )}
        </div>

        {ssid && dataUrl && (
          <div className="pt-6 border-t border-foreground/10">
            <a
              href={dataUrl}
              download={`wifi-qr-${ssid}.png`}
              className="flex items-center justify-center h-12 bg-foreground text-background rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
            >
              Download PNG
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
