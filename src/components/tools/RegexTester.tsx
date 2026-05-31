import React, { useState, useEffect } from "react";

interface RegexMatch {
  text: string;
  index: number;
  groups: string[];
}

export function RegexTester() {
  const [pattern, setPattern] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("Halo! Hubungi kami di support@sqwerly.com atau admin@sqwerly.com.");
  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [error, setError] = useState("");
  const [highlighted, setHighlighted] = useState<React.ReactNode[] | string>("");

  useEffect(() => {
    setError("");
    setMatches([]);
    setHighlighted(testString);

    if (!pattern) return;

    try {
      // Force global flag for matchAll and highlighting
      const activeFlags = flags.includes("g") ? flags : flags + "g";
      const regex = new RegExp(pattern, activeFlags);

      const allMatches = Array.from(testString.matchAll(regex));
      const parsedMatches: RegexMatch[] = [];

      const elements: React.ReactNode[] = [];
      let lastIndex = 0;

      allMatches.forEach((match, idx) => {
        const start = match.index!;
        const end = start + match[0].length;

        // Avoid infinite loop on empty match
        if (match[0].length === 0) return;

        parsedMatches.push({
          text: match[0],
          index: start,
          groups: match.slice(1).map((g) => g || ""),
        });

        if (start > lastIndex) {
          elements.push(testString.substring(lastIndex, start));
        }

        elements.push(
          <mark
            key={idx}
            className="bg-primary/20 text-foreground border-b-2 border-primary/50 font-mono px-0.5 rounded"
          >
            {match[0]}
          </mark>
        );

        lastIndex = end;
      });

      if (lastIndex < testString.length) {
        elements.push(testString.substring(lastIndex));
      }

      setMatches(parsedMatches);
      setHighlighted(elements.length > 0 ? elements : testString);
    } catch (e) {
      setError(`Regex Error: ${(e as Error).message}`);
    }
  }, [pattern, flags, testString]);

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ""));
    } else {
      setFlags(flags + flag);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pattern input */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Pattern (Regex)</label>
          <div className="flex font-mono text-sm border border-foreground/15 rounded-lg bg-background overflow-hidden focus-within:border-primary">
            <span className="bg-foreground/5 px-3 py-3 text-foreground/50 border-r border-foreground/15">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="flex-1 px-3 py-3 bg-transparent focus:outline-none"
              placeholder="[a-z]+"
            />
            <span className="bg-foreground/5 px-3 py-3 text-foreground/50 border-l border-foreground/15">/</span>
          </div>
        </div>

        {/* Flag selectors */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Flags</label>
          <div className="flex gap-1 h-[46px] items-center border border-foreground/15 rounded-lg bg-background px-2 justify-between">
            {["g", "i", "m", "s", "u"].map((flag) => {
              const active = flags.includes(flag);
              return (
                <button
                  key={flag}
                  onClick={() => toggleFlag(flag)}
                  className={`w-7 h-7 rounded text-xs font-mono font-bold uppercase transition-colors ${active ? "bg-primary text-background" : "hover:bg-foreground/5 text-foreground/60"
                    }`}
                  title={{
                    g: "global (semua kecocokan)",
                    i: "case-insensitive (abaikan huruf besar/kecil)",
                    m: "multiline",
                    s: "dotAll",
                    u: "unicode",
                  }[flag]}
                >
                  {flag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-mono">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test string input */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Test String</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            rows={8}
            className="w-full font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary resize-y"
            placeholder="Ketik teks di sini untuk ditest..."
          />
        </div>

        {/* Output/Highlight */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Hasil / Highlight</label>
          <div className="w-full h-[186px] overflow-auto font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background/5 whitespace-pre-wrap break-all leading-relaxed">
            {highlighted}
          </div>
        </div>
      </div>

      {/* Match Details */}
      <div className="space-y-3">
        <h3 className="font-display text-xl uppercase tracking-tight">
          Kecocokan ({matches.length})
        </h3>
        {matches.length === 0 ? (
          <div className="text-sm text-foreground/40 italic p-4 border border-dashed border-foreground/15 rounded-lg text-center">
            Tidak ada kecocokan ditemukan.
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto border border-foreground/15 rounded-lg divide-y divide-foreground/10 bg-background/5">
            {matches.map((m, idx) => (
              <div key={idx} className="p-3 text-xs font-mono flex flex-col gap-1.5 md:flex-row md:items-center justify-between">
                <div>
                  <span className="text-foreground/40 mr-2">Match #{idx + 1}:</span>
                  <span className="font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">{m.text}</span>
                  <span className="text-foreground/40 ml-3">Index:</span> <span>{m.index}</span>
                </div>
                {m.groups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.groups.map((group, gIdx) => (
                      <span key={gIdx} className="bg-foreground/5 border border-foreground/10 px-1 rounded text-[10px]" title={`Group ${gIdx + 1}`}>
                        ${gIdx + 1}: "{group}"
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
