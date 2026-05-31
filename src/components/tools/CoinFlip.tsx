import { useState } from "react";

export function CoinFlip() {
  const [result, setResult] = useState<"head" | "tail" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [stats, setStats] = useState({ heads: 0, tails: 0, total: 0 });
  const [history, setHistory] = useState<("head" | "tail")[]>([]);

  const flip = () => {
    setIsFlipping(true);
    // Simulate coin spinning
    setTimeout(() => {
      const rand = Math.random() < 0.5 ? "head" : "tail";
      setResult(rand);
      setHistory((prev) => [rand, ...prev.slice(0, 19)]);
      setStats((prev) => {
        const nextHeads = prev.heads + (rand === "head" ? 1 : 0);
        const nextTails = prev.tails + (rand === "tail" ? 1 : 0);
        const nextTotal = prev.total + 1;
        return { heads: nextHeads, tails: nextTails, total: nextTotal };
      });
      setIsFlipping(false);
    }, 600);
  };

  const getCoinSvg = (side: "head" | "tail" | null) => {
    const isTail = side === "tail";
    return (
      <div className={`w-28 h-28 rounded-full border-4 border-foreground bg-background flex items-center justify-center font-mono font-bold text-xl relative shadow-md transition-transform duration-500 ${isFlipping ? "animate-spin" : ""}`}>
        <div className="absolute inset-2 rounded-full border-2 border-dashed border-foreground/30 flex items-center justify-center">
          {side ? (
            <span className="uppercase text-sm tracking-wider font-bold">
              {isTail ? "Gambar" : "Angka"}
            </span>
          ) : (
            <span className="text-xs text-foreground/45 text-center">FLIP ME</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center gap-6 py-6 bg-foreground/5 rounded-2xl border border-foreground/10">
        <div>{getCoinSvg(result)}</div>
        <button
          onClick={flip}
          disabled={isFlipping}
          className="bg-foreground text-background px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 disabled:opacity-50 transition-colors"
        >
          {isFlipping ? "Memutar..." : "Lempar Koin"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-background border border-foreground/15 p-4 rounded-xl font-mono">
          <span className="text-[10px] uppercase text-foreground/40 block">Total Lempar</span>
          <span className="text-xl font-bold">{stats.total}</span>
        </div>
        <div className="bg-background border border-foreground/15 p-4 rounded-xl font-mono">
          <span className="text-[10px] uppercase text-foreground/40 block">Angka (Heads)</span>
          <span className="text-xl font-bold">{stats.heads} ({stats.total > 0 ? ((stats.heads / stats.total) * 100).toFixed(0) : 0}%)</span>
        </div>
        <div className="bg-background border border-foreground/15 p-4 rounded-xl font-mono">
          <span className="text-[10px] uppercase text-foreground/40 block">Gambar (Tails)</span>
          <span className="text-xl font-bold">{stats.tails} ({stats.total > 0 ? ((stats.tails / stats.total) * 100).toFixed(0) : 0}%)</span>
        </div>
        <div className="bg-background border border-foreground/15 p-4 rounded-xl font-mono flex items-center justify-center">
          <button
            onClick={() => { setStats({ heads: 0, tails: 0, total: 0 }); setHistory([]); setResult(null); }}
            className="text-xs uppercase text-destructive hover:underline font-bold"
          >
            Reset Stats
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Riwayat Lemparan</h3>
          <div className="flex gap-2 flex-wrap font-mono text-xs">
            {history.map((h, i) => (
              <span key={i} className={`px-2 py-1 rounded border ${h === "head" ? "bg-primary/10 border-primary/20 text-primary" : "bg-foreground/5 border-foreground/10 text-foreground/70"}`}>
                {h === "head" ? "A" : "G"}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
