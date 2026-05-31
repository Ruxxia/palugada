import { useState } from "react";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function SlugGenerator() {
  const [input, setInput] = useState("Apa Lu Mau, Gua Ada!");
  const slug = slugify(input);
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2 block">Judul / Teks</label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-4 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2 block">Slug</label>
        <div className="relative">
          <div className="font-mono p-4 border-2 border-foreground rounded-lg bg-background text-primary break-all pr-24">
            {slug || <span className="text-foreground/30">—</span>}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(slug)}
            disabled={!slug}
            className="absolute top-1/2 -translate-y-1/2 right-3 bg-foreground text-background px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider disabled:opacity-30"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
