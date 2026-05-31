import { useState, useRef } from "react";

export function WhatsappTextFormatter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapText = (symbolBefore: string, symbolAfter = symbolBefore) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selected = currentText.substring(start, end);

    const replacement = symbolBefore + (selected || "teks") + symbolAfter;
    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);

    setText(newText);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbolBefore.length, start + symbolBefore.length + (selected || "teks").length);
    }, 50);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderPreview = () => {
    if (!text) {
      return <span className="text-foreground/30 italic">Preview format chat Anda akan muncul di sini...</span>;
    }

    // A simple regex parser for WhatsApp styling for preview simulation
    let parsed = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Monospace: ```text```
    parsed = parsed.replace(/```([\s\S]+?)```/g, '<code class="font-mono bg-foreground/5 p-0.5 rounded text-xs">$1</code>');
    // Bold: *text*
    parsed = parsed.replace(/\*([^\*]+?)\*/g, "<strong>$1</strong>");
    // Italic: _text_
    parsed = parsed.replace(/_([^_]+?)_/g, "<em>$1</em>");
    // Strikethrough: ~text~
    parsed = parsed.replace(/~([^~]+?)~/g, "<del>$1</del>");
    // Newlines
    parsed = parsed.replace(/\n/g, "<br />");

    return <div dangerouslySetInnerHTML={{ __html: parsed }} className="whitespace-pre-wrap leading-relaxed text-sm break-words" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor Panel */}
      <div className="space-y-6 bg-card border border-foreground/10 p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Editor WhatsApp</h3>
          <button
            onClick={() => setText("")}
            className="text-xs font-bold text-red-500 hover:underline"
          >
            Clear
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-foreground/5 rounded-lg border border-foreground/10">
          <button
            onClick={() => wrapText("*")}
            className="px-3 py-1.5 bg-background border border-foreground/10 rounded font-bold text-sm hover:bg-foreground/5 transition-colors"
            title="Bold"
          >
            B
          </button>
          <button
            onClick={() => wrapText("_")}
            className="px-3 py-1.5 bg-background border border-foreground/10 rounded italic text-sm hover:bg-foreground/5 transition-colors"
            title="Italic"
          >
            I
          </button>
          <button
            onClick={() => wrapText("~")}
            className="px-3 py-1.5 bg-background border border-foreground/10 rounded line-through text-sm hover:bg-foreground/5 transition-colors"
            title="Strikethrough"
          >
            S
          </button>
          <button
            onClick={() => wrapText("```")}
            className="px-3 py-1.5 bg-background border border-foreground/10 rounded font-mono text-xs hover:bg-foreground/5 transition-colors"
            title="Monospace"
          >
            {"</>"}
          </button>
        </div>

        <div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis pesan WhatsApp Anda di sini... Sorot kata dan klik tombol editor di atas untuk memformat."
            rows={8}
            className="w-full p-4 bg-background border border-foreground/15 rounded-lg focus:outline-none focus:border-primary text-sm resize-y"
          />
        </div>
      </div>

      {/* Preview Panel */}
      <div className="space-y-6 bg-foreground/5 border border-foreground/10 p-6 rounded-xl flex flex-col justify-between min-h-[300px]">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-foreground/50">Preview Percakapan</h3>
            {text && (
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-lg hover:bg-foreground/90 transition-colors"
              >
                {copied ? "Copied! ✓" : "Salin Format"}
              </button>
            )}
          </div>

          {/* Chat Bubble Style Preview */}
          <div className="bg-background border border-foreground/10 rounded-xl p-4 min-h-[160px] flex items-start">
            <div className="flex-1 min-w-0 bg-[#e7ffdb] dark:bg-[#056162] text-black dark:text-white p-3.5 rounded-lg shadow-sm border border-foreground/5 relative max-w-[90%]">
              {renderPreview()}
              <span className="block text-[9px] text-foreground/40 text-right mt-1.5 font-mono">10:00 ✓✓</span>
            </div>
          </div>
        </div>

        {text && (
          <p className="text-xs text-foreground/45 text-center mt-2">
            Klik tombol "Salin Format" untuk menyalin teks dengan simbol pemformatan WhatsApp bawaan.
          </p>
        )}
      </div>
    </div>
  );
}
