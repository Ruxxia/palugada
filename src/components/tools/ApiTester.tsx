import { useState } from "react";

interface HeaderItem {
  key: string;
  value: string;
}

export function ApiTester() {
  const [method, setMethod] = useState<string>("GET");
  const [url, setUrl] = useState<string>("https://jsonplaceholder.typicode.com/todos/1");
  const [headers, setHeaders] = useState<HeaderItem[]>([{ key: "Content-Type", value: "application/json" }]);
  const [body, setBody] = useState<string>("{\n  \"title\": \"foo\",\n  \"body\": \"bar\",\n  \"userId\": 1\n}");
  const [activeTab, setActiveTab] = useState<"headers" | "body">("headers");

  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<string>("");
  const [timeTaken, setTimeTaken] = useState<number | null>(null);

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

  const sendRequest = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseHeaders({});
    setResponseBody("");
    setTimeTaken(null);

    const startTime = performance.now();

    try {
      const headerObj: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.key.trim()) {
          headerObj[h.key.trim()] = h.value;
        }
      });

      const options: RequestInit = {
        method,
        headers: headerObj,
      };

      if (method !== "GET" && method !== "HEAD" && body.trim()) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      setTimeTaken(Math.round(endTime - startTime));

      setResponseStatus(res.status);

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });
      setResponseHeaders(resHeaders);

      const text = await res.text();
      try {
        const parsed = JSON.parse(text);
        setResponseBody(JSON.stringify(parsed, null, 2));
      } catch {
        setResponseBody(text);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setTimeTaken(Math.round(endTime - startTime));
      setResponseBody(`Error: ${err.message}\nPastikan URL valid dan CORS diizinkan.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Request Panel */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <h3 className="text-lg font-bold">Kirim API Request</h3>

        {/* Method & URL Bar */}
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="h-11 px-3 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-bold text-sm"
          >
            {["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 h-11 px-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
            placeholder="https://api.example.com/endpoint"
          />
          <button
            onClick={sendRequest}
            disabled={isLoading}
            className="bg-primary text-primary-foreground px-6 h-11 rounded-lg font-bold hover:opacity-90 transition-opacity uppercase tracking-wider text-xs"
          >
            {isLoading ? "Loading..." : "Send"}
          </button>
        </div>

        {/* Headers / Body Tabs */}
        <div className="space-y-4">
          <div className="flex border-b border-foreground/10">
            <button
              onClick={() => setActiveTab("headers")}
              className={`pb-2 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === "headers" ? "border-primary text-primary" : "border-transparent text-foreground/50"
              }`}
            >
              Headers ({headers.filter(h => h.key).length})
            </button>
            <button
              onClick={() => setActiveTab("body")}
              className={`pb-2 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === "body" ? "border-primary text-primary" : "border-transparent text-foreground/50"
              }`}
            >
              Body (Payload)
            </button>
          </div>

          {activeTab === "headers" ? (
            <div className="space-y-3">
              {headers.map((h, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={h.key}
                    onChange={(e) => updateHeader(idx, "key", e.target.value)}
                    placeholder="Key"
                    className="flex-1 h-9 px-3 bg-background border border-foreground/15 rounded-lg text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={(e) => updateHeader(idx, "value", e.target.value)}
                    placeholder="Value"
                    className="flex-1 h-9 px-3 bg-background border border-foreground/15 rounded-lg text-xs font-mono"
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
          ) : (
            <div className="space-y-2">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-48 p-4 bg-background border border-foreground/15 rounded-lg font-mono text-xs focus:outline-none focus:border-primary resize-y"
                placeholder="JSON body..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Response Panel */}
      <div className="space-y-6">
        <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Response</h3>
              {responseStatus !== null && (
                <div className="flex gap-3 text-xs font-mono font-bold">
                  <span className={responseStatus >= 200 && responseStatus < 300 ? "text-green-500" : "text-red-500"}>
                    STATUS: {responseStatus}
                  </span>
                  {timeTaken && <span className="text-foreground/45">TIME: {timeTaken}ms</span>}
                </div>
              )}
            </div>

            {responseBody ? (
              <div className="space-y-4">
                <div className="bg-background border border-foreground/10 rounded-lg p-4 overflow-auto max-h-[300px]">
                  <pre className="text-xs font-mono whitespace-pre-wrap">{responseBody}</pre>
                </div>

                {Object.keys(responseHeaders).length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-foreground/60 block">Headers:</span>
                    <div className="bg-background border border-foreground/10 rounded-lg p-3 overflow-auto max-h-40 font-mono text-[10px] space-y-1">
                      {Object.entries(responseHeaders).map(([key, val]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-foreground/45">{key}:</span>
                          <span>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-foreground/40 text-sm py-24 text-center">
                Response API akan muncul di sini setelah Anda mengirim request.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
