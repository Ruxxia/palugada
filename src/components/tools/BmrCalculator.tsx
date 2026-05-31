import { useState, useEffect } from "react";

export function BmrCalculator() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [age, setAge] = useState("25");

  const [bmr, setBmr] = useState<number | null>(null);

  useEffect(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    const a = parseFloat(age) || 0;

    if (w > 0 && h > 0 && a > 0) {
      let bmrScore = 0;
      if (gender === "male") {
        bmrScore = 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
      } else {
        bmrScore = 447.593 + 9.247 * w + 3.098 * h - 4.33 * a;
      }
      setBmr(bmrScore);
    } else {
      setBmr(null);
    }
  }, [gender, weight, height, age]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-foreground/5 rounded-lg max-w-xs">
        <button
          onClick={() => setGender("male")}
          className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
            gender === "male" ? "bg-foreground text-background" : "hover:text-foreground"
          }`}
        >
          Laki-Laki
        </button>
        <button
          onClick={() => setGender("female")}
          className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-colors ${
            gender === "female" ? "bg-foreground text-background" : "hover:text-foreground"
          }`}
        >
          Perempuan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Berat Badan (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 70"
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
            placeholder="Contoh: 175"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Usia (Tahun)
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
            placeholder="Contoh: 25"
          />
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Perhitungan BMR</h3>
        {bmr !== null ? (
          <div className="p-4 bg-background border border-foreground/10 rounded-lg text-center">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Basal Metabolic Rate (BMR)</span>
            <span className="text-3xl font-bold font-mono text-primary">{bmr.toFixed(0)} kkal/hari</span>
            <p className="text-xs text-foreground/50 mt-2 max-w-md mx-auto">
              Jumlah kalori minimum yang dibutuhkan tubuh Anda untuk menjalankan fungsi organ dasar saat istirahat total.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-background/50 border border-foreground/10 rounded-lg text-center text-sm text-foreground/50">
            Masukkan data berat, tinggi, dan usia untuk melihat hasil BMR.
          </div>
        )}
      </div>
    </div>
  );
}
