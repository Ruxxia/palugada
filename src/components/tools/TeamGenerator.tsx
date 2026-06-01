import { useState } from "react";

interface Team {
  name: string;
  members: string[];
}

export function TeamGenerator() {
  const [namesText, setNamesText] = useState("Andi\nBudi\nCici\nDedi\nEvi\nFani\nGita\nHari\nIwan\nJoko");
  const [splitMethod, setSplitMethod] = useState<"numTeams" | "sizeTeams">("numTeams");
  const [targetValue, setTargetValue] = useState(2);
  const [teams, setTeams] = useState<Team[]>([]);
  const [copiedTeamIdx, setCopiedTeamIdx] = useState<number | null>(null);

  const shuffleArray = (array: any[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const handleGenerate = () => {
    const list = namesText
      .split(/[\n,]+/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (list.length === 0) {
      alert("Masukkan minimal 1 nama di dalam kolom daftar anggota.");
      return;
    }

    const shuffled = shuffleArray(list);
    const resultTeams: Team[] = [];

    if (splitMethod === "numTeams") {
      const numTeams = Math.max(1, targetValue);
      // Initialize teams
      for (let i = 0; i < numTeams; i++) {
        resultTeams.push({ name: `Tim ${i + 1}`, members: [] });
      }
      // Distribute members
      shuffled.forEach((member, index) => {
        const teamIndex = index % numTeams;
        resultTeams[teamIndex].members.push(member);
      });
    } else {
      const teamSize = Math.max(1, targetValue);
      const numTeams = Math.ceil(shuffled.length / teamSize);
      
      for (let i = 0; i < numTeams; i++) {
        const sliceStart = i * teamSize;
        const sliceEnd = sliceStart + teamSize;
        resultTeams.push({
          name: `Tim ${i + 1}`,
          members: shuffled.slice(sliceStart, sliceEnd),
        });
      }
    }

    setTeams(resultTeams);
  };

  const copyAllTeams = () => {
    const text = teams
      .map((team) => `*${team.name}*\n${team.members.map((m, idx) => `${idx + 1}. ${m}`).join("\n")}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    alert("Daftar tim berhasil disalin!");
  };

  const copySingleTeam = (team: Team, idx: number) => {
    const text = `*${team.name}*\n${team.members.map((m, idx) => `${idx + 1}. ${m}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopiedTeamIdx(idx);
    setTimeout(() => setCopiedTeamIdx(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-foreground/10 p-6 rounded-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inputs Section */}
          <div className="space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary border-b border-foreground/5 pb-2">
              Pengaturan Anggota & Tim
            </h3>
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                Daftar Nama Anggota (Satu per baris / pisahkan koma)
              </label>
              <textarea
                value={namesText}
                onChange={(e) => setNamesText(e.target.value)}
                rows={7}
                placeholder="Andi&#10;Budi&#10;Cici"
                className="w-full p-4 border border-foreground/10 rounded-lg text-sm bg-background font-mono focus:outline-none focus:border-primary resize-y"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                Metode Pembagian Tim
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSplitMethod("numTeams");
                    setTargetValue(2);
                  }}
                  className={`h-9 px-4 text-xs font-bold rounded-lg ${
                    splitMethod === "numTeams"
                      ? "bg-primary text-white"
                      : "border border-foreground/10 hover:bg-foreground/5"
                  }`}
                >
                  Bagi Jumlah Tim
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSplitMethod("sizeTeams");
                    setTargetValue(4);
                  }}
                  className={`h-9 px-4 text-xs font-bold rounded-lg ${
                    splitMethod === "sizeTeams"
                      ? "bg-primary text-white"
                      : "border border-foreground/10 hover:bg-foreground/5"
                  }`}
                >
                  Batas Anggota per Tim
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-foreground/60">
                {splitMethod === "numTeams" ? "Tentukan Jumlah Tim" : "Tentukan Jumlah Maks Anggota per Tim"}
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={targetValue}
                onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full h-10 px-3 border border-foreground/10 rounded-lg text-sm bg-background focus:outline-none focus:border-primary font-bold"
              />
            </div>

            <button
              onClick={handleGenerate}
              className="w-full h-12 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
            >
              👥 Hasilkan Pembagian Tim
            </button>
          </div>

          {/* Results Area */}
          <div className="flex flex-col p-6 bg-background rounded-xl border border-foreground/10 min-h-[300px]">
            <div className="flex justify-between items-center border-b border-foreground/5 pb-2 mb-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                Hasil Pembagian Tim
              </h3>
              {teams.length > 0 && (
                <button
                  onClick={copyAllTeams}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Salin Semua Tim
                </button>
              )}
            </div>

            {teams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[340px] overflow-y-auto pr-1">
                {teams.map((team, idx) => (
                  <div
                    key={idx}
                    className="border border-foreground/10 rounded-lg p-3 bg-card flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center border-b border-foreground/5 pb-1 mb-2">
                        <span className="text-xs font-bold font-mono text-foreground/90">{team.name}</span>
                        <span className="text-[10px] text-foreground/40 font-mono">({team.members.length} org)</span>
                      </div>
                      <ul className="text-xs font-mono space-y-1 text-foreground/75 list-decimal pl-4">
                        {team.members.map((member, mIdx) => (
                          <li key={mIdx} className="truncate">
                            {member}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => copySingleTeam(team, idx)}
                      className="text-[10px] font-bold text-primary hover:underline mt-3 self-end"
                    >
                      {copiedTeamIdx === idx ? "Tersalin!" : "Salin Tim"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-foreground/40 space-y-2">
                <span className="text-4xl block">👥</span>
                <p className="text-xs font-bold uppercase tracking-wider font-mono">Belum Ada Tim</p>
                <p className="text-[11px] leading-relaxed max-w-[200px] mx-auto">
                  Masukkan anggota dan konfigurasikan metode pembagian lalu tekan tombol hasilkan.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
