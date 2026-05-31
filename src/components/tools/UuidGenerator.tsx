import { useState } from "react";

function uuidv4(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 5 }, uuidv4));

  const generate = () => {
    const n = Math.min(Math.max(1, count), 1000);
    setUuids(Array.from({ length: n }, uuidv4));
  };

  const [activeLang, setActiveLang] = useState<"js" | "python" | "php" | "go" | "java">("js");

  const codeSnippets = {
    js: `// Browser & Node.js (v14.17.0+)
const uuid = crypto.randomUUID();`,
    python: `# Python (Built-in uuid)
import uuid

val = str(uuid.uuid4())`,
    php: `<?php
// PHP 7+ (Fallback using random_bytes)
function guidv4() {
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

$uuid = guidv4();`,
    go: `package main

import (
	"fmt"
	"github.com/google/uuid"
)

func main() {
	id := uuid.New().String()
	fmt.Println(id)
}`,
    java: `import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        String id = UUID.randomUUID().toString();
        System.out.println(id);
    }
}`
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-1 block">Jumlah</label>
          <input
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="w-full p-3 border border-foreground/15 rounded-lg bg-background font-mono focus:outline-none focus:border-primary"
          />
        </div>
        <button onClick={generate} className="bg-foreground text-background px-5 py-3 rounded-lg font-bold text-sm uppercase tracking-wider">
          Generate
        </button>
        <button onClick={() => navigator.clipboard.writeText(uuids.join("\n"))} className="bg-card border-2 border-foreground px-5 py-3 rounded-lg font-bold text-sm uppercase tracking-wider">
          Copy All
        </button>
      </div>

      <div className="bg-background border border-foreground/15 rounded-lg p-4 max-h-[300px] overflow-auto font-mono text-sm space-y-1">
        {uuids.map((u, i) => (
          <div key={i} className="flex items-center justify-between gap-2 py-0.5 hover:bg-foreground/5 px-2 rounded">
            <span>{u}</span>
            <button
              onClick={() => navigator.clipboard.writeText(u)}
              className="text-[10px] uppercase text-primary hover:underline"
            >
              copy
            </button>
          </div>
        ))}
      </div>

      {/* Code Implementations */}
      <div className="pt-6 border-t border-foreground/10 space-y-4">
        <div>
          <h3 className="font-display text-xl uppercase tracking-tight">Implementasi Kode</h3>
          <p className="text-xs text-foreground/50 mt-1">Gunakan kode di bawah ini untuk men-generate UUID v4 di program kamu.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-end gap-1 bg-foreground/5 p-1 rounded-lg self-start">
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

          <div className="relative">
            <pre className="font-mono text-xs p-4 border border-foreground/15 rounded-lg bg-background overflow-auto max-h-60 leading-relaxed text-foreground/80">
              {codeSnippets[activeLang]}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(codeSnippets[activeLang])}
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
