import { useState } from "react";

export function XmlFormatter() {
  const [input, setInput] = useState("<note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don't forget me this weekend!</body></note>");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const formatXmlString = () => {
    setError("");
    setOutput("");

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input.trim(), "application/xml");
      
      const parseErrors = xmlDoc.getElementsByTagName("parsererror");
      if (parseErrors.length > 0) {
        setError(parseErrors[0].textContent || "Syntax Error pada XML.");
        return;
      }

      let formatted = "";
      const indent = "  ";

      const serialize = (node: Node, depth: number) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const elem = node as Element;
          const indentStr = indent.repeat(depth);
          formatted += `${indentStr}<${elem.tagName}`;
          
          // Attributes
          for (let i = 0; i < elem.attributes.length; i++) {
            const attr = elem.attributes[i];
            formatted += ` ${attr.name}="${attr.value}"`;
          }

          if (elem.childNodes.length === 0) {
            formatted += " />\n";
          } else {
            formatted += ">";
            const hasElementChildren = Array.from(elem.childNodes).some(
              (c) => c.nodeType === Node.ELEMENT_NODE
            );
            
            if (hasElementChildren) {
              formatted += "\n";
              elem.childNodes.forEach((child) => serialize(child, depth + 1));
              formatted += `${indentStr}</${elem.tagName}>\n`;
            } else {
              formatted += elem.textContent;
              formatted += `</${elem.tagName}>\n`;
            }
          }
        } else if (node.nodeType === Node.COMMENT_NODE) {
          formatted += `${indent.repeat(depth)}<!--${node.textContent}-->\n`;
        }
      };

      // Process root children (ignoring declaration if any for simple output)
      xmlDoc.childNodes.forEach((child) => serialize(child, 0));
      setOutput(formatted.trim());
    } catch (err: any) {
      setError(err.message || "Gagal memproses XML.");
    }
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
        <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">XML Input</h3>
        
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-80 p-4 bg-background border border-foreground/15 rounded-lg font-mono text-xs focus:outline-none focus:border-primary resize-y"
          placeholder="Tulis XML di sini..."
        />

        <button
          onClick={formatXmlString}
          className="w-full bg-foreground text-background h-11 rounded-lg font-bold hover:opacity-90 transition-opacity uppercase tracking-wider text-xs"
        >
          Format XML
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
                {copied ? "Copied! ✓" : "Copy XML"}
              </button>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-mono whitespace-pre-wrap">
              {error}
            </div>
          )}

          {output ? (
            <div className="bg-background border border-foreground/10 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-xs font-mono whitespace-pre">{output}</pre>
            </div>
          ) : (
            !error && (
              <div className="text-foreground/40 text-sm py-24 text-center">
                Hasil XML yang diformat akan muncul di sini.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
