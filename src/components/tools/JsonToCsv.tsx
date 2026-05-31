import { useState } from "react";

function flattenObject(obj: Record<string, any>, parentKey = "", res: Record<string, any> = {}): Record<string, any> {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const propName = parentKey ? `${parentKey}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        flattenObject(obj[key], propName, res);
      } else {
        res[propName] = obj[key];
      }
    }
  }
  return res;
}

function formatCsvValue(val: any, delimiter: string) {
  if (val === null || val === undefined) return "";
  let stringVal = typeof val === "object" ? JSON.stringify(val) : String(val);
  if (stringVal.includes('"') || stringVal.includes("\n") || stringVal.includes(delimiter)) {
    stringVal = '"' + stringVal.replace(/"/g, '""') + '"';
  }
  return stringVal;
}

export function JsonToCsv() {
  const [input, setInput] = useState(
    JSON.stringify(
      [
        { id: 1, name: "Alice", details: { age: 25, city: "Jakarta" } },
        { id: 2, name: "Bob", details: { age: 30, city: "Bandung" } },
      ],
      null,
      2
    )
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [shouldFlatten, setShouldFlatten] = useState(true);

  const convert = () => {
    try {
      setError("");
      const parsed = JSON.parse(input.trim());
      const array = Array.isArray(parsed) ? parsed : [parsed];

      if (array.length === 0) {
        setOutput("");
        setError("JSON array kosong.");
        return;
      }

      // Process rows and headers
      const processedRows = array.map((item) => {
        if (typeof item !== "object" || item === null) {
          return { value: item };
        }
        return shouldFlatten ? flattenObject(item) : item;
      });

      // Get all unique keys for headers
      const headers = Array.from(
        new Set(processedRows.flatMap((row) => Object.keys(row)))
      );

      // Generate CSV lines
      const csvLines = [];
      csvLines.push(headers.join(delimiter));

      for (const row of processedRows) {
        const line = headers.map((header) => {
          const val = row[header];
          return formatCsvValue(val, delimiter);
        });
        csvLines.push(line.join(delimiter));
      }

      setOutput(csvLines.join("\n"));
    } catch (e) {
      setError(`Gagal memparsing JSON: ${(e as Error).message}`);
      setOutput("");
    }
  };

  const downloadCsv = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [activeLang, setActiveLang] = useState<"js" | "python" | "php" | "go" | "java">("js");

  const codeSnippets = {
    js: `// JSON to CSV di JavaScript
function jsonToCsv(jsonArray, delimiter = ',') {
  const headers = Object.keys(jsonArray[0]);
  const csvRows = [
    headers.join(delimiter), // header row
    ...jsonArray.map(row => 
      headers.map(fieldName => {
        const val = row[fieldName] ?? '';
        const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return stringVal.includes(delimiter) || stringVal.includes('"')
          ? \`"\${stringVal.replace(/"/g, '""')}"\`
          : stringVal;
      }).join(delimiter)
    )
  ];
  return csvRows.join('\\n');
}`,
    python: `# Python (Built-in json & csv)
import json
import csv
import io

def json_to_csv(json_str, delimiter=','):
    data = json.loads(json_str)
    output = io.StringIO()
    if not data:
        return ""
    
    headers = list(data[0].keys())
    writer = csv.DictWriter(output, fieldnames=headers, delimiter=delimiter)
    writer.writeheader()
    writer.writerows(data)
    return output.getvalue()`,
    php: `<?php
// PHP JSON ke CSV
function jsonToCsv($jsonStr, $delimiter = ',') {
    $data = json_decode($jsonStr, true);
    if (empty($data)) return "";
    
    $out = fopen('php://temp', 'r+');
    fputcsv($out, array_keys($data[0]), $delimiter);
    foreach ($data as $row) {
        fputcsv($out, $row, $delimiter);
    }
    rewind($out);
    $csv = stream_get_contents($out);
    fclose($out);
    return $csv;
}`,
    go: `package main

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
)

func jsonToCsv(jsonBytes []byte) (string, error) {
	var data []map[string]interface{}
	if err := json.Unmarshal(jsonBytes, &data); err != nil {
		return "", err
	}
	if len(data) == 0 {
		return "", nil
	}

	buf := new(bytes.Buffer)
	writer := csv.NewWriter(buf)

	var headers []string
	for k := range data[0] {
		headers = append(headers, k)
	}
	writer.Write(headers)

	for _, row := range data {
		var record []string
		for _, header := range headers {
			val := row[header]
			record = append(record, fmt.Sprintf("%v", val))
		}
		writer.Write(record)
	}
	writer.Flush()
	return buf.String(), nil
}`,
    java: `import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper; // Jackson Library

public class JsonCsvConverter {
    public static String jsonToCsv(String jsonStr) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> data = mapper.readValue(jsonStr, List.class);
        if (data.isEmpty()) return "";

        StringBuilder sb = new StringBuilder();
        Set<String> headers = data.get(0).keySet();
        sb.append(String.join(",", headers)).append("\\n");

        for (Map<String, Object> row : data) {
            List<String> values = new ArrayList<>();
            for (String header : headers) {
                Object val = row.get(header);
                values.add(val == null ? "" : val.toString());
            }
            sb.append(String.join(",", values)).append("\\n");
        }
        return sb.toString();
    }
}`
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 mb-2 block">
            JSON Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            className="w-full font-mono text-sm p-4 border border-foreground/15 rounded-lg bg-background focus:outline-none focus:border-primary resize-y"
            placeholder="Paste JSON array di sini..."
            aria-label="JSON Input"
          />
        </div>

        <div className="space-y-4">
          <div className="bg-foreground/5 p-4 rounded-xl border border-foreground/10 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-foreground/60 font-bold">Opsi CSV</h3>
            
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
              <span className="text-sm font-medium">Flatten nested objects</span>
              <input
                type="checkbox"
                checked={shouldFlatten}
                onChange={(e) => setShouldFlatten(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-foreground/20"
              />
            </div>

            <button
              onClick={convert}
              className="w-full bg-foreground text-background py-2 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-colors"
            >
              Convert ke CSV
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm font-mono">{error}</div>}

      {output && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground/50">CSV Output</span>
            <div className="flex gap-2">
              <button
                onClick={downloadCsv}
                className="text-xs font-mono uppercase tracking-wider text-primary hover:underline"
              >
                Download CSV
              </button>
              <span className="text-foreground/30 font-mono">|</span>
              <button
                onClick={() => navigator.clipboard.writeText(output)}
                className="text-xs font-mono uppercase tracking-wider text-primary hover:underline"
              >
                Copy
              </button>
            </div>
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
          <p className="text-xs text-foreground/50 mt-1">Gunakan kode di bawah ini untuk mengonversi JSON ke CSV di program kamu.</p>
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
