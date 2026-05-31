import { useState, useEffect } from "react";

export function TabunganCalculator() {
  const [mode, setMode] = useState<"target" | "monthly">("target");

  // Mode 1: Target-based
  const [goalAmount, setGoalAmount] = useState("50000000");
  const [targetMonths, setTargetMonths] = useState("24");
  const [startingSavings, setStartingSavings] = useState("5000000");
  const [requiredMonthly, setRequiredMonthly] = useState(0);

  // Mode 2: Monthly-based
  const [monthlySaving, setMonthlySaving] = useState("1500000");
  const [goalAmount2, setGoalAmount2] = useState("50000000");
  const [startingSavings2, setStartingSavings2] = useState("5000000");
  const [requiredMonths, setRequiredMonths] = useState(0);

  useEffect(() => {
    if (mode === "target") {
      const goal = parseFloat(goalAmount) || 0;
      const months = parseFloat(targetMonths) || 0;
      const start = parseFloat(startingSavings) || 0;

      const remaining = Math.max(0, goal - start);
      if (months > 0) {
        setRequiredMonthly(remaining / months);
      } else {
        setRequiredMonthly(0);
      }
    } else {
      const monthly = parseFloat(monthlySaving) || 0;
      const goal = parseFloat(goalAmount2) || 0;
      const start = parseFloat(startingSavings2) || 0;

      const remaining = Math.max(0, goal - start);
      if (monthly > 0) {
        setRequiredMonths(Math.ceil(remaining / monthly));
      } else {
        setRequiredMonths(0);
      }
    }
  }, [mode, goalAmount, targetMonths, startingSavings, monthlySaving, goalAmount2, startingSavings2]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-foreground/5 rounded-lg max-w-sm">
        <button
          onClick={() => setMode("target")}
          className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
            mode === "target" ? "bg-foreground text-background" : "hover:text-foreground"
          }`}
        >
          Hitung Tabungan Bulanan
        </button>
        <button
          onClick={() => setMode("monthly")}
          className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
            mode === "monthly" ? "bg-foreground text-background" : "hover:text-foreground"
          }`}
        >
          Hitung Durasi Waktu
        </button>
      </div>

      {mode === "target" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
              Target Jumlah Tabungan (Rp)
            </label>
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
              placeholder="Contoh: 50000000"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
              Tabungan Awal Saat Ini (Rp)
            </label>
            <input
              type="number"
              value={startingSavings}
              onChange={(e) => setStartingSavings(e.target.value)}
              className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
              placeholder="Contoh: 5000000"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
              Target Waktu (Bulan)
            </label>
            <input
              type="number"
              value={targetMonths}
              onChange={(e) => setTargetMonths(e.target.value)}
              className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
              placeholder="Contoh: 24"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
              Tabungan Bulanan (Rp/Bulan)
            </label>
            <input
              type="number"
              value={monthlySaving}
              onChange={(e) => setMonthlySaving(e.target.value)}
              className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
              placeholder="Contoh: 1500000"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
              Target Jumlah Tabungan (Rp)
            </label>
            <input
              type="number"
              value={goalAmount2}
              onChange={(e) => setGoalAmount2(e.target.value)}
              className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
              placeholder="Contoh: 50000000"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
              Tabungan Awal Saat Ini (Rp)
            </label>
            <input
              type="number"
              value={startingSavings2}
              onChange={(e) => setStartingSavings2(e.target.value)}
              className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
              placeholder="Contoh: 5000000"
            />
          </div>
        </div>
      )}

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Perencanaan</h3>
        {mode === "target" ? (
          <div className="p-4 bg-background border border-foreground/10 rounded-lg text-center">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">
              Tabungan Yang Harus Disisihkan Setiap Bulan
            </span>
            <span className="text-2xl font-bold font-mono text-primary">{formatRupiah(requiredMonthly)}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-background border border-foreground/10 rounded-lg">
              <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Target Waktu Pencapaian</span>
              <span className="text-2xl font-bold font-mono text-primary">{requiredMonths} Bulan</span>
            </div>
            <div className="p-4 bg-background border border-foreground/10 rounded-lg">
              <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Estimasi dalam Tahun</span>
              <span className="text-2xl font-bold font-mono text-accent">{(requiredMonths / 12).toFixed(1)} Tahun</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
