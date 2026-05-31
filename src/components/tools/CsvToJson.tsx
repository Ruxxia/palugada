import { useState } from "react";

function parseCsv(text: string, delimiter: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          value += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        value += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        row.push(value);
        value = "";
      } else if (char === "\r" || char === "\n") {
        row.push(value);
        if (row.length > 0 && (row.length > 1 || row[0] !== "")) {
          result.push(row);
        }
        row = [];
        value = "";
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
      } else {
        value += char;
      }
    }
  }

  if (value || row.length > 0) {
    row.push(value);
    if (row.length > 1 || row[0] !== "") {
      result.push(row);
    }
  }

  return result;
}

export function CsvToJson() {
  const [input, setInput] = useState(
    `id,name,city,age\n1,"Alice",Jakarta,25\n2,"Bob",Bandung,30`
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [tryParseTypes, setTryParseTypes] = useState(true);

  const convert = () => {
    try {
      setError("");
      const parsedRows = parseCsv(input.trim(), delimiter);

      if (parsedRows.length < 2) {
        setOutput("");
        setError("CSV harus memiliki baris header dan minimal satu baris data.");
        return;
      }

      const headers = parsedRows[0].map((h) => h.trim());
      const dataRows = parsedRows.slice(1);

      const jsonArray = dataRows.map((row) => {
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
          let val: any = row[index];
          if (val === undefined) {
            val = null;
          } else if (tryParseTypes) {
            const trimmed = val.trim();
            if (trimmed === "true") val = true;
            else if (trimmed === "false") val = false;
            else if (trimmed === "null") val = null;
            else if (!isNaN(Number(trimmed)) && trimmed !== "") {
              val = Number(trimmed);
            }
          }
          obj[header] = val;
        });
        return obj;
      });

      setOutput(JSON.stringify(jsonArray, null, 2));
    } catch (e) {
      setError(`Gagal memparsing CSV: ${(e as Error).message}`);
      setOutput("");
    }
  };

  const [activeLang, setActiveLang] = useState<"js" | "python" | "php" | "go" | "java">("js");

  const codeSnippets = {
    js: `// Simple CSV to JSON di JavaScript (Koma/Semicolon)
function csvToJson(csvText, delimiter = ',') {
  const lines = csvText.trim().split('\\n');
  const headers = lines[0].split(delimiter).map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || null;
    });
    return obj;
  });
}`,
    python: `# Python (Built-in csv & json)
import csv
import json
import io

def csv_to_json(csv_text, delimiter=','):
    reader = csv.DictReader(io.StringIO(csv_text.strip()), delimiter=delimiter)
    return json.dumps([row for row in reader], indent=2)`,
    php: `<?php
// PHP CSV ke JSON
function csvToJson($csvText, $delimiter = ',') {
    $lines = explode("\\n", trim($csvText));
    $headers = str_getcsv(array_shift($lines), $delimiter);
    $json = [];
    foreach ($lines as $line) {
        $row = str_getcsv($line, $delimiter);
        $json[] = array_combine($headers, $row);
    }
    return json_encode($json, JSON_PRETTY_PRINT);
}`,
    go: `package main

import (
	"encoding/csv"
	"encoding/json"
	"strings"
)

func csvToJson(csvText string) (string, error) {
	reader := csv.NewReader(strings.NewReader(csvText))
	records, err := reader.ReadAll()
	if err != nil {
		return "", err
	}
	if len(records) < 2 {
		return "[]", nil
	}

	headers := records[0]
	var data []map[string]string

	for _, row := range records[1:] {
		obj := make(map[string]string)
		for i, header := range headers {
			if i < len(row) {
				obj[header] = row[i]
			}
		}
		data = append(data, obj)
	}

	jsonBytes, err := json.MarshalIndent(data, "", "  ")
	return string(jsonBytes), err
}`,
    java: `import java.util.*;

public class CsvConverter {
    public static List<Map<String, String>> csvToJson(String csvText, String delimiter) {
        String[] lines = csvText.trim().split("\\\\n");
        if (lines.length < 2) return Collections.emptyList();

        String[] headers = lines[0].split(delimiter);
        List<Map<String, String>> list = new ArrayList<>();

        for (int i = 1; i < lines.length; i++) {
            String[] values = lines[i].split(delimiter);
            Map<String, String> row = new LinkedHashMap<>();
            for (int j = 0; j < headers.length; j++) {
                String val = j < values.length ? values[j].replace("\"", "") : "";
                row.put(headers[j].trim(), val.trim());
            }
            list.add(row);
        }
        return list;
    }
}`
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2 block">
            CSV Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            className="w-full font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary resize-y"
            placeholder="Paste CSV di sini..."
            aria-label="CSV Input"
          />
        </div>

        <div className="space-y-4">
          <div className="bg-foreground/5 p-4 rounded-xl border border-foreground/10 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-foreground/60 font-bold">Opsi JSON</h3>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">Delimiter</span>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="bg-background border border-foreground/15 rounded-md px-3 py-1.5 text-sm"
              >
                <option value=",">Koma (,)</option>
                <option value=";">Titik Koma (;)</option>
                <option value="&#9;">Tab (\t)</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">Deteksi tipe data (number/boolean)</span>
              <input
                type="checkbox"
                checked={tryParseTypes}
                onChange={(e) => setTryParseTypes(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-foreground/20"
              />
            </div>

            <button
              onClick={convert}
              className="w-full bg-foreground text-background py-2 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
            >
              Convert ke JSON
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-mono">{error}</div>}

      {output && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground/50">JSON Output</span>
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="text-xs font-mono uppercase tracking-wider text-primary hover:underline"
            >
              Copy
            </button>
          </div>
          <div className="relative">
            <pre className="font-mono text-xs p-4 border border-foreground/15 rounded-lg bg-background overflow-auto max-h-80 whitespace-pre">{output}</pre>
          </div>
        </div>
      )}

      {/* Code Implementations */}
      <div className="pt-6 border-t border-foreground/10 space-y-4">
        <div>
          <h3 className="font-display text-xl uppercase tracking-tight">Implementasi Kode</h3>
          <p className="text-xs text-foreground/50 mt-1">Gunakan kode di bawah ini untuk mengonversi CSV ke JSON di program kamu.</p>
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
