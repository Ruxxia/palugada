import { useState } from "react";

interface PTKP {
  status: string;
  nominal: number;
}

const ptkpList: PTKP[] = [
  { status: "TK/0 (Tidak Kawin, 0 Tanggungan)", nominal: 54000000 },
  { status: "TK/1 (Tidak Kawin, 1 Tanggungan)", nominal: 58500000 },
  { status: "TK/2 (Tidak Kawin, 2 Tanggungan)", nominal: 63000000 },
  { status: "TK/3 (Tidak Kawin, 3 Tanggungan)", nominal: 67500000 },
  { status: "K/0 (Kawin, 0 Tanggungan)", nominal: 58500000 },
  { status: "K/1 (Kawin, 1 Tanggungan)", nominal: 63000000 },
  { status: "K/2 (Kawin, 2 Tanggungan)", nominal: 67500000 },
  { status: "K/3 (Kawin, 3 Tanggungan)", nominal: 72000000 },
];

export function Pph21Calculator() {
  const [gaji, setGaji] = useState<number>(10000000);
  const [tunjangan, setTunjangan] = useState<number>(1000000);
  const [hasNpwp, setHasNpwp] = useState<boolean>(true);
  const [ptkpIndex, setPtkpIndex] = useState<number>(0);
  const [customPotongan, setCustomPotongan] = useState<number>(0); // e.g. iuran pensiun mandiri

  // Calculations state
  const [calculated, setCalculated] = useState<boolean>(false);
  const [brutoBulanan, setBrutoBulanan] = useState(0);
  const [brutoTahunan, setBrutoTahunan] = useState(0);
  const [biayaJabatan, setBiayaJabatan] = useState(0);
  const [jhtJp, setJhtJp] = useState(0);
  const [nettoTahunan, setNettoTahunan] = useState(0);
  const [ptkpNominal, setPtkpNominal] = useState(0);
  const [pkp, setPkp] = useState(0);
  const [pphTahunan, setPphTahunan] = useState(0);
  const [pphBulanan, setPphBulanan] = useState(0);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const hitungPph = () => {
    const brutoBln = gaji + tunjangan;
    const brutoThn = brutoBln * 12;

    // Biaya jabatan: 5% dari bruto bulanan, maks Rp 500.000 per bulan
    const biayaJabatanBln = Math.min(500000, brutoBln * 0.05);
    const biayaJabatanThn = biayaJabatanBln * 12;

    // BPJS Ketenagakerjaan ditanggung Karyawan: JHT (2%) + JP (1%)
    // JP upah maksimal Rp 10.061.300 pada 2024
    const jpUpahMaks = 10061300;
    const jhtVal = gaji * 0.02;
    const jpVal = Math.min(gaji, jpUpahMaks) * 0.01;
    const jhtJpBln = jhtVal + jpVal;
    const jhtJpThn = jhtJpBln * 12;

    // Netto Setahun
    const pengurangTotalThn = biayaJabatanThn + jhtJpThn + (customPotongan * 12);
    const nettoThn = Math.max(0, brutoThn - pengurangTotalThn);

    // PTKP
    const ptkp = ptkpList[ptkpIndex].nominal;

    // PKP (Penghasilan Kena Pajak) - dibulatkan ke bawah per ribuan penuh sesuai UU Ketentuan Umum Perpajakan
    const pkpRaw = Math.max(0, nettoThn - ptkp);
    const pkpVal = Math.floor(pkpRaw / 1000) * 1000;

    // Hitung Tarif Progresif UU HPP
    let pphThn = 0;
    let sisaPkp = pkpVal;

    // Lapisan 1: 5% untuk 0 - 60jt
    if (sisaPkp > 0) {
      const p1 = Math.min(60000000, sisaPkp);
      pphThn += p1 * 0.05;
      sisaPkp -= p1;
    }
    // Lapisan 2: 15% untuk >60jt - 250jt
    if (sisaPkp > 0) {
      const p2 = Math.min(190000000, sisaPkp);
      pphThn += p2 * 0.15;
      sisaPkp -= p2;
    }
    // Lapisan 3: 25% untuk >250jt - 500jt
    if (sisaPkp > 0) {
      const p3 = Math.min(250000000, sisaPkp);
      pphThn += p3 * 0.25;
      sisaPkp -= p3;
    }
    // Lapisan 4: 30% untuk >500jt - 5miliar
    if (sisaPkp > 0) {
      const p4 = Math.min(4500000000, sisaPkp);
      pphThn += p4 * 0.30;
      sisaPkp -= p4;
    }
    // Lapisan 5: 35% untuk >5miliar
    if (sisaPkp > 0) {
      pphThn += sisaPkp * 0.35;
    }

    // Jika tidak punya NPWP, tarif 120%
    if (!hasNpwp) {
      pphThn = pphThn * 1.2;
    }

    const pphBln = pphThn / 12;

    setBrutoBulanan(brutoBln);
    setBrutoTahunan(brutoThn);
    setBiayaJabatan(biayaJabatanThn);
    setJhtJp(jhtJpThn);
    setNettoTahunan(nettoThn);
    setPtkpNominal(ptkp);
    setPkp(pkpVal);
    setPphTahunan(Math.round(pphThn));
    setPphBulanan(Math.round(pphBln));
    setCalculated(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Inputs */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-lg font-bold">Data Penghasilan Bulanan</h3>

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
            <label className="text-sm font-medium">Tunjangan & Bonus (Rp)</label>
            <input
              type="number"
              value={tunjangan}
              onChange={(e) => setTunjangan(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status PTKP (Penghasilan Tidak Kena Pajak)</label>
          <select
            value={ptkpIndex}
            onChange={(e) => setPtkpIndex(Number(e.target.value))}
            className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm"
          >
            {ptkpList.map((item, idx) => (
              <option key={idx} value={idx}>
                {item.status} - {formatRupiah(item.nominal)}/tahun
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="space-y-2">
            <label className="text-sm font-medium">Iuran Pensiun Tambahan (Rp/Bln)</label>
            <input
              type="number"
              value={customPotongan}
              onChange={(e) => setCustomPotongan(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
              placeholder="0"
            />
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
          onClick={hitungPph}
          className="w-full bg-foreground text-background h-12 rounded-lg font-bold hover:bg-foreground/90 transition-colors uppercase tracking-wider text-sm"
        >
          Hitung PPh 21
        </button>
      </div>

      {/* Rincian Output */}
      <div className="space-y-6">
        <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-xl h-full flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-4">Hasil Estimasi Pajak</h3>

            {calculated ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background border border-foreground/10 p-4 rounded-lg">
                    <span className="text-xs text-foreground/45 block mb-1">PPh 21 per Bulan</span>
                    <span className="text-xl md:text-2xl font-bold text-primary font-mono">{formatRupiah(pphBulanan)}</span>
                  </div>
                  <div className="bg-background border border-foreground/10 p-4 rounded-lg">
                    <span className="text-xs text-foreground/45 block mb-1">PPh 21 per Tahun</span>
                    <span className="text-xl md:text-2xl font-bold text-foreground font-mono">{formatRupiah(pphTahunan)}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-foreground/10 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/70 mb-2">Simulasi Perhitungan Tahunan</h4>
                  
                  <div className="text-xs font-mono space-y-1.5">
                    <div className="flex justify-between">
                      <span>Penghasilan Bruto (Kotor):</span>
                      <span>{formatRupiah(brutoTahunan)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>Biaya Jabatan (Maks 6jt):</span>
                      <span>-{formatRupiah(biayaJabatan)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>BPJS Ketenagakerjaan (JHT+JP):</span>
                      <span>-{formatRupiah(jhtJp)}</span>
                    </div>
                    {customPotongan > 0 && (
                      <div className="flex justify-between text-red-500">
                        <span>Iuran Pensiun Lainnya:</span>
                        <span>-{formatRupiah(customPotongan * 12)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-foreground/10 pt-1.5">
                      <span>Penghasilan Netto:</span>
                      <span>{formatRupiah(nettoTahunan)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>PTKP Status terpilih:</span>
                      <span>-{formatRupiah(ptkpNominal)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-primary border-t border-foreground/10 pt-1.5">
                      <span>PKP (Dibulatkan):</span>
                      <span>{formatRupiah(pkp)}</span>
                    </div>
                    {!hasNpwp && (
                      <div className="text-[10px] text-red-400 text-right mt-1">
                        *Dikenakan tambahan tarif 20% karena tidak memiliki NPWP.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-foreground/40 text-sm py-16 text-center">
                Silakan isi data penghasilan dan klik "Hitung PPh 21".
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-foreground/10 text-[10px] text-foreground/45 leading-relaxed space-y-1">
            <p className="font-bold">Ketentuan & Referensi Pajak:</p>
            <p>1. Perhitungan menggunakan metode tarif progresif UU HPP 2021.</p>
            <p>2. Biaya jabatan dihitung 5% dari bruto, maksimal Rp 500.000/bulan.</p>
            <p>3. JHT karyawan ditanggung 2%, JP ditanggung 1% upah pokok bulanan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
