import { useState } from "react";

export function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encode = () => {
    try {
      const bytes = new TextEncoder().encode(input);
      let bin = "";
      bytes.forEach((b) => (bin += String.fromCharCode(b)));
      setOutput(btoa(bin));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const decode = () => {
    try {
      const bin = atob(input.trim());
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      setOutput(new TextDecoder().decode(bytes));
      setError("");
    } catch (e) {
      setError("Input bukan Base64 yang valid");
    }
  };

  const [activeLang, setActiveLang] = useState<"js" | "python" | "php" | "go" | "java">("js");
  const [activeMode, setActiveMode] = useState<"encode" | "decode">("encode");

  const codeSnippets = {
    js: {
      encode: `// Node.js (Buffer)
const encoded = Buffer.from("teks").toString("base64");

// Browser (btoa) - support UTF-8 safely
const encoded = btoa(unescape(encodeURIComponent("teks")));`,
      decode: `// Node.js (Buffer)
const decoded = Buffer.from("YmFzZTY0", "base64").toString("utf-8");

// Browser (atob) - support UTF-8 safely
const decoded = decodeURIComponent(escape(atob("YmFzZTY0")));`
    },
    python: {
      encode: `# Python base64
import base64

encoded = base64.b64encode("teks".encode("utf-8")).decode("utf-8")`,
      decode: `# Python base64
import base64

decoded = base64.b64decode("YmFzZTY0".encode("utf-8")).decode("utf-8")`
    },
    php: {
      encode: `<?php
// PHP Encode
$encoded = base64_encode("teks");`,
      decode: `<?php
// PHP Decode
$decoded = base64_decode("YmFzZTY0");`
    },
    go: {
      encode: `package main

import (
	"encoding/base64"
	"fmt"
)

func main() {
	encoded := base64.StdEncoding.EncodeToString([]byte("teks"))
	fmt.Println(encoded)
}`,
      decode: `package main

import (
	"encoding/base64"
	"fmt"
)

func main() {
	decodedBytes, _ := base64.StdEncoding.DecodeString("YmFzZTY0")
	decoded := string(decodedBytes)
	fmt.Println(decoded)
}`
    },
    java: {
      encode: `import java.util.Base64;
import java.nio.charset.StandardCharsets;

public class Main {
    public static void main(String[] args) {
        String encoded = Base64.getEncoder().encodeToString("teks".getBytes(StandardCharsets.UTF_8));
        System.out.println(encoded);
    }
}`,
      decode: `import java.util.Base64;
import java.nio.charset.StandardCharsets;

public class Main {
    public static void main(String[] args) {
        byte[] decodedBytes = Base64.getDecoder().decode("YmFzZTY0");
        String decoded = new String(decodedBytes, StandardCharsets.UTF_8);
        System.out.println(decoded);
    }
}`
    }
  };

  return (
    <div className="space-y-6">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        placeholder="Tulis atau paste teks di sini..."
        className="w-full font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary resize-y"
      />
      <div className="flex gap-2 flex-wrap">
        <button onClick={encode} className="bg-foreground text-background px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider">
          Encode →
        </button>
        <button onClick={decode} className="bg-card border-2 border-foreground px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider">
          ← Decode
        </button>
        <button onClick={() => { setInput(output); setOutput(""); }} className="bg-card border border-foreground/15 px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider">
          Swap
        </button>
      </div>
      {error && <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-mono">{error}</div>}
      {output && (
        <div className="relative">
          <pre className="font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background overflow-auto max-h-80 whitespace-pre-wrap break-all">{output}</pre>
          <button
            onClick={() => navigator.clipboard.writeText(output)}
            className="absolute top-3 right-3 bg-foreground text-background px-3 py-1 rounded text-xs font-mono uppercase"
          >
            Copy
          </button>
        </div>
      )}

      {/* Code Implementations */}
      <div className="pt-6 border-t border-foreground/10 space-y-4">
        <div>
          <h3 className="font-display text-xl uppercase tracking-tight">Implementasi Kode</h3>
          <p className="text-xs text-foreground/50 mt-1">Gunakan kode di bawah ini untuk encode/decode Base64 di program kamu.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between flex-wrap gap-2 items-center">
            {/* Mode selector */}
            <div className="flex gap-1 bg-foreground/5 p-1 rounded-lg">
              {(["encode", "decode"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveMode(mode)}
                  className={`px-3 py-1 text-xs font-mono uppercase font-bold rounded-md transition-colors ${
                    activeMode === mode ? "bg-background text-foreground shadow-sm" : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Language selector */}
            <div className="flex gap-1 bg-foreground/5 p-1 rounded-lg">
              {(["js", "python", "php", "go", "java"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-3 py-1 text-xs font-mono uppercase font-bold rounded-md transition-colors ${
                    activeLang === lang ? "bg-background text-foreground shadow-sm" : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {lang === "js" ? "JavaScript" : lang}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <pre className="font-mono text-xs p-4 border border-foreground/15 rounded-lg bg-background overflow-auto max-h-60 leading-relaxed text-foreground/80">
              {codeSnippets[activeLang][activeMode]}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(codeSnippets[activeLang][activeMode])}
              className="absolute top-3 right-3 bg-foreground/5 text-foreground hover:bg-foreground hover:text-background px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors"
            >
              Copy Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
