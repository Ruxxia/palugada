import { useState, useEffect } from "react";

export function BeratIdealCalculator() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("170");

  const [devine, setDevine] = useState<number | null>(null);
  const [robinson, setRobinson] = useState<number | null>(null);
  const [miller, setMiller] = useState<number | null>(null);

  useEffect(() => {
    const h = parseFloat(height) || 0;

    if (h > 0) {
      const heightInInches = h / 2.54;
      const inchesOver60 = Math.max(0, heightInInches - 60);

      if (gender === "male") {
        setDevine(50.0 + 2.3 * inchesOver60);
        setRobinson(52.0 + 1.9 * inchesOver60);
        setMiller(56.2 + 1.41 * inchesOver60);
      } else {
        setDevine(45.5 + 2.3 * inchesOver60);
        setRobinson(49.0 + 1.7 * inchesOver60);
        setMiller(53.1 + 1.36 * inchesOver60);
      }
    } else {
      setDevine(null);
      setRobinson(null);
      setMiller(null);
    }
  }, [gender, height]);

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

      <div className="max-w-xs">
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

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Estimasi Berat Badan Ideal</h3>
        {devine !== null ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background border border-foreground/10 rounded-lg text-center">
              <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Rumus Devine (Standar)</span>
              <span className="text-2xl font-bold font-mono text-primary">{devine.toFixed(1)} kg</span>
            </div>
            <div className="p-4 bg-background border border-foreground/10 rounded-lg text-center">
              <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Rumus Robinson</span>
              <span className="text-2xl font-bold font-mono text-foreground">{robinson !== null ? robinson.toFixed(1) : ""} kg</span>
            </div>
            <div className="p-4 bg-background border border-foreground/10 rounded-lg text-center">
              <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Rumus Miller</span>
              <span className="text-2xl font-bold font-mono text-foreground">{miller !== null ? miller.toFixed(1) : ""} kg</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-background/50 border border-foreground/10 rounded-lg text-center text-sm text-foreground/50">
            Masukkan tinggi badan untuk menghitung berat badan ideal.
          </div>
        )}
      </div>
    </div>
  );
}
