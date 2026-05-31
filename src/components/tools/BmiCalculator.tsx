import { useState, useEffect } from "react";

export function BmiCalculator() {
  const [weight, setWeight] = useState("65");
  const [height, setHeight] = useState("170");

  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [colorClass, setColorClass] = useState("");

  useEffect(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;

    if (w > 0 && h > 0) {
      const heightInMeters = h / 100;
      const score = w / (heightInMeters * heightInMeters);
      setBmi(score);

      if (score < 18.5) {
        setCategory("Kekurangan Berat Badan (Underweight)");
        setColorClass("text-blue-500");
      } else if (score >= 18.5 && score < 25) {
        setCategory("Berat Badan Normal (Ideal)");
        setColorClass("text-emerald-500");
      } else if (score >= 25 && score < 30) {
        setCategory("Kelebihan Berat Badan (Overweight)");
        setColorClass("text-amber-500");
      } else {
        setCategory("Obesitas (Obese)");
        setColorClass("text-rose-500");
      }
    } else {
      setBmi(null);
      setCategory("");
      setColorClass("");
    }
  }, [weight, height]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Berat Badan (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 65"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Tinggi Badan (cm)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 170"
          />
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Analisis BMI</h3>
        {bmi !== null ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-background border border-foreground/10 rounded-lg">
              <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Skor BMI Anda</span>
              <span className="text-3xl font-bold font-mono text-foreground">{bmi.toFixed(1)}</span>
            </div>
            <div className="p-4 bg-background border border-foreground/10 rounded-lg flex flex-col justify-center">
              <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Kategori Kesehatan</span>
              <span className={`text-lg font-bold ${colorClass}`}>{category}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-background/50 border border-foreground/10 rounded-lg text-center text-sm text-foreground/50">
            Masukkan berat dan tinggi badan untuk melihat hasil.
          </div>
        )}
      </div>
    </div>
  );
}
