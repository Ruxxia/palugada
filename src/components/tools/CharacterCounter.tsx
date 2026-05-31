import { useMemo, useState } from "react";

const LIMITS = [
  { name: "Twitter", limit: 280 },
  { name: "Meta Description", limit: 160 },
  { name: "Title Tag", limit: 60 },
  { name: "SMS", limit: 160 },
];

export function CharacterCounter() {
  const [text, setText] = useState("");
  const chars = text.length;
  const noSpace = useMemo(() => text.replace(/\s/g, "").length, [text]);

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Ketik teks di sini..."
        className="w-full p-4 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary resize-y"
      />
      <div className="flex gap-4 font-mono text-sm">
        <div><span className="text-foreground/50">Dengan spasi:</span> <span className="font-bold text-primary">{chars}</span></div>
        <div><span className="text-foreground/50">Tanpa spasi:</span> <span className="font-bold text-primary">{noSpace}</span></div>
      </div>
      <div className="space-y-2">
        {LIMITS.map((l) => {
          const pct = Math.min(100, (chars / l.limit) * 100);
          const over = chars > l.limit;
          return (
            <div key={l.name} className="bg-background border border-foreground/10 rounded-lg p-3">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-mono uppercase tracking-wider text-foreground/60">{l.name}</span>
                <span className={`font-mono font-bold ${over ? "text-destructive" : "text-foreground"}`}>
                  {chars} / {l.limit}
                </span>
              </div>
              <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${over ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
