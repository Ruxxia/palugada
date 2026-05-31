import { useState } from "react";

interface PTKP {
  status: string;
  nominal: number;
}

const ptkpList: PTKP[] = [
  { status: "TK/0", nominal: 54000000 },
  { status: "TK/1", nominal: 58500000 },
  { status: "TK/2", nominal: 63000000 },
  { status: "TK/3", nominal: 67500000 },
  { status: "K/0", nominal: 58500000 },
  { status: "K/1", nominal: 63000000 },
  { status: "K/2", nominal: 67500000 },
  { status: "K/3", nominal: 72000000 },
];

export function GajiBersihCalculator() {
  const [gaji, setGaji] = useState<number>(8000000);
  const [tunjangan, setTunjangan] = useState<number>(1000000);
  const [lembur, setLembur] = useState<number>(500000);
  const [ptkpIndex, setPtkpIndex] = useState<number>(0);
  const [hasNpwp, setHasNpwp] = useState<boolean>(true);
  const [potonganLain, setPotonganLain] = useState<number>(0);

  // Results state
  const [calculated, setCalculated] = useState<boolean>(false);
  const [totalPenerimaan, setTotalPenerimaan] = useState(0);
  const [bpjsKes, setBpjsKes] = useState(0);
  const [bpjsJht, setBpjsJht] = useState(0);
  const [bpjsJp, setBpjsJp] = useState(0);
  const [pph21Calculated, setPph21Calculated] = useState(0);
  const [totalPotongan, setTotalPotongan] = useState(0);
  const [gajiBersih, setGajiBersih] = useState(0);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const hitungGajiBersih = () => {
    const penerimaan = gaji + tunjangan + lembur;

    // BPJS Kesehatan: 1% karyawan, batas maksimal upah Rp 12.000.000
    const bpjsKesVal = Math.min(gaji + tunjangan, 12000000) * 0.01;

    // BPJS JHT: 2% karyawan dari gaji pokok + tunjangan tetap (kita gunakan gaji pokok)
    const bpjsJhtVal = gaji * 0.02;

    // BPJS JP: 1% karyawan, batas maksimal upah Rp 10.061.300
    const bpjsJpVal = Math.min(gaji, 10061300) * 0.01;

    // Hitung PPh 21 Bulanan secara internal
    const brutoBln = gaji + tunjangan + lembur;
    const brutoThn = brutoBln * 12;
    const biayaJabatanBln = Math.min(500000, brutoBln * 0.05);
    const biayaJabatanThn = biayaJabatanBln * 12;
    const jhtJpBln = bpjsJhtVal + bpjsJpVal;
    const jhtJpThn = jhtJpBln * 12;

    const nettoThn = Math.max(0, brutoThn - (biayaJabatanThn + jhtJpThn));
    const ptkp = ptkpList[ptkpIndex].nominal;
    const pkp = Math.floor(Math.max(0, nettoThn - ptkp) / 1000) * 1000;

    let pphThn = 0;
    let sisaPkp = pkp;

    if (sisaPkp > 0) {
      const p1 = Math.min(60000000, sisaPkp);
      pphThn += p1 * 0.05;
      sisaPkp -= p1;
    }
    if (sisaPkp > 0) {
      const p2 = Math.min(190000000, sisaPkp);
      pphThn += p2 * 0.15;
      sisaPkp -= p2;
    }
    if (sisaPkp > 0) {
      const p3 = Math.min(250000000, sisaPkp);
      pphThn += p3 * 0.25;
      sisaPkp -= p3;
    }
    if (sisaPkp > 0) {
      const p4 = Math.min(4500000000, sisaPkp);
      pphThn += p4 * 0.30;
      sisaPkp -= p4;
    }
    if (sisaPkp > 0) {
      pphThn += sisaPkp * 0.35;
    }

    if (!hasNpwp) {
      pphThn = pphThn * 1.2;
    }

    const pphBln = pphThn / 12;

    // Totals
    const totalPot = bpjsKesVal + bpjsJhtVal + bpjsJpVal + pphBln + potonganLain;
    const bersih = Math.max(0, penerimaan - totalPot);

    setTotalPenerimaan(penerimaan);
    setBpjsKes(bpjsKesVal);
    setBpjsJht(bpjsJhtVal);
    setBpjsJp(bpjsJpVal);
    setPph21Calculated(Math.round(pphBln));
    setTotalPotongan(totalPot);
    setGajiBersih(Math.round(bersih));
    setCalculated(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Inputs */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-lg font-bold">Input Komponen Gaji</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Gaji Pokok (Rp)</label>
            <input
              type="number"
              value={gaji}
              onChange={(e) => setGaji(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tunjangan Tetap (Rp)</label>
            <input
              type="number"
              value={tunjangan}
              onChange={(e) => setTunjangan(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Lembur, Bonus & Komis (Rp)</label>
            <input
              type="number"
              value={lembur}
              onChange={(e) => setLembur(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Potongan Lainnya (Rp)</label>
            <input
              type="number"
              value={potonganLain}
              onChange={(e) => setPotonganLain(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
              placeholder="Contoh: pinjaman koperasi"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status PTKP Pajak</label>
            <select
              value={ptkpIndex}
              onChange={(e) => setPtkpIndex(Number(e.target.value))}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
            >
              {ptkpList.map((item, idx) => (
                <option key={idx} value={idx}>
                  {item.status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center mt-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasNpwp}
                onChange={(e) => setHasNpwp(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-foreground/20"
              />
              <span className="text-sm font-medium">Memiliki NPWP</span>
            </label>
          </div>
        </div>

        <button
          onClick={hitungGajiBersih}
          className="w-full bg-foreground text-background h-12 rounded-lg font-bold hover:bg-foreground/90 transition-colors uppercase tracking-wider text-sm"
        >
          Hitung Gaji Bersih
        </button>
      </div>

      {/* Outputs */}
      <div className="space-y-6">
        <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-xl h-full flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Gaji Bersih / Take Home Pay (THP)</h3>

            {calculated ? (
              <div className="space-y-6">
                <div className="bg-background border-2 border-primary/20 p-6 rounded-xl text-center">
                  <span className="text-xs text-foreground/45 block mb-1">Total Diterima Karyawan</span>
                  <span className="text-3xl md:text-4xl font-display font-black text-primary font-mono">{formatRupiah(gajiBersih)}</span>
                </div>

                <div className="grid grid-cols-2 gap-6 text-xs font-mono">
                  {/* Komponen Penerimaan */}
                  <div className="space-y-2 border-r border-foreground/10 pr-4">
                    <span className="font-bold text-foreground/70 uppercase">Penerimaan (+)</span>
                    <div className="flex justify-between">
                      <span>Gaji Pokok:</span>
                      <span>{formatRupiah(gaji)}</span>
                    </div>
                    {tunjangan > 0 && (
                      <div className="flex justify-between">
                        <span>Tunjangan:</span>
                        <span>{formatRupiah(tunjangan)}</span>
                      </div>
                    )}
                    {lembur > 0 && (
                      <div className="flex justify-between">
                        <span>Bonus/Lembur:</span>
                        <span>{formatRupiah(lembur)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-foreground/10 pt-1.5 mt-1">
                      <span>Total Bruto:</span>
                      <span>{formatRupiah(totalPenerimaan)}</span>
                    </div>
                  </div>

                  {/* Komponen Potongan */}
                  <div className="space-y-2">
                    <span className="font-bold text-red-500 uppercase">Potongan (-)</span>
                    <div className="flex justify-between text-red-400">
                      <span>BPJS Kes (1%):</span>
                      <span>{formatRupiah(bpjsKes)}</span>
                    </div>
                    <div className="flex justify-between text-red-400">
                      <span>BPJS JHT (2%):</span>
                      <span>{formatRupiah(bpjsJht)}</span>
                    </div>
                    <div className="flex justify-between text-red-400">
                      <span>BPJS JP (1%):</span>
                      <span>{formatRupiah(bpjsJp)}</span>
                    </div>
                    {pph21Calculated > 0 && (
                      <div className="flex justify-between text-red-400">
                        <span>PPh 21 Pajak:</span>
                        <span>{formatRupiah(pph21Calculated)}</span>
                      </div>
                    )}
                    {potonganLain > 0 && (
                      <div className="flex justify-between text-red-400">
                        <span>Lainnya:</span>
                        <span>{formatRupiah(potonganLain)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-foreground/10 pt-1.5 mt-1 text-red-500">
                      <span>Total Potongan:</span>
                      <span>{formatRupiah(totalPotongan)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-foreground/40 text-sm py-16 text-center">
                Silakan isi data gaji dan klik "Hitung Gaji Bersih".
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-foreground/10 text-[10px] text-foreground/45 leading-relaxed">
            <p className="font-bold">Informasi Mengenai Potongan BPJS Ketenagakerjaan & Kesehatan:</p>
            <p>• BPJS Kesehatan Karyawan = 1% dari Gaji Pokok + Tunjangan Tetap (Maks Rp 120.000).</p>
            <p>• Jaminan Hari Tua (JHT) Karyawan = 2% dari Gaji.</p>
            <p>• Jaminan Pensiun (JP) Karyawan = 1% dari Gaji (Maks Rp 100.613).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
