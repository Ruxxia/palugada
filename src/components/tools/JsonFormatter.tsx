import { useState } from "react";

export function JsonFormatter() {
  const [input, setInput] = useState('{"hello":"world","items":[1,2,3]}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const format = (minify = false) => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, minify ? 0 : 2));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={8}
        className="w-full font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary resize-y"
        placeholder="Paste JSON di sini..."
        aria-label="JSON input"
      />
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => format(false)} className="bg-foreground text-background px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90">
          Format
        </button>
        <button onClick={() => format(true)} className="bg-card border-2 border-foreground px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/5">
          Minify
        </button>
        <button onClick={() => { setInput(""); setOutput(""); setError(""); }} className="bg-card border border-foreground/15 px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider">
          Clear
        </button>
      </div>
      {error && <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-mono">{error}</div>}
      {output && (
        <div className="relative">
          <pre className="font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background overflow-auto max-h-96">{output}</pre>
          <button
            onClick={() => navigator.clipboard.writeText(output)}
            className="absolute top-3 right-3 bg-foreground text-background px-3 py-1 rounded text-xs font-mono uppercase"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
