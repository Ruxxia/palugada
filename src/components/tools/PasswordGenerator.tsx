import { useEffect, useState } from "react";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  num: "0123456789",
  sym: "!@#$%^&*()-_=+[]{};:,.?",
};

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ lower: true, upper: true, num: true, sym: true });
  const [pw, setPw] = useState("");

  const generate = () => {
    let pool = "";
    (Object.keys(opts) as (keyof typeof opts)[]).forEach((k) => {
      if (opts[k]) pool += SETS[k];
    });
    if (!pool) {
      setPw("");
      return;
    }
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    let out = "";
    for (let i = 0; i < length; i++) out += pool[arr[i] % pool.length];
    setPw(out);
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, opts]);

  const strength = Math.min(100, (length / 32) * 60 + Object.values(opts).filter(Boolean).length * 10);

  return (
    <div className="space-y-5">
      <div className="relative">
        <div className="font-mono text-lg md:text-2xl p-5 border-2 border-foreground rounded-lg bg-background break-all pr-28">
          {pw || <span className="text-foreground/30">—</span>}
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-3 flex gap-2">
          <button onClick={generate} className="bg-card border border-foreground/20 px-3 py-1.5 rounded text-xs font-bold uppercase">
            ↻
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(pw)}
            className="bg-foreground text-background px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider"
          >
            Copy
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-foreground/60 mb-2">
          <span>Strength</span>
          <span className={strength > 70 ? "text-accent" : strength > 40 ? "text-primary" : "text-destructive"}>
            {strength > 70 ? "Kuat" : strength > 40 ? "Sedang" : "Lemah"}
          </span>
        </div>
        <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${strength}%` }} />
        </div>
      </div>

      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2 block">
          Panjang: <span className="text-primary font-bold">{length}</span>
        </label>
        <input
          type="range"
          min={4}
          max={64}
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(opts) as (keyof typeof opts)[]).map((k) => (
          <label key={k} className="flex items-center gap-3 p-3 border border-foreground/10 rounded-lg cursor-pointer hover:border-primary/40">
            <input
              type="checkbox"
              checked={opts[k]}
              onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })}
              className="accent-primary w-4 h-4"
            />
            <span className="text-sm font-medium capitalize">
              {k === "num" ? "Angka" : k === "sym" ? "Simbol" : k === "lower" ? "Huruf kecil" : "Huruf besar"}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
