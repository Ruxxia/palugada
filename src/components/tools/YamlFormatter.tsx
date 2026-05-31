import { useState } from "react";

export function YamlFormatter() {
  const [input, setInput] = useState("server:\n  port: 8080\n  host:   localhost\ndatabase:\n- username:   admin\n- password: secret\n  status: active");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const formatYaml = () => {
    const lines = input.split("\n");
    const formattedLines = lines.map((line) => {
      // Preserve blank lines
      if (!line.trim()) return "";

      // Preserve comments
      if (line.trim().startsWith("#")) {
        return line.trimEnd();
      }

      // Check indentation
      const matchLeading = line.match(/^(\s*)/);
      const indent = matchLeading ? matchLeading[1] : "";

      const content = line.trim();

      // Check key-value format
      const colonIdx = content.indexOf(":");
      if (colonIdx !== -1) {
        const isUrl = content.match(/^https?:\/\//) || content.substring(colonIdx - 4, colonIdx) === "http" || content.substring(colonIdx - 5, colonIdx) === "https";
        // If it's a real key-value pair and not just part of a URL
        if (!isUrl) {
          const key = content.substring(0, colonIdx).trim();
          const val = content.substring(colonIdx + 1).trim();
          return `${indent}${key}:${val ? " " + val : ""}`;
        }
      }

      // Check list format (- item)
      if (content.startsWith("-")) {
        const item = content.substring(1).trim();
        return `${indent}- ${item}`;
      }

      return `${indent}${content}`;
    });

    setOutput(formattedLines.join("\n"));
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input */}
      <div className="space-y-4 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">YAML Input</h3>
        
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-80 p-4 bg-background border border-foreground/15 rounded-lg font-mono text-xs focus:outline-none focus:border-primary resize-y"
          placeholder="Tulis YAML di sini..."
        />

        <button
          onClick={formatYaml}
          className="w-full bg-foreground text-background h-11 rounded-lg font-bold hover:opacity-90 transition-opacity uppercase tracking-wider text-xs"
        >
          Format YAML
        </button>
      </div>

      {/* Output */}
      <div className="space-y-4 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between min-h-[380px]">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Formatted Output</h3>
            {output && (
              <button
                onClick={copyToClipboard}
                className="bg-foreground text-background text-xs font-mono px-3 py-1 rounded hover:opacity-95 transition-opacity"
              >
                {copied ? "Copied! ✓" : "Copy YAML"}
              </button>
            )}
          </div>

          {output ? (
            <div className="bg-background border border-foreground/10 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-xs font-mono whitespace-pre">{output}</pre>
            </div>
          ) : (
            <div className="text-foreground/40 text-sm py-24 text-center">
              Hasil YAML yang diformat akan muncul di sini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
