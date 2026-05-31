import { useState, useEffect } from "react";

export function KaloriCalculator() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [age, setAge] = useState("25");
  const [activity, setActivity] = useState<"1.2" | "1.375" | "1.55" | "1.725" | "1.9">("1.375");

  const [tdee, setTdee] = useState<number | null>(null);

  useEffect(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    const a = parseFloat(age) || 0;
    const act = parseFloat(activity) || 1.2;

    if (w > 0 && h > 0 && a > 0) {
      let bmr = 0;
      if (gender === "male") {
        bmr = 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
      } else {
        bmr = 447.593 + 9.247 * w + 3.098 * h - 4.33 * a;
      }
      setTdee(bmr * act);
    } else {
      setTdee(null);
    }
  }, [gender, weight, height, age, activity]);

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2">
            Tingkat Aktivitas
          </label>
          <select
            value={activity}
            onChange={(e: any) => setActivity(e.target.value)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary text-sm"
          >
            <option value="1.2">Sangat Jarang Olahraga (Sedentary)</option>
            <option value="1.375">Olahraga Ringan (1-3 hari/minggu)</option>
            <option value="1.55">Olahraga Sedang (3-5 hari/minggu)</option>
            <option value="1.725">Olahraga Berat (6-7 hari/minggu)</option>
            <option value="1.9">Atlet / Aktivitas Fisik Sangat Berat</option>
          </select>
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Kebutuhan Kalori Harian (Tdee)</h3>
        {tdee !== null ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background border border-foreground/10 rounded-lg text-center">
              <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Menjaga Berat Badan</span>
              <span className="text-xl font-bold font-mono text-foreground">{tdee.toFixed(0)} kkal/hari</span>
            </div>
            <div className="p-4 bg-background border border-foreground/10 rounded-lg text-center">
              <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Menurunkan Berat Badan (-500)</span>
              <span className="text-xl font-bold font-mono text-emerald-500">{Math.max(1200, tdee - 500).toFixed(0)} kkal/hari</span>
            </div>
            <div className="p-4 bg-background border border-foreground/10 rounded-lg text-center">
              <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Menaikkan Berat Badan (+500)</span>
              <span className="text-xl font-bold font-mono text-primary">{(tdee + 500).toFixed(0)} kkal/hari</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-background/50 border border-foreground/10 rounded-lg text-center text-sm text-foreground/50">
            Masukkan data tubuh Anda di atas untuk melihat kebutuhan kalori.
          </div>
        )}
      </div>
    </div>
  );
}
