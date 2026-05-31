import { useEffect, useMemo, useState } from "react";

export function AgeCalculator() {
  const [dob, setDob] = useState("2000-01-01");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const result = useMemo(() => {
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return null;
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) {
      months -= 1;
      const prev = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prev.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const diffMs = now.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / 86400000);
    const totalHours = Math.floor(diffMs / 3600000);
    const totalMin = Math.floor(diffMs / 60000);
    const totalSec = Math.floor(diffMs / 1000);
    return { years, months, days, totalDays, totalHours, totalMin, totalSec };
  }, [dob, now]);

  const Stat = ({ label, value }: { label: string; value: number | string }) => (
    <div className="bg-background border border-foreground/10 rounded-lg p-4">
      <div className="font-display text-2xl text-primary leading-none">{value.toLocaleString()}</div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/50 mt-2">{label}</div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2 block">Tanggal Lahir</label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full p-4 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
        />
      </div>
      {result && (
        <>
          <div className="bg-foreground text-background rounded-xl p-6 text-center">
            <div className="text-xs font-mono uppercase tracking-widest opacity-60 mb-2">Umur kamu</div>
            <div className="font-display text-4xl md:text-5xl uppercase">
              {result.years}<span className="text-primary">y</span> {result.months}
              <span className="text-primary">m</span> {result.days}<span className="text-primary">d</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Total Hari" value={result.totalDays} />
            <Stat label="Total Jam" value={result.totalHours} />
            <Stat label="Total Menit" value={result.totalMin} />
            <Stat label="Total Detik" value={result.totalSec} />
          </div>
        </>
      )}
    </div>
  );
}
