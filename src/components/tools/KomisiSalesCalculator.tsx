import { useState, useEffect } from "react";

export function KomisiSalesCalculator() {
  const [salesRevenue, setSalesRevenue] = useState("50000000");
  const [baseSalary, setBaseSalary] = useState("4000000");
  const [commissionRate, setCommissionRate] = useState("5");
  const [targetQuota, setTargetQuota] = useState("100000000");
  const [bonusRate, setBonusRate] = useState("2"); // Bonus if target is achieved

  const [totalCommission, setTotalCommission] = useState(0);
  const [quotaBonus, setQuotaBonus] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const sales = parseFloat(salesRevenue) || 0;
    const base = parseFloat(baseSalary) || 0;
    const rate = parseFloat(commissionRate) || 0;
    const quota = parseFloat(targetQuota) || 0;
    const bonus = parseFloat(bonusRate) || 0;

    const comm = (rate / 100) * sales;
    const quotaAchieved = quota > 0 && sales >= quota;
    const qBonus = quotaAchieved ? (bonus / 100) * sales : 0;

    setTotalCommission(comm);
    setQuotaBonus(qBonus);
    setTotalEarnings(base + comm + qBonus);
  }, [salesRevenue, baseSalary, commissionRate, targetQuota, bonusRate]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Total Penjualan (Rp)
          </label>
          <input
            type="number"
            value={salesRevenue}
            onChange={(e) => setSalesRevenue(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 50000000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Gaji Pokok (Rp)
          </label>
          <input
            type="number"
            value={baseSalary}
            onChange={(e) => setBaseSalary(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 4000000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Komisi (%)
          </label>
          <input
            type="number"
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 5"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Target Quota (Rp)
          </label>
          <input
            type="number"
            value={targetQuota}
            onChange={(e) => setTargetQuota(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 100000000"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Bonus Capai Target (%)
          </label>
          <input
            type="number"
            value={bonusRate}
            onChange={(e) => setBonusRate(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 2"
          />
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Perhitungan Pendapatan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Total Pendapatan Komisi</span>
            <span className="text-xl font-bold font-mono text-foreground">{formatRupiah(totalCommission)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Bonus Pencapaian Target</span>
            <span className="text-xl font-bold font-mono text-accent">{formatRupiah(quotaBonus)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Total Penerimaan (Gaji + Komisi)</span>
            <span className="text-xl font-bold font-mono text-primary">{formatRupiah(totalEarnings)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
