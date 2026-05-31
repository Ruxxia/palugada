import { useState } from "react";

export function ThrCalculator() {
  const [gaji, setGaji] = useState<number>(5000000);
  const [tunjangan, setTunjangan] = useState<number>(500000);
  const [masaKerja, setMasaKerja] = useState<number>(12);
  const [thrResult, setThrResult] = useState<number | null>(null);
  const [detail, setDetail] = useState<string>("");

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const hitungTHR = () => {
    const totalGaji = gaji + tunjangan;
    let thr = 0;

    if (masaKerja >= 12) {
      thr = totalGaji;
      setDetail(
        `Karena masa kerja Anda sudah ${masaKerja} bulan (>= 12 bulan), Anda berhak menerima THR penuh sebesar 1x upah (Gaji Pokok + Tunjangan Tetap).`
      );
    } else if (masaKerja >= 1) {
      thr = (masaKerja / 12) * totalGaji;
      setDetail(
        `Masa kerja Anda ${masaKerja} bulan. Perhitungan THR proporsional: (${masaKerja} / 12) x ${formatRupiah(
          totalGaji
        )}`
      );
    } else {
      thr = 0;
      setDetail(
        "Masa kerja kurang dari 1 bulan. Sesuai Permenaker No. 6/2016, pekerja dengan masa kerja kurang dari 1 bulan belum berhak menerima THR."
      );
    }

    setThrResult(Math.round(thr));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Input */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-lg font-bold">Input Data THR</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Gaji Pokok Bulanan (Rp)</label>
          <input
            type="number"
            value={gaji}
            onChange={(e) => setGaji(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono"
            placeholder="Contoh: 5000000"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tunjangan Tetap Bulanan (Rp)</label>
          <input
            type="number"
            value={tunjangan}
            onChange={(e) => setTunjangan(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono"
            placeholder="Tunjangan jabatan, transport tetap, dll"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Masa Kerja (Bulan)</label>
            <span className="font-mono font-bold text-primary">{masaKerja} Bulan</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            value={masaKerja}
            onChange={(e) => setMasaKerja(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-foreground/45 font-mono">
            <span>0 Bln</span>
            <span>12 Bln (Penuh)</span>
            <span>5 Tahun (60 Bln)</span>
          </div>
        </div>

        <button
          onClick={hitungTHR}
          className="w-full bg-foreground text-background h-12 rounded-lg font-bold hover:bg-foreground/90 transition-colors uppercase tracking-wider text-sm"
        >
          Hitung THR
        </button>
      </div>

      {/* Output Rincian */}
      <div className="space-y-6">
        <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-xl h-full flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Estimasi THR Diterima</h3>
            {thrResult !== null ? (
              <div className="space-y-4">
                <div className="text-4xl md:text-5xl font-display text-primary font-black">
                  {formatRupiah(thrResult)}
                </div>
                <div className="bg-background border border-foreground/10 p-4 rounded-lg text-sm leading-relaxed text-pretty">
                  {detail}
                </div>
              </div>
            ) : (
              <div className="text-foreground/40 text-sm py-12 text-center">
                Silakan isi data di sebelah kiri dan klik tombol "Hitung THR".
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-foreground/10 text-xs text-foreground/50 space-y-2 leading-relaxed">
            <p className="font-bold">Ketentuan Regulasi THR (Permenaker No. 6/2016):</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Masa kerja ≥ 12 bulan berturut-turut berhak atas THR penuh (1 bulan upah).</li>
              <li>Masa kerja 1 s.d. 12 bulan berhak atas THR proporsional: <code className="font-mono">(Masa Kerja / 12) * Upah Sebulan</code>.</li>
              <li>Komponen upah bulanan adalah Gaji Pokok + Tunjangan Tetap.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
