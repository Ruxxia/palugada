import { useState, useEffect } from "react";

interface HeaderItem {
  key: string;
  value: string;
}

export function CurlGenerator() {
  const [method, setMethod] = useState<string>("GET");
  const [url, setUrl] = useState<string>("https://api.example.com/data");
  const [headers, setHeaders] = useState<HeaderItem[]>([
    { key: "Content-Type", value: "application/json" },
    { key: "Authorization", value: "Bearer token123" }
  ]);
  const [body, setBody] = useState<string>("{\n  \"status\": \"active\"\n}");
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState<"curl" | "js" | "python" | "go" | "php">("curl");

  const [curlCmd, setCurlCmd] = useState("");
  const [jsCode, setJsCode] = useState("");
  const [pythonCode, setPythonCode] = useState("");
  const [goCode, setGoCode] = useState("");
  const [phpCode, setPhpCode] = useState("");

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const updated = [...headers];
    updated[index][field] = value;
    setHeaders(updated);
  };

  useEffect(() => {
    // Generate Curl
    let cmd = `curl -X ${method} "${url}"`;
    headers.forEach((h) => {
      if (h.key.trim()) {
        cmd += ` \\\n  -H "${h.key.trim()}: ${h.value.trim()}"`;
      }
    });

    if (method !== "GET" && method !== "HEAD" && body.trim()) {
      const escapedBody = body.replace(/"/g, '\\"').replace(/\n/g, "");
      cmd += ` \\\n  -d "${escapedBody}"`;
    }
    setCurlCmd(cmd);

    // Generate JavaScript Fetch
    const headerObj: Record<string, string> = {};
    headers.forEach(h => {
      if (h.key.trim()) headerObj[h.key.trim()] = h.value.trim();
    });
    
    let js = `fetch("${url}", {\n  method: "${method}",\n`;
    if (Object.keys(headerObj).length > 0) {
      js += `  headers: ${JSON.stringify(headerObj, null, 4).replace(/\n/g, "\n  ")},\n`;
    }
    if (method !== "GET" && method !== "HEAD" && body.trim()) {
      js += `  body: JSON.stringify(${body.replace(/\n/g, "\n  ")})\n`;
    }
    js += `})\n.then(res => res.json())\n.then(data => console.log(data));`;
    setJsCode(js);

    // Generate Python
    let py = `import requests\n\nurl = "${url}"\n`;
    if (Object.keys(headerObj).length > 0) {
      py += `headers = ${JSON.stringify(headerObj, null, 4)}\n`;
    } else {
      py += `headers = {}\n`;
    }
    if (method !== "GET" && method !== "HEAD" && body.trim()) {
      py += `payload = ${body}\n`;
      py += `response = requests.${method.toLowerCase()}(url, headers=headers, json=payload)\n`;
    } else {
      py += `response = requests.${method.toLowerCase()}(url, headers=headers)\n`;
    }
    py += `print(response.json())`;
    setPythonCode(py);

    // Generate Go
    let go = `package main\n\nimport (\n\t"fmt"\n\t"net/http"\n\t"strings"\n\t"io"\n)\n\nfunc main() {\n`;
    if (method !== "GET" && method !== "HEAD" && body.trim()) {
      go += `\tpayload := strings.NewReader(\`${body}\`)\n`;
      go += `\treq, _ := http.NewRequest("${method}", "${url}", payload)\n`;
    } else {
      go += `\treq, _ := http.NewRequest("${method}", "${url}", nil)\n`;
    }
    headers.forEach(h => {
      if (h.key.trim()) {
        go += `\treq.Header.Add("${h.key.trim()}", "${h.value.trim()}")\n`;
      }
    });
    go += `\tres, _ := http.DefaultClient.Do(req)\n\tdefer res.Body.Close()\n\tbody, _ := io.ReadAll(res.Body)\n\tfmt.Println(string(body))\n}`;
    setGoCode(go);

    // Generate PHP cURL
    let php = `<?php\n\n$curl = curl_init();\n\ncurl_setopt_array($curl, [\n`;
    php += `  CURLOPT_URL => '${url}',\n`;
    php += `  CURLOPT_RETURNTRANSFER => true,\n`;
    php += `  CURLOPT_CUSTOMREQUEST => '${method}',\n`;
    if (method !== "GET" && method !== "HEAD" && body.trim()) {
      php += `  CURLOPT_POSTFIELDS => '${body.replace(/'/g, "\\'")}',\n`;
    }
    if (Object.keys(headerObj).length > 0) {
      php += `  CURLOPT_HTTPHEADER => [\n`;
      headers.forEach(h => {
        if (h.key.trim()) {
          php += `    '${h.key.trim()}: ${h.value.trim()}',\n`;
        }
      });
      php += `  ],\n`;
    }
    php += `]);\n\n$response = curl_exec($curl);\ncurl_close($curl);\necho $response;`;
    setPhpCode(php);

  }, [method, url, headers, body]);

  const copyToClipboard = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActiveCode = () => {
    switch (activeLang) {
      case "curl": return curlCmd;
      case "js": return jsCode;
      case "python": return pythonCode;
      case "go": return goCode;
      case "php": return phpCode;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Configure Request */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-lg font-bold">Pengaturan Request</h3>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="h-11 px-3 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-bold text-sm w-full sm:w-28 text-center"
          >
            {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 min-w-0 h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
            placeholder="URL Endpoint"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Headers</label>
          {headers.map((h, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                value={h.key}
                onChange={(e) => updateHeader(idx, "key", e.target.value)}
                placeholder="Header Name"
                className="flex-1 min-w-0 h-9 px-3 bg-background border border-foreground/15 rounded-lg text-xs font-mono"
              />
              <input
                type="text"
                value={h.value}
                onChange={(e) => updateHeader(idx, "value", e.target.value)}
                placeholder="Value"
                className="flex-1 min-w-0 h-9 px-3 bg-background border border-foreground/15 rounded-lg text-xs font-mono"
              />
              <button
                onClick={() => removeHeader(idx)}
                className="text-red-500 hover:text-red-600 text-sm font-bold w-9 h-9 border border-red-500/20 rounded-lg hover:bg-red-500/5"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addHeader}
            className="w-full h-9 border border-dashed border-foreground/15 rounded-lg text-xs font-bold hover:bg-foreground/5 transition-colors"
          >
            + Add Header
          </button>
        </div>

        {method !== "GET" && (
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-foreground/50 block">Request Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-32 p-4 bg-background border border-foreground/15 rounded-lg font-mono text-xs focus:outline-none focus:border-primary resize-y"
              placeholder="JSON payload..."
            />
          </div>
        )}
      </div>

      {/* Generated Code Output */}
      <div className="space-y-6">
        <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between h-full min-h-[380px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Code Snippet</h3>
              <button
                onClick={() => copyToClipboard(getActiveCode())}
                className="bg-foreground text-background text-xs font-mono px-3 py-1 rounded hover:opacity-95 transition-opacity"
              >
                {copied ? "Copied! ✓" : "Copy Code"}
              </button>
            </div>

            {/* Language tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar border-b border-foreground/10">
              {(["curl", "js", "python", "go", "php"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors uppercase ${
                    activeLang === lang ? "bg-foreground text-background" : "bg-background border border-foreground/10"
                  }`}
                >
                  {lang === "js" ? "JS Fetch" : lang}
                </button>
              ))}
            </div>

            <div className="bg-background border border-foreground/10 rounded-lg p-4 overflow-auto max-h-72">
              <pre className="text-xs font-mono whitespace-pre-wrap">{getActiveCode()}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
