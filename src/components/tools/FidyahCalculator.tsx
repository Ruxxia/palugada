import { useState } from "react";

export function FidyahCalculator() {
  const [daysMissed, setDaysMissed] = useState<number>(0);
  const [yearsDelayed, setYearsDelayed] = useState<number>(1);
  const [customPricePerDay, setCustomPricePerDay] = useState<number>(60000); // BAZNAS DKI Jakarta standard Rp 60.000

  // Calculation
  const totalRiceKg = daysMissed * yearsDelayed * 0.675; // 0.675 kg or 1 mud per day
  const totalMoney = daysMissed * yearsDelayed * customPricePerDay;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input panel */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Parameter Fidyah</h3>

        {/* Days Missed */}
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/75 block mb-1">
            Jumlah Hari Puasa yang Ditinggalkan
          </label>
          <input
            type="number"
            min="0"
            value={daysMissed || ""}
            onChange={(e) => setDaysMissed(Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="Contoh: 10"
            className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-medium"
          />
        </div>

        {/* Years Delayed */}
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/75 block mb-1">
            Keterlambatan Pembayaran (Tahun)
          </label>
          <input
            type="number"
            min="1"
            value={yearsDelayed}
            onChange={(e) => setYearsDelayed(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-medium"
          />
          <p className="text-[10px] text-foreground/50 mt-1 leading-relaxed">
            *Menurut Madzhab Syafi'i, fidyah berlipat ganda jika melewati tahun Ramadhan berikutnya sebelum meng-qadha.
          </p>
        </div>

        {/* Price Per Day */}
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/75 block mb-1">
            Nilai Uang per Hari (Rupiah)
          </label>
          <input
            type="number"
            min="0"
            value={customPricePerDay || ""}
            onChange={(e) => setCustomPricePerDay(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm font-medium"
          />
          <p className="text-[10px] text-foreground/50 mt-1">
            Ketetapan BAZNAS DKI Jakarta 2024: Rp 60.000,-/hari (setara nilai makanan pokok).
          </p>
        </div>
      </div>

      {/* Output Panel */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-6">Hasil Perhitungan Fidyah</h3>

          <div className="space-y-6">
            {/* Rice output */}
            <div className="p-4 bg-background border border-foreground/10 rounded-lg">
              <span className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Pilihan 1: Beras / Makanan Pokok</span>
              <span className="text-3xl font-bold font-mono text-primary block mt-1">
                {totalRiceKg.toFixed(3)} <span className="text-lg">kg</span>
              </span>
              <p className="text-[11px] text-foreground/60 mt-2">
                Setara dengan {daysMissed * yearsDelayed} Mud (1 mud = 675 gram beras kualitas baik per hari puasa).
              </p>
            </div>

            {/* Money output */}
            <div className="p-4 bg-background border border-foreground/10 rounded-lg">
              <span className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Pilihan 2: Nominal Uang (Qimah)</span>
              <span className="text-3xl font-bold font-mono text-primary block mt-1">
                {formatRupiah(totalMoney)}
              </span>
              <p className="text-[11px] text-foreground/60 mt-2">
                Dihitung berdasarkan konversi uang yang disalurkan melalui lembaga amil zakat resmi.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-background border border-foreground/10 rounded-lg text-xs text-foreground/70 leading-relaxed space-y-2">
          <span className="font-bold text-[10px] font-mono text-primary uppercase block">💡 Ketentuan Syarat Fidyah:</span>
          <p>
            Fidyah wajib dibayarkan oleh seseorang yang tidak mampu berpuasa karena kondisi tertentu seperti:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Orang tua renta yang sudah tidak mampu berpuasa.</li>
            <li>Orang sakit parah yang tidak ada harapan untuk sembuh.</li>
            <li>Ibu hamil atau menyusui yang mengkhawatirkan keselamatan bayinya (disertai kewajiban qadha di kemudian hari).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
