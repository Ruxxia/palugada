import { useState } from "react";

export function YamlJsonConverter() {
  const [yamlInput, setYamlInput] = useState("server:\n  port: 8080\n  host: localhost\ndatabase:\n  user: root\n  enabled: true");
  const [jsonInput, setJsonInput] = useState("{\n  \"server\": {\n    \"port\": 8080,\n    \"host\": \"localhost\"\n  },\n  \"database\": {\n    \"user\": \"root\",\n    \"enabled\": true\n  }\n}");
  
  const [error, setError] = useState("");
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Helper: recursive json to yaml conversion
  const jsonToYaml = (obj: any, depth = 0): string => {
    const indent = "  ".repeat(depth);
    if (obj === null) return "null";
    if (typeof obj === "string") return `"${obj}"`;
    if (typeof obj !== "object") return String(obj);
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return "[]";
      return obj.map(item => `\n${indent}- ${jsonToYaml(item, depth + 1).trim()}`).join("");
    }

    const keys = Object.keys(obj);
    if (keys.length === 0) return "{}";

    return keys.map(key => {
      const val = obj[key];
      const formattedVal = jsonToYaml(val, depth + 1);
      if (typeof val === "object" && val !== null) {
        return `\n${indent}${key}:${formattedVal}`;
      }
      return `\n${indent}${key}: ${formattedVal}`;
    }).join("").trim();
  };

  // Helper: simple yaml to json parsing
  const yamlToJson = (yaml: string): any => {
    const lines = yaml.split("\n");
    const root: any = {};
    const stack: { indent: number; obj: any; key?: string }[] = [{ indent: -1, obj: root }];

    const parseValue = (val: string): any => {
      const v = val.trim();
      if (v === "true") return true;
      if (v === "false") return false;
      if (v === "null") return null;
      if (!isNaN(Number(v)) && v !== "") return Number(v);
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        return v.substring(1, v.length - 1);
      }
      return v;
    };

    for (let line of lines) {
      if (!line.trim() || line.trim().startsWith("#")) continue;

      const matchLeading = line.match(/^(\s*)/);
      const indent = matchLeading ? matchLeading[1].length : 0;
      const content = line.trim();

      // Handle simple list items
      if (content.startsWith("-")) {
        const itemContent = content.substring(1).trim();
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
          stack.pop();
        }
        const parent = stack[stack.length - 1];
        let arrayContainer = parent.obj;

        if (parent.key) {
          if (!Array.isArray(parent.obj[parent.key])) {
            parent.obj[parent.key] = [];
          }
          arrayContainer = parent.obj[parent.key];
        }

        if (itemContent.includes(":")) {
          const colonIdx = itemContent.indexOf(":");
          const k = itemContent.substring(0, colonIdx).trim();
          const v = itemContent.substring(colonIdx + 1).trim();
          const newObj = { [k]: parseValue(v) };
          if (Array.isArray(arrayContainer)) {
            arrayContainer.push(newObj);
          }
          stack.push({ indent: indent + 2, obj: newObj, key: k });
        } else {
          if (Array.isArray(arrayContainer)) {
            arrayContainer.push(parseValue(itemContent));
          }
        }
        continue;
      }

      const colonIdx = content.indexOf(":");
      if (colonIdx !== -1) {
        const key = content.substring(0, colonIdx).trim();
        const rawVal = content.substring(colonIdx + 1).trim();
        const val = parseValue(rawVal);

        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
          stack.pop();
        }

        const parent = stack[stack.length - 1];
        const targetObj = parent.key && typeof parent.obj[parent.key] === "object" && !Array.isArray(parent.obj[parent.key])
          ? parent.obj[parent.key] 
          : parent.obj;

        if (rawVal === "") {
          targetObj[key] = {};
          stack.push({ indent, obj: targetObj, key });
        } else {
          targetObj[key] = val;
        }
      }
    }

    return root;
  };

  const convertYamlToJson = () => {
    setError("");
    try {
      const parsed = yamlToJson(yamlInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch (err: any) {
      setError(`Gagal konversi YAML ke JSON: ${err.message}`);
    }
  };

  const convertJsonToYaml = () => {
    setError("");
    try {
      const parsed = JSON.parse(jsonInput);
      const yaml = jsonToYaml(parsed);
      setYamlInput(yaml);
    } catch (err: any) {
      setError(`Gagal konversi JSON ke YAML: ${err.message}`);
    }
  };

  const copyYaml = () => {
    navigator.clipboard.writeText(yamlInput);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-mono">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* YAML Pane */}
        <div className="space-y-4 bg-card border border-foreground/10 p-6 rounded-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">YAML</h3>
            <button
              onClick={copyYaml}
              className="bg-foreground/5 text-foreground hover:bg-foreground/10 text-[10px] font-mono px-2.5 py-1 rounded transition-colors"
            >
              {copiedYaml ? "Copied! ✓" : "Copy YAML"}
            </button>
          </div>
          <textarea
            value={yamlInput}
            onChange={(e) => setYamlInput(e.target.value)}
            className="w-full h-80 p-4 bg-background border border-foreground/15 rounded-lg font-mono text-xs focus:outline-none focus:border-primary resize-y"
            placeholder="Ketik atau tempel YAML..."
          />
          <button
            onClick={convertYamlToJson}
            className="w-full bg-foreground text-background h-11 rounded-lg font-bold hover:opacity-90 transition-opacity uppercase tracking-wider text-xs"
          >
            Konversi YAML ➔ JSON
          </button>
        </div>

        {/* JSON Pane */}
        <div className="space-y-4 bg-card border border-foreground/10 p-6 rounded-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">JSON</h3>
            <button
              onClick={copyJson}
              className="bg-foreground/5 text-foreground hover:bg-foreground/10 text-[10px] font-mono px-2.5 py-1 rounded transition-colors"
            >
              {copiedJson ? "Copied! ✓" : "Copy JSON"}
            </button>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-80 p-4 bg-background border border-foreground/15 rounded-lg font-mono text-xs focus:outline-none focus:border-primary resize-y"
            placeholder="Ketik atau tempel JSON..."
          />
          <button
            onClick={convertJsonToYaml}
            className="w-full bg-foreground text-background h-11 rounded-lg font-bold hover:opacity-90 transition-opacity uppercase tracking-wider text-xs"
          >
            Konversi JSON ➔ YAML
          </button>
        </div>
      </div>
    </div>
  );
}
