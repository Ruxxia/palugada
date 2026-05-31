import { useState, useEffect } from "react";

export function NilaiAkhirCalculator() {
  const [attendanceScore, setAttendanceScore] = useState("100");
  const [attendanceWeight, setAttendanceWeight] = useState("10");

  const [assignmentsScore, setAssignmentsScore] = useState("85");
  const [assignmentsWeight, setAssignmentsWeight] = useState("20");

  const [utsScore, setUtsScore] = useState("80");
  const [utsWeight, setUtsWeight] = useState("30");

  const [uasScore, setUasScore] = useState("75");
  const [uasWeight, setUasWeight] = useState("40");

  const [finalScore, setFinalScore] = useState(0);
  const [gradeLetter, setGradeLetter] = useState("");
  const [totalWeight, setTotalWeight] = useState(100);

  useEffect(() => {
    const sAtt = parseFloat(attendanceScore) || 0;
    const wAtt = parseFloat(attendanceWeight) || 0;

    const sAss = parseFloat(assignmentsScore) || 0;
    const wAss = parseFloat(assignmentsWeight) || 0;

    const sUts = parseFloat(utsScore) || 0;
    const wUts = parseFloat(utsWeight) || 0;

    const sUas = parseFloat(uasScore) || 0;
    const wUas = parseFloat(uasWeight) || 0;

    const sumWeights = wAtt + wAss + wUts + wUas;
    setTotalWeight(sumWeights);

    if (sumWeights > 0) {
      const final = (sAtt * wAtt + sAss * wAss + sUts * wtsScore + sUas * wUas) / sumWeights;
      // Wait, there is a typo in my variable above: sUts * wtsScore -> should be sUts * wUts. Good catch!
      const correctFinal = (sAtt * wAtt + sAss * wAss + sUts * wUts + sUas * wUas) / sumWeights;
      setFinalScore(correctFinal);

      // Determine grade letter
      if (correctFinal >= 85) {
        setGradeLetter("A");
      } else if (correctFinal >= 80) {
        setGradeLetter("A-");
      } else if (correctFinal >= 75) {
        setGradeLetter("B+");
      } else if (correctFinal >= 70) {
        setGradeLetter("B");
      } else if (correctFinal >= 65) {
        setGradeLetter("B-");
      } else if (correctFinal >= 60) {
        setGradeLetter("C+");
      } else if (correctFinal >= 55) {
        setGradeLetter("C");
      } else if (correctFinal >= 40) {
        setGradeLetter("D");
      } else {
        setGradeLetter("E");
      }
    } else {
      setFinalScore(0);
      setGradeLetter("");
    }
  }, [
    attendanceScore,
    attendanceWeight,
    assignmentsScore,
    assignmentsWeight,
    utsScore,
    utsWeight,
    uasScore,
    uasWeight,
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-foreground/5 p-4 rounded-lg border border-foreground/10 text-xs font-mono text-center text-foreground/75">
        Bobot Nilai Total: <span className={totalWeight === 100 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>{totalWeight}%</span> (Harus 100% untuk hasil ideal)
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kehadiran */}
        <div className="p-4 border border-foreground/10 rounded-xl space-y-3 bg-card">
          <span className="block text-xs font-mono uppercase tracking-wider text-primary font-bold">Kehadiran</span>
          <div>
            <label className="block text-[10px] uppercase font-mono text-foreground/50 mb-1">Nilai</label>
            <input
              type="number"
              value={attendanceScore}
              onChange={(e) => setAttendanceScore(e.target.value)}
              className="w-full p-2.5 border border-foreground/15 rounded bg-background font-mono focus:outline-none"
              placeholder="0-100"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-mono text-foreground/50 mb-1">Bobot (%)</label>
            <input
              type="number"
              value={attendanceWeight}
              onChange={(e) => setAttendanceWeight(e.target.value)}
              className="w-full p-2.5 border border-foreground/15 rounded bg-background font-mono focus:outline-none"
              placeholder="10"
            />
          </div>
        </div>

        {/* Tugas */}
        <div className="p-4 border border-foreground/10 rounded-xl space-y-3 bg-card">
          <span className="block text-xs font-mono uppercase tracking-wider text-primary font-bold">Tugas & Kuis</span>
          <div>
            <label className="block text-[10px] uppercase font-mono text-foreground/50 mb-1">Nilai</label>
            <input
              type="number"
              value={assignmentsScore}
              onChange={(e) => setAssignmentsScore(e.target.value)}
              className="w-full p-2.5 border border-foreground/15 rounded bg-background font-mono focus:outline-none"
              placeholder="0-100"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-mono text-foreground/50 mb-1">Bobot (%)</label>
            <input
              type="number"
              value={assignmentsWeight}
              onChange={(e) => setAssignmentsWeight(e.target.value)}
              className="w-full p-2.5 border border-foreground/15 rounded bg-background font-mono focus:outline-none"
              placeholder="20"
            />
          </div>
        </div>

        {/* UTS */}
        <div className="p-4 border border-foreground/10 rounded-xl space-y-3 bg-card">
          <span className="block text-xs font-mono uppercase tracking-wider text-primary font-bold">UTS</span>
          <div>
            <label className="block text-[10px] uppercase font-mono text-foreground/50 mb-1">Nilai</label>
            <input
              type="number"
              value={utsScore}
              onChange={(e) => setUtsScore(e.target.value)}
              className="w-full p-2.5 border border-foreground/15 rounded bg-background font-mono focus:outline-none"
              placeholder="0-100"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-mono text-foreground/50 mb-1">Bobot (%)</label>
            <input
              type="number"
              value={utsWeight}
              onChange={(e) => setUtsWeight(e.target.value)}
              className="w-full p-2.5 border border-foreground/15 rounded bg-background font-mono focus:outline-none"
              placeholder="30"
            />
          </div>
        </div>

        {/* UAS */}
        <div className="p-4 border border-foreground/10 rounded-xl space-y-3 bg-card">
          <span className="block text-xs font-mono uppercase tracking-wider text-primary font-bold">UAS</span>
          <div>
            <label className="block text-[10px] uppercase font-mono text-foreground/50 mb-1">Nilai</label>
            <input
              type="number"
              value={uasScore}
              onChange={(e) => setUasScore(e.target.value)}
              className="w-full p-2.5 border border-foreground/15 rounded bg-background font-mono focus:outline-none"
              placeholder="0-100"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-mono text-foreground/50 mb-1">Bobot (%)</label>
            <input
              type="number"
              value={uasWeight}
              onChange={(e) => setUasWeight(e.target.value)}
              className="w-full p-2.5 border border-foreground/15 rounded bg-background font-mono focus:outline-none"
              placeholder="40"
            />
          </div>
        </div>
      </div>

      <div className="bg-foreground/5 p-6 rounded-xl border border-foreground/10 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Hasil Perhitungan Nilai Akhir</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background border border-foreground/10 rounded-lg text-center">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Skor Akhir (Angka)</span>
            <span className="text-3xl font-bold font-mono text-foreground">{finalScore.toFixed(2)}</span>
          </div>
          <div className="p-4 bg-background border border-foreground/10 rounded-lg text-center">
            <span className="block text-xs text-foreground/50 font-mono uppercase mb-1">Indeks Huruf</span>
            <span className="text-3xl font-bold font-mono text-primary">{gradeLetter}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
