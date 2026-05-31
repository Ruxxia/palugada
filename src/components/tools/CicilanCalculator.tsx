import { useState } from "react";

interface ScheduleRow {
  bulan: number;
  angsuranPokok: number;
  angsuranBunga: number;
  totalAngsuran: number;
  sisaPinjaman: number;
}

export function CicilanCalculator() {
  const [plafond, setPlafond] = useState<number>(100000000); // 100 jt
  const [bungaTahun, setBungaTahun] = useState<number>(10); // 10%
  const [tenorBulan, setTenorBulan] = useState<number>(12); // 12 bulan
  const [tipeBunga, setTipeBunga] = useState<"flat" | "anuitas">("anuitas");

  const [calculated, setCalculated] = useState<boolean>(false);
  const [cicilanBulan, setCicilanBulan] = useState<number>(0);
  const [totalBunga, setTotalBunga] = useState<number>(0);
  const [totalBayar, setTotalBayar] = useState<number>(0);
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const hitungCicilan = () => {
    const i = bungaTahun / 100 / 12; // bunga bulanan
    const n = tenorBulan;
    const tempSchedule: ScheduleRow[] = [];

    let totalBungaVal = 0;
    let cicilanBulanVal = 0;

    if (tipeBunga === "flat") {
      const pokokPerBulan = plafond / n;
      const bungaPerBulan = plafond * i;
      cicilanBulanVal = pokokPerBulan + bungaPerBulan;
      totalBungaVal = bungaPerBulan * n;

      let sisa = plafond;
      for (let b = 1; b <= n; b++) {
        sisa -= pokokPerBulan;
        tempSchedule.push({
          bulan: b,
          angsuranPokok: Math.round(pokokPerBulan),
          angsuranBunga: Math.round(bungaPerBulan),
          totalAngsuran: Math.round(cicilanBulanVal),
          sisaPinjaman: Math.max(0, Math.round(sisa)),
        });
      }
    } else {
      // Anuitas
      cicilanBulanVal = (plafond * i) / (1 - Math.pow(1 + i, -n));
      let sisa = plafond;

      for (let b = 1; b <= n; b++) {
        const bungaBulan = sisa * i;
        const pokokBulan = cicilanBulanVal - bungaBulan;
        sisa -= pokokBulan;
        totalBungaVal += bungaBulan;

        tempSchedule.push({
          bulan: b,
          angsuranPokok: Math.round(pokokBulan),
          angsuranBunga: Math.round(bungaBulan),
          totalAngsuran: Math.round(cicilanBulanVal),
          sisaPinjaman: Math.max(0, Math.round(sisa)),
        });
      }
    }

    setCicilanBulan(Math.round(cicilanBulanVal));
    setTotalBunga(Math.round(totalBungaVal));
    setTotalBayar(Math.round(plafond + totalBungaVal));
    setSchedule(tempSchedule);
    setCalculated(true);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Inputs */}
        <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
          <h3 className="text-lg font-bold">Data Pinjaman</h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Jumlah Pinjaman (Plafond - Rp)</label>
            <input
              type="number"
              value={plafond}
              onChange={(e) => setPlafond(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bunga per Tahun (%)</label>
              <input
                type="number"
                step="0.1"
                value={bungaTahun}
                onChange={(e) => setBungaTahun(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tenor (Bulan)</label>
              <input
                type="number"
                value={tenorBulan}
                onChange={(e) => setTenorBulan(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium block mb-2">Tipe Suku Bunga</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTipeBunga("anuitas")}
                className={`flex-1 py-3 px-4 border rounded-lg text-sm font-bold transition-colors ${
                  tipeBunga === "anuitas"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background border-foreground/15 hover:bg-foreground/5"
                }`}
              >
                Efektif / Anuitas
              </button>
              <button
                type="button"
                onClick={() => setTipeBunga("flat")}
                className={`flex-1 py-3 px-4 border rounded-lg text-sm font-bold transition-colors ${
                  tipeBunga === "flat"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background border-foreground/15 hover:bg-foreground/5"
                }`}
              >
                Flat
              </button>
            </div>
          </div>

          <button
            onClick={hitungCicilan}
            className="w-full bg-foreground text-background h-12 rounded-lg font-bold hover:bg-foreground/90 transition-colors uppercase tracking-wider text-sm"
          >
            Hitung Simulasi Cicilan
          </button>
        </div>

        {/* Results Info */}
        <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Estimasi Pembayaran Bulanan</h3>

            {calculated ? (
              <div className="space-y-6">
                <div className="bg-background border-2 border-primary/20 p-6 rounded-xl text-center">
                  <span className="text-xs text-foreground/45 block mb-1">Angsuran per Bulan</span>
                  <span className="text-3xl md:text-4xl font-display font-black text-primary font-mono">{formatRupiah(cicilanBulan)}</span>
                </div>

                <div className="space-y-3 font-mono text-sm pt-4 border-t border-foreground/10">
                  <div className="flex justify-between">
                    <span>Pokok Pinjaman:</span>
                    <span>{formatRupiah(plafond)}</span>
                  </div>
                  <div className="flex justify-between text-primary">
                    <span>Total Bunga:</span>
                    <span>+{formatRupiah(totalBunga)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-foreground/10 pt-2 mt-2">
                    <span>Total Pengembalian:</span>
                    <span>{formatRupiah(totalBayar)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-foreground/40 text-sm py-16 text-center">
                Silakan isi formulir simulasi dan klik tombol "Hitung".
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-foreground/10 text-[10px] text-foreground/45 leading-relaxed">
            <p className="font-bold">Perbedaan Flat vs Efektif/Anuitas:</p>
            <p>• <strong>Flat:</strong> Porsi pokok dan bunga bulanan tetap dihitung dari nilai awal plafon pinjaman.</p>
            <p>• <strong>Anuitas (Efektif):</strong> Angsuran bulanan tetap, namun komposisi bunga berkurang seiring sisa pinjaman yang menyusut dan pokok meningkat.</p>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      {calculated && schedule.length > 0 && (
        <div className="bg-card border border-foreground/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full flex items-center justify-between p-6 font-bold hover:bg-foreground/5 transition-colors"
          >
            <span>📅 {showSchedule ? "Sembunyikan" : "Tampilkan"} Tabel Jadwal Angsuran (Amortisasi)</span>
            <span>{showSchedule ? "▲" : "▼"}</span>
          </button>

          {showSchedule && (
            <div className="overflow-x-auto border-t border-foreground/10 max-h-96">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-foreground/5 sticky top-0">
                  <tr>
                    <th className="p-3">Bulan ke</th>
                    <th className="p-3">Angsuran Pokok</th>
                    <th className="p-3">Angsuran Bunga</th>
                    <th className="p-3">Total Angsuran</th>
                    <th className="p-3">Sisa Pinjaman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {schedule.map((row) => (
                    <tr key={row.bulan} className="hover:bg-foreground/5">
                      <td className="p-3 font-bold">{row.bulan}</td>
                      <td className="p-3">{formatRupiah(row.angsuranPokok)}</td>
                      <td className="p-3 text-red-400">{formatRupiah(row.angsuranBunga)}</td>
                      <td className="p-3 text-primary font-bold">{formatRupiah(row.totalAngsuran)}</td>
                      <td className="p-3">{formatRupiah(row.sisaPinjaman)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
